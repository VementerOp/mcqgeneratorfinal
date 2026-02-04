import os
import requests
from PyPDF2 import PdfReader
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path)

def extract_text_from_pdf(pdf_file):
    """Extract text from uploaded PDF file"""
    try:
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def summarize_with_groq(text, summary_length='medium'):
    """
    Summarize text using Groq API
    
    Args:
        text (str): Input text to summarize
        summary_length (str): Summary length (short/medium/long)
    
    Returns:
        str: Summarized text
    """
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables. Make sure GROQ_API_KEY is set in backend/.env")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Define summary length guidelines
    length_guidelines = {
        'short': '2-3 sentences',
        'medium': '3-5 paragraphs',
        'long': '5-7 paragraphs'
    }

    length_instruction = length_guidelines.get(summary_length, '3-5 paragraphs')

    prompt = f"""Provide a clear, concise summary that captures the main points and key information in {length_instruction}.

Text to summarize:
{text[:3000]}"""

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": "You are an expert summarizer who creates clear, concise summaries that capture the essential information while maintaining readability. Provide only the summary text without any additional commentary."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }

    try:
        print("[v0] Sending request to Groq API for summarization...")
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        print(f"[v0] Response status code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"[v0] Error response: {response.text}")
            raise Exception(f"Groq API returned status {response.status_code}: {response.text}")
        
        data = response.json()
        
        print("\n--- GROQ API RESPONSE ---")
        print(f"Model: {data.get('model', 'llama-3.3-70b-versatile')}")
        
        # Extract summary from Groq response
        summary = data['choices'][0]['message']['content'].strip()
        print(f"Summary generated successfully")
        
        return summary

    except Exception as e:
        print(f"[v0] Error calling Groq API: {e}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Failed to generate summary with Groq: {str(e)}")

def generate_summary(text, summary_length='medium'):
    """
    Main function to generate summary from text using Groq API
    """
    return summarize_with_groq(text, summary_length)

def generate_summary_from_pdf(pdf_file, summary_length='medium'):
    """Generate summary from PDF file using Groq API"""
    text = extract_text_from_pdf(pdf_file)
    if not text:
        raise ValueError("Could not extract text from PDF")
    return summarize_with_groq(text, summary_length)
