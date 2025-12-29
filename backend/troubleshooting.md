# Troubleshooting Guide

## "Client.__init__() got an unexpected keyword argument 'proxies'" Error

### Cause
This error appears when old Python bytecode (`.pyc` files or `__pycache__` folders) are cached from a previous version that used the groq SDK.

### Solution

**Windows:**
```bash
cd backend
clean_and_restart.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x clean_and_restart.sh
./clean_and_restart.sh
```

### Manual Steps

1. **Delete all cached Python files:**
   ```bash
   # Windows
   for /d /r . %d in (__pycache__) do @if exist "%d" rd /s /q "%d"
   del /s /q *.pyc
   
   # Mac/Linux
   find . -type d -name __pycache__ -exec rm -rf {} +
   find . -type f -name "*.pyc" -delete
   ```

2. **Verify .env file has GROQ_API_KEY:**
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   FLASK_SECRET_KEY=your-secret-key-change-this-in-production
   DATABASE_URL=sqlite:///mcq.db
   ```

3. **Start Flask server:**
   ```bash
   python app.py
   ```

## Other Common Issues

### "GROQ_API_KEY not found"
- Make sure `.env` file exists in `backend/` folder
- Verify `GROQ_API_KEY=` line exists in `.env`
- No spaces around the `=` sign

### "Failed to generate MCQs"
- Check your internet connection
- Verify your Groq API key is valid at https://console.groq.com
- Check backend terminal for detailed error messages
