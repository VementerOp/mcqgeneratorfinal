#!/bin/bash
# Script to fix Groq installation issues

echo "================================"
echo "FIXING GROQ INSTALLATION"
echo "================================"

# Uninstall old version
echo "Uninstalling old groq package..."
pip uninstall groq -y

# Clear pip cache
echo "Clearing pip cache..."
pip cache purge

# Install latest version
echo "Installing latest groq package..."
pip install --no-cache-dir groq

# Verify installation
echo ""
echo "Verifying installation..."
python -c "from groq import Groq; print('✓ Groq SDK installed successfully')"

echo ""
echo "================================"
echo "Done! Now run: python test_groq.py"
echo "================================"
