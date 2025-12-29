"""
Test script to verify Groq API setup
Run this to check if your Groq API key and SDK are working correctly
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("="*60)
print("GROQ API VERIFICATION TEST")
print("="*60)

# Check if API key exists
api_key = os.getenv('GROQ_API_KEY')
if not api_key:
    print("❌ ERROR: GROQ_API_KEY not found in .env file")
    print("\nPlease add your Groq API key to backend/.env:")
    print("GROQ_API_KEY=your_actual_api_key_here")
    exit(1)

print(f"✓ API Key found: {api_key[:15]}...{api_key[-5:]}")

# Try importing Groq
try:
    from groq import Groq
    print("✓ Groq SDK imported successfully")
except ImportError as e:
    print(f"❌ ERROR: Could not import Groq SDK: {e}")
    print("\nPlease install: pip install groq")
    exit(1)

# Try creating client
try:
    client = Groq(api_key=api_key)
    print("✓ Groq client created successfully")
except Exception as e:
    print(f"❌ ERROR creating Groq client: {e}")
    print(f"Error type: {type(e).__name__}")
    exit(1)

# Try making a simple API call
try:
    print("\nTesting API call...")
    completion = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[
            {
                "role": "user",
                "content": "Say 'hello' in one word"
            }
        ],
        max_tokens=10
    )
    response = completion.choices[0].message.content
    print(f"✓ API call successful! Response: {response}")
    print(f"✓ Model used: {completion.model}")
    
except Exception as e:
    print(f"❌ ERROR making API call: {e}")
    print(f"Error type: {type(e).__name__}")
    exit(1)

print("\n" + "="*60)
print("ALL TESTS PASSED! Groq API is working correctly.")
print("="*60)
