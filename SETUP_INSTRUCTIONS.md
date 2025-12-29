# Quick Setup Guide

## Fix "GROQ_API_KEY not found" Error

### Step 1: Get Your Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Click "Create API Key"
5. Copy the key (it starts with `gsk_`)

### Step 2: Create .env File

1. Open your project folder
2. Navigate to the `backend` folder
3. Create a new file named `.env` (note: the file starts with a dot)
4. Add the following content:

```env
# Groq API Configuration (REQUIRED)
GROQ_API_KEY=gsk_your_actual_api_key_here

# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-change-in-production

# Database
DATABASE_URL=sqlite:///mcq.db

# JWT Configuration
JWT_SECRET_KEY=jwt-secret-key-change-in-production
```

5. Replace `gsk_your_actual_api_key_here` with your actual Groq API key

### Step 3: Restart Backend Server

1. Stop the Flask server if it's running (Ctrl+C)
2. Run it again: `python backend/app.py`

### Step 4: Restart Frontend

1. Stop the React server if it's running (Ctrl+C)
2. Navigate to `frontend` folder
3. Run: `npm start`

## Common Issues

### "Failed to load dashboard"
- **Cause**: Backend server not running
- **Solution**: Make sure you run `python backend/app.py` in the backend folder

### "Login to save them permanently" (when already logged in)
- **Cause**: Frontend not detecting authentication properly
- **Solution**: Clear browser localStorage and log in again

### Backend shows "GROQ_API_KEY not found"
- **Cause**: `.env` file doesn't exist or is in wrong location
- **Solution**: Make sure `.env` file is in the `backend` folder (same folder as `app.py`)

## Verify Setup

After setup, you should be able to:
- Login and stay logged in
- Generate MCQs (they will be saved to database)
- View dashboard with your statistics
- Create and take timed tests
- See test history

## File Structure

```
project/
├── backend/
│   ├── app.py
│   ├── mcq_ai.py
│   ├── .env          ← CREATE THIS FILE HERE
│   ├── .env.example
│   └── ...
├── frontend/
│   └── ...
└── README.md
