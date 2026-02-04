import os
import json
import re
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

def extract_json(text):
    """Extract JSON array from AI response text using regex"""
    try:
        text = text.strip()
        
        # Remove markdown code blocks if present
        text = re.sub(r'\`\`\`json\s*', '', text)
        text = re.sub(r'\`\`\`\s*', '', text)
        
        # Find JSON array
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print("JSON PARSE ERROR:", e)
    return []

def generate_mcqs_with_groq(text, num_questions=5, difficulty='medium'):
    """
    Generate MCQs using Groq API with direct HTTP requests
    
    Args:
        text (str): Input text to generate MCQs from
        num_questions (int): Number of MCQs to generate
        difficulty (str): Difficulty level (easy/medium/hard)
    
    Returns:
        list: List of MCQ dictionaries
    """
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        print("\n" + "="*60)
        print("[v0] ERROR: GROQ_API_KEY NOT FOUND")
        print("="*60)
        print("Current working directory:", os.getcwd())
        print("\nTo fix this:")
        print("1. Make sure '.env' file exists in the 'backend' folder")
        print("2. Add this line: GROQ_API_KEY=your_actual_groq_api_key")
        print("3. Restart the Flask server")
        print("="*60 + "\n")
        raise ValueError("GROQ_API_KEY not found in environment variables. Make sure GROQ_API_KEY is set in backend/.env")
    
    print(f"[v0] Using Groq API key: {api_key[:10]}...{api_key[-5:]}")

    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    prompt = f"""Generate exactly {num_questions} multiple choice questions from the following text.

Difficulty level: {difficulty}

Rules:
- Create exactly 4 options (A, B, C, D) for each question
- Only ONE option should be correct
- Questions should test understanding of the content
- Return ONLY valid JSON array, no additional text
- No markdown formatting, no code blocks

Required JSON format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "answer": "Option A text"
  }}
]

Text to generate questions from:
{text[:3000]}"""

    payload = {
        "model": "llama-3.3-70b-versatile",  # Updated from deprecated mixtral-8x7b-32768 to llama-3.3-70b-versatile
        "messages": [
            {
                "role": "system",
                "content": "You are an expert educator who creates high-quality multiple choice questions. Always return valid JSON arrays only, with no additional formatting or text."
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
        print("[v0] Sending request to Groq API...")
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        print(f"[v0] Response status code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"[v0] Error response: {response.text}")
            raise Exception(f"Groq API returned status {response.status_code}: {response.text}")
        
        data = response.json()
        
        print("\n--- GROQ API RESPONSE ---")
        print(f"Model used: {data.get('model', 'unknown')}")
        print(f"Tokens used: {data.get('usage', {})}")
        
        raw_text = data['choices'][0]['message']['content'].strip()
        print(f"Raw response: {raw_text[:200]}...")
        
        mcqs = extract_json(raw_text)
        
        if not mcqs:
            print("WARNING: Could not extract valid JSON from response")
            return []
        
        print(f"Successfully parsed {len(mcqs)} MCQs")
        
        formatted_mcqs = []
        for mcq in mcqs:
            if 'question' in mcq and 'options' in mcq and 'answer' in mcq:
                options = mcq['options']
                
                # Ensure options is a list
                if not isinstance(options, list):
                    print(f"[v0] Skipping question - options is not a list: {type(options)}")
                    continue
                
                # Ensure we have at least 4 options
                if len(options) < 4:
                    print(f"[v0] Skipping question - not enough options: {len(options)}")
                    continue
                
                # Convert all options to strings safely
                try:
                    option_a = str(options[0]) if options[0] is not None else ""
                    option_b = str(options[1]) if options[1] is not None else ""
                    option_c = str(options[2]) if options[2] is not None else ""
                    option_d = str(options[3]) if options[3] is not None else ""
                except (IndexError, TypeError) as e:
                    print(f"[v0] Error accessing options: {e}")
                    continue
                
                formatted_mcq = {
                    'question': str(mcq['question']),
                    'option_a': option_a,
                    'option_b': option_b,
                    'option_c': option_c,
                    'option_d': option_d,
                    'correct_answer': 'A',  # Default to A
                    'difficulty': difficulty
                }
                
                # Find which option matches the correct answer
                answer_text = str(mcq['answer']).strip()
                option_list = [option_a, option_b, option_c, option_d]
                
                for i in range(4):  # Use explicit range(4) instead of min()
                    if option_list[i].strip() == answer_text:
                        formatted_mcq['correct_answer'] = ['A', 'B', 'C', 'D'][i]
                        break
                
                formatted_mcqs.append(formatted_mcq)
                print(f"[v0] Successfully formatted MCQ: {formatted_mcq['question'][:50]}...")
        
        print(f"[v0] Formatted {len(formatted_mcqs)} MCQs successfully")
        
        # Return exactly the number requested, or all if less
        result = formatted_mcqs[:int(num_questions)]
        print(f"[v0] Returning {len(result)} MCQs")
        return result

    except Exception as e:
        print(f"[v0] Error calling Groq API: {e}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Failed to generate MCQs with Groq: {str(e)}")

def generate_mcqs(text, num_questions=5, difficulty='medium'):
    """
    Main function to generate MCQs from text using Groq API
    """
    return generate_mcqs_with_groq(text, num_questions, difficulty)

def generate_mcqs_from_pdf(pdf_file, num_questions=5, difficulty='medium'):
    """Generate MCQs from PDF file using Groq API"""
    text = extract_text_from_pdf(pdf_file)
    if not text:
        raise ValueError("Could not extract text from PDF")
    return generate_mcqs_with_groq(text, num_questions, difficulty)

def generate_mcqs_from_topic(topic, num_questions=5, difficulty='medium'):
    """
    Generate MCQs based on a topic name using Groq API.
    The AI will use its knowledge to create questions about the topic.
    
    Args:
        topic (str): The topic name to generate MCQs about
        num_questions (int): Number of MCQs to generate
        difficulty (str): Difficulty level (easy/medium/hard)
    
    Returns:
        list: List of MCQ dictionaries
    """
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        print("\n" + "="*60)
        print("[v0] ERROR: GROQ_API_KEY NOT FOUND")
        print("="*60)
        raise ValueError("GROQ_API_KEY not found in environment variables. Make sure GROQ_API_KEY is set in backend/.env")
    
    print(f"[v0] Generating MCQs from topic: {topic}")
    print(f"[v0] Using Groq API key: {api_key[:10]}...{api_key[-5:]}")

    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Difficulty-specific instructions
    difficulty_instructions = {
        'easy': 'Create basic, straightforward questions that test fundamental understanding. Questions should be simple and direct.',
        'medium': 'Create moderately challenging questions that test deeper understanding. Include some questions that require application of concepts.',
        'hard': 'Create challenging questions that test advanced understanding. Include questions requiring analysis, synthesis, or application of multiple concepts.'
    }

    prompt = f"""You are an expert educator creating a quiz about "{topic}".

Generate exactly {num_questions} high-quality multiple choice questions about {topic}.

Difficulty level: {difficulty.upper()}
{difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}

IMPORTANT RULES:
1. Create exactly 4 options (A, B, C, D) for each question
2. Only ONE option should be the correct answer
3. Questions should be factually accurate and educational
4. Cover different aspects/subtopics of "{topic}"
5. Make incorrect options plausible but clearly wrong
6. Return ONLY valid JSON array, no additional text or markdown

Required JSON format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "answer": "The correct option text (must match exactly one of the options)"
  }}
]

Generate {num_questions} questions about: {topic}"""

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": "You are an expert educator who creates high-quality, factually accurate multiple choice questions. You have comprehensive knowledge across all subjects. Always return valid JSON arrays only, with no additional formatting or text. Ensure all facts in your questions are accurate and verifiable."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.5,  # Lower temperature for more accurate, factual responses
        "max_tokens": 3000
    }

    try:
        print("[v0] Sending topic-based request to Groq API...")
        response = requests.post(url, headers=headers, json=payload, timeout=90)
        
        print(f"[v0] Response status code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"[v0] Error response: {response.text}")
            raise Exception(f"Groq API returned status {response.status_code}: {response.text}")
        
        data = response.json()
        
        print("\n--- GROQ API RESPONSE (TOPIC-BASED) ---")
        print(f"Model used: {data.get('model', 'unknown')}")
        print(f"Tokens used: {data.get('usage', {})}")
        
        raw_text = data['choices'][0]['message']['content'].strip()
        print(f"Raw response: {raw_text[:200]}...")
        
        mcqs = extract_json(raw_text)
        
        if not mcqs:
            print("WARNING: Could not extract valid JSON from response")
            return []
        
        print(f"Successfully parsed {len(mcqs)} MCQs from topic")
        
        # Format MCQs to match expected structure
        formatted_mcqs = []
        for mcq in mcqs:
            if 'question' in mcq and 'options' in mcq and 'answer' in mcq:
                options = mcq['options']
                
                if not isinstance(options, list) or len(options) < 4:
                    print(f"[v0] Skipping question - invalid options")
                    continue
                
                try:
                    option_a = str(options[0]) if options[0] is not None else ""
                    option_b = str(options[1]) if options[1] is not None else ""
                    option_c = str(options[2]) if options[2] is not None else ""
                    option_d = str(options[3]) if options[3] is not None else ""
                except (IndexError, TypeError) as e:
                    print(f"[v0] Error accessing options: {e}")
                    continue
                
                formatted_mcq = {
                    'question': str(mcq['question']),
                    'option_a': option_a,
                    'option_b': option_b,
                    'option_c': option_c,
                    'option_d': option_d,
                    'correct_answer': 'A',  # Default to A
                    'difficulty': difficulty
                }
                
                # Find which option matches the correct answer
                answer_text = str(mcq['answer']).strip()
                option_list = [option_a, option_b, option_c, option_d]
                
                for i in range(4):
                    if option_list[i].strip() == answer_text:
                        formatted_mcq['correct_answer'] = ['A', 'B', 'C', 'D'][i]
                        break
                
                formatted_mcqs.append(formatted_mcq)
                print(f"[v0] Successfully formatted MCQ: {formatted_mcq['question'][:50]}...")
        
        print(f"[v0] Formatted {len(formatted_mcqs)} MCQs from topic successfully")
        
        result = formatted_mcqs[:int(num_questions)]
        print(f"[v0] Returning {len(result)} MCQs")
        return result

    except Exception as e:
        print(f"[v0] Error calling Groq API for topic: {e}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Failed to generate MCQs from topic with Groq: {str(e)}")
