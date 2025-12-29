@echo off
REM Script to fix Groq installation issues on Windows

echo ================================
echo FIXING GROQ INSTALLATION
echo ================================

REM Uninstall old version
echo Uninstalling old groq package...
pip uninstall groq -y

REM Clear pip cache
echo Clearing pip cache...
pip cache purge

REM Install latest version
echo Installing latest groq package...
pip install --no-cache-dir groq

REM Verify installation
echo.
echo Verifying installation...
python -c "from groq import Groq; print('Groq SDK installed successfully')"

echo.
echo ================================
echo Done! Now run: python test_groq.py
echo ================================
pause
