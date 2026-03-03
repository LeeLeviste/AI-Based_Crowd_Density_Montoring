import threading
import time
import cv2
from flask import Response


class StreamService:
    """Background service to capture frames from IP camera, run YOLO detection,
    annotate frames, and provide an MJPEG generator for Flask endpoints.
    """

    def __init__(self, detection_service, source_url: str, jpeg_quality: int = 80):
        self.detection_service = detection_service
        self.source_url = source_url
        self.jpeg_quality = int(jpeg_quality)

        self._running = False
        self._thread = None
        self._lock = threading.Lock()
        self.latest_frame = None  # bytes (jpeg)
        self.latest_count = 0
        self._frame_available = threading.Event()

    def start(self):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=2)

    def _capture_loop(self):
        cap = None
        try:
            cap = cv2.VideoCapture(self.source_url)
            if not cap.isOpened():
                # Try without prefix if a common pattern was provided
                raise RuntimeError(f"Could not open video source: {self.source_url}")

            while self._running:
                ret, frame = cap.read()
                if not ret or frame is None:
                    time.sleep(0.1)
                    continue

                # Run detection (uses already-loaded YOLO model)
                result = self.detection_service.process_video_frame(frame, conf_threshold=0.25)
                annotated = result.get('annotated_frame', frame)
                count = result.get('person_count', 0)

                # Overlay count (top-left)
                try:
                    cv2.putText(annotated, f'People: {count}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
                except Exception:
                    pass

                # Encode to JPEG
                encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), self.jpeg_quality]
                ret2, jpeg = cv2.imencode('.jpg', annotated, encode_params)
                if not ret2:
                    time.sleep(0.01)
                    continue

                with self._lock:
                    self.latest_frame = jpeg.tobytes()
                    self.latest_count = count
                    self._frame_available.set()

                # Small sleep to yield; adapt as needed for target FPS
                time.sleep(0.02)

        except Exception as e:
            print(f"StreamService error: {e}")
        finally:
            if cap:
                cap.release()

    def mjpeg_generator(self):
        boundary = b'--frame'
        while self._running:
            # Wait for a frame to be available
            if not self._frame_available.wait(timeout=2.0):
                continue

            with self._lock:
                frame = self.latest_frame
            if frame is None:
                continue

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + f"{len(frame)}".encode() + b'\r\n\r\n' + frame + b'\r\n')

        # Clean up sentinel when stopping
        return
