FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (including FFmpeg for video processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY Group5_Main/backend_GrpNo.5/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY Group5_Main/backend_GrpNo.5/ .

# Copy frontend files to serve as static content
COPY Group5_Main/frontend_GrpNo.5/ ./static/

# Expose port
EXPOSE 5000

# Create necessary directories
RUN mkdir -p uploads/images uploads/processed uploads/videos

# Run the application
CMD ["python", "run.py"]
