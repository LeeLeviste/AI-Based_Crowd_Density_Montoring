#!/usr/bin/env python3
"""
Simple script to run the Flask application
"""
from app import app, init_db, socketio
import os

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    print("Starting CrowdSense API server...")
    print("API available at: http://localhost:5000")
    print("Default admin credentials: admin@crowdsense.ai / admin123")
    
    # Use debug mode only in development (when DEBUG env var is set)
    debug_mode = os.getenv('DEBUG', 'False') == 'True'
    socketio.run(app, host='0.0.0.0', port=5000, debug=debug_mode)
