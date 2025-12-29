#!/bin/bash
echo "Cleaning Python cache and restarting backend..."
echo ""

echo "Step 1: Deleting __pycache__ folders..."
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null
echo "Done!"

echo ""
echo "Step 2: Deleting .pyc files..."
find . -type f -name "*.pyc" -delete
echo "Done!"

echo ""
echo "Step 3: Checking .env file..."
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file with your GROQ_API_KEY"
    exit 1
fi

if ! grep -q "GROQ_API_KEY" .env; then
    echo "ERROR: GROQ_API_KEY not found in .env file!"
    exit 1
fi

echo ".env file looks good!"

echo ""
echo "Step 4: Starting Flask backend..."
python app.py
