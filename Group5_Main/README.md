# CrowdSense - AI-Based Crowd Density Monitoring

![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.x-000000?logo=flask&logoColor=white)
![Flask-SocketIO](https://img.shields.io/badge/Flask--SocketIO-Realtime-010101?logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-D71F00?logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)
![YOLOv8](https://img.shields.io/badge/Model-YOLOv8-111827)
![Ultralytics](https://img.shields.io/badge/Ultralytics-AI-111827)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=1f2937)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)


CrowdSense is a full-stack web application for AI-powered crowd detection, counting, and monitoring.
It uses YOLOv8 for person detection and provides a modern web interface for real-time insights.

## Project Structure

Group5_Main/
- backend_GrpNo.5/
  - app.py
  - run.py
  - api.py
  - auth.py
  - models.py
  - detection_service.py
  - requirements.txt
  - uploads/
- frontend_GrpNo.5/
  - index.html
  - login.html
  - signup.html
  - dashboard.html
  - live_camera.html
  - upload-connect.html
  - analytics.html
  - settings.html
  - app.js
  - api.js
  - styles.css
  - public/
    - hero.webp

## Key Features

- AI-powered person detection using YOLOv8
- JWT authentication (register/login)
- Landing page with animated sections
- Dashboard metrics and crowd analytics
- Upload and process image/video files
- Live stream support
- Zone and camera management

## Landing Page

The app root now opens the landing page directly.

- URL: http://localhost:5000/
- Hero image source: frontend_GrpNo.5/public/hero.webp
- Includes sections for:
  - How CrowdSense Works
  - Features
  - Use Cases
- Scroll reveal animations and count-up stats are enabled.

## Requirements

- Python 3.8+
- pip
- Windows, Linux, or macOS

## Setup

1. Open a terminal in Group5_Main/backend_GrpNo.5
2. Create and activate a virtual environment (recommended)
3. Install dependencies:
   pip install -r requirements.txt

Optional environment variables:
- SECRET_KEY
- JWT_SECRET_KEY
- DATABASE_URL (default uses SQLite)
- UPLOAD_FOLDER (default: uploads)

## Run the Application

From Group5_Main/backend_GrpNo.5:

python run.py

Server starts at:
- http://localhost:5000

## Default Admin Account

- Email: admin@crowdsense.ai
- Password: admin123

## Frontend Access Paths

When backend is running:
- Landing: / 
- Login: /login.html
- Signup: /signup.html
- Dashboard: /dashboard.html
- Analytics: /analytics.html
- Upload: /upload-connect.html
- Live Camera: /live_camera.html
- Settings: /settings.html

## API Base

- Base URL: http://localhost:5000/api

Main endpoint groups:
- /api/auth
- /api/dashboard
- /api/analytics
- /api/upload
- /api/cameras
- /api/zones
- /api/stream

## Notes

- First run initializes the database automatically.
- YOLO model file yolov8n.pt is included in backend_GrpNo.5.
- Uploaded and processed files are saved under backend_GrpNo.5/uploads.

## Troubleshooting

- If port 5000 is in use, stop the conflicting process or change the port in run.py/app.py.
- If frontend styles/scripts do not refresh, hard refresh the browser.
- If login fails repeatedly, clear local storage and retry.
