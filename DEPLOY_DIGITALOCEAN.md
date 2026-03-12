# Digital Ocean Deployment Guide

## Quick Deploy Steps

1. **Connect your GitHub repo** to Digital Ocean
2. **Click "Create App"** → Select your repository
3. **Click "Edit" → "Source Directory"** and leave it as **root** (already configured with Dockerfile)
4. **Configure Environment Variables:**
   - Go to **Settings** → **Environment**
   - Add these variables:

   ```
   SECRET_KEY=your-secure-random-key-here
   JWT_SECRET_KEY=your-jwt-secure-key-here
   DATABASE_URL=sqlite:///crowd_monitoring.db
   DEBUG=False
   ```

5. **Click "Deploy"** and wait 5-10 minutes

## Access Your App

Once deployed, your app will be available at: `https://your-app-name.ondigitalocean.app`

**Default Login:**
- Email: `admin@crowdsense.ai`
- Password: `admin123`

⚠️ **Important:** Change these credentials immediately after first login!

## Features Included

✅ Full Flask backend with API  
✅ Frontend HTML/CSS/JS served automatically  
✅ Database (SQLite) included  
✅ Real-time WebSocket support  
✅ FFmpeg for video processing  
✅ Authentication & JWT tokens  

## Database Persistence

Your SQLite database will be stored in the app's file system. For production, consider upgrading to PostgreSQL:
- Add PostgreSQL plugin in Digital Ocean
- Update `DATABASE_URL` to your PostgreSQL connection string

## Troubleshooting

If deployment fails:
- Check the **Build Logs** and **Runtime Logs** in Digital Ocean dashboard
- Ensure all environment variables are set
- Make sure the Dockerfile is in the root directory
