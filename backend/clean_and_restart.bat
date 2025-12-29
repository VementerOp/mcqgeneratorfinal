@echo off
echo Cleaning Python cache and restarting backend...
echo.

echo Step 1: Deleting __pycache__ folders...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
echo Done!

echo.
echo Step 2: Deleting .pyc files...
del /s /q *.pyc 2>nul
echo Done!

echo.
echo Step 3: Checking .env file...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with your GROQ_API_KEY
    pause
    exit /b 1
)

findstr /C:"GROQ_API_KEY" .env >nul
if errorlevel 1 (
    echo ERROR: GROQ_API_KEY not found in .env file!
    pause
    exit /b 1
)

echo .env file looks good!

echo.
echo Step 4: Starting Flask backend...
python app.py

pause
