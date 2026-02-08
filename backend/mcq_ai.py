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

import time

BATCH_SIZE = 25  # Max questions per API call

def _format_mcqs(mcqs_raw, difficulty):
    """Format raw MCQ JSON into the expected structure."""
    formatted_mcqs = []
    for mcq in mcqs_raw:
        if 'question' in mcq and 'options' in mcq and 'answer' in mcq:
            options = mcq['options']
            if not isinstance(options, list) or len(options) < 4:
                continue
            try:
                option_a = str(options[0]) if options[0] is not None else ""
                option_b = str(options[1]) if options[1] is not None else ""
                option_c = str(options[2]) if options[2] is not None else ""
                option_d = str(options[3]) if options[3] is not None else ""
            except (IndexError, TypeError):
                continue

            formatted_mcq = {
                'question': str(mcq['question']),
                'option_a': option_a,
                'option_b': option_b,
                'option_c': option_c,
                'option_d': option_d,
                'correct_answer': 'A',
                'difficulty': difficulty
            }
            answer_text = str(mcq['answer']).strip()
            option_list = [option_a, option_b, option_c, option_d]
            for i in range(4):
                if option_list[i].strip() == answer_text:
                    formatted_mcq['correct_answer'] = ['A', 'B', 'C', 'D'][i]
                    break
            formatted_mcqs.append(formatted_mcq)
    return formatted_mcqs


def _call_groq_api(api_key, messages, timeout=90):
    """Make a single call to the Groq API and return parsed MCQs."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": messages,
        "temperature": 0.5,
        "max_tokens": 8000
    }

    response = requests.post(url, headers=headers, json=payload, timeout=timeout)
    if response.status_code == 429:
        print("[v0] Rate limited, waiting 5 seconds...")
        time.sleep(5)
        response = requests.post(url, headers=headers, json=payload, timeout=timeout)

    if response.status_code != 200:
        print(f"[v0] Groq API error {response.status_code}: {response.text}")
        raise Exception(f"Groq API returned status {response.status_code}: {response.text}")

    data = response.json()
    raw_text = data['choices'][0]['message']['content'].strip()
    print(f"[v0] Groq response tokens: {data.get('usage', {})}")
    return extract_json(raw_text)


def generate_mcqs_with_groq(text, num_questions=5, difficulty='medium'):
    """
    Generate MCQs using Groq API with batching for large requests.
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")

    num_questions = int(num_questions)
    all_mcqs = []
    remaining = num_questions
    batch_num = 0

    print(f"[v0] Generating {num_questions} MCQs from text (batches of {BATCH_SIZE})")

    while remaining > 0:
        batch_num += 1
        batch_count = min(remaining, BATCH_SIZE)
        print(f"[v0] Batch {batch_num}: requesting {batch_count} questions...")

        # Build list of already-generated questions to avoid duplicates
        existing_questions = [m['question'] for m in all_mcqs]
        avoid_text = ""
        if existing_questions:
            avoid_text = "\n\nIMPORTANT: Do NOT repeat any of these previously generated questions:\n" + "\n".join(f"- {q[:80]}" for q in existing_questions[-20:])

        prompt = f"""Generate exactly {batch_count} multiple choice questions from the following text.

Difficulty level: {difficulty}

Rules:
- Create exactly 4 options (A, B, C, D) for each question
- Only ONE option should be correct
- Questions should test understanding of the content
- Return ONLY valid JSON array, no additional text
- No markdown formatting, no code blocks
{avoid_text}

Required JSON format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "answer": "Option A text"
  }}
]

Text to generate questions from:
{text[:4000]}"""

        messages = [
            {"role": "system", "content": "You are an expert educator who creates high-quality multiple choice questions. Always return valid JSON arrays only, with no additional formatting or text."},
            {"role": "user", "content": prompt}
        ]

        try:
            mcqs_raw = _call_groq_api(api_key, messages)
            if mcqs_raw:
                formatted = _format_mcqs(mcqs_raw, difficulty)
                # Filter out duplicates
                for mcq in formatted:
                    if mcq['question'] not in [m['question'] for m in all_mcqs]:
                        all_mcqs.append(mcq)
                print(f"[v0] Batch {batch_num}: got {len(formatted)} MCQs, total so far: {len(all_mcqs)}")
            else:
                print(f"[v0] Batch {batch_num}: no MCQs parsed, retrying...")
        except Exception as e:
            print(f"[v0] Batch {batch_num} error: {e}")

        remaining = num_questions - len(all_mcqs)
        if remaining > 0:
            time.sleep(0.3)

    print(f"[v0] Total MCQs generated: {len(all_mcqs)}")
    return all_mcqs[:num_questions]

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
    Generate MCQs based on a topic name using Groq API with batching.
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")

    num_questions = int(num_questions)
    all_mcqs = []
    remaining = num_questions
    batch_num = 0

    difficulty_instructions = {
        'easy': 'Create basic, straightforward questions that test fundamental understanding.',
        'medium': 'Create moderately challenging questions that test deeper understanding and application of concepts.',
        'hard': 'Create challenging questions requiring analysis, synthesis, or application of multiple concepts.'
    }

    print(f"[v0] Generating {num_questions} MCQs from topic: {topic} (batches of {BATCH_SIZE})")

    while remaining > 0:
        batch_num += 1
        batch_count = min(remaining, BATCH_SIZE)
        print(f"[v0] Topic Batch {batch_num}: requesting {batch_count} questions...")

        existing_questions = [m['question'] for m in all_mcqs]
        avoid_text = ""
        if existing_questions:
            avoid_text = "\n\nIMPORTANT: Do NOT repeat any of these previously generated questions:\n" + "\n".join(f"- {q[:80]}" for q in existing_questions[-20:])

        prompt = f"""You are an expert educator creating a quiz about "{topic}".

Generate exactly {batch_count} high-quality multiple choice questions about {topic}.

Difficulty level: {difficulty.upper()}
{difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}

IMPORTANT RULES:
1. Create exactly 4 options (A, B, C, D) for each question
2. Only ONE option should be the correct answer
3. Questions should be factually accurate and educational
4. Cover different aspects/subtopics of "{topic}"
5. Make incorrect options plausible but clearly wrong
6. Return ONLY valid JSON array, no additional text or markdown
{avoid_text}

Required JSON format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "answer": "The correct option text (must match exactly one of the options)"
  }}
]

Generate {batch_count} questions about: {topic}"""

        messages = [
            {"role": "system", "content": "You are an expert educator who creates high-quality, factually accurate multiple choice questions. You have comprehensive knowledge across all subjects. Always return valid JSON arrays only, with no additional formatting or text."},
            {"role": "user", "content": prompt}
        ]

        try:
            mcqs_raw = _call_groq_api(api_key, messages)
            if mcqs_raw:
                formatted = _format_mcqs(mcqs_raw, difficulty)
                for mcq in formatted:
                    if mcq['question'] not in [m['question'] for m in all_mcqs]:
                        all_mcqs.append(mcq)
                print(f"[v0] Topic Batch {batch_num}: got {len(formatted)} MCQs, total so far: {len(all_mcqs)}")
            else:
                print(f"[v0] Topic Batch {batch_num}: no MCQs parsed")
        except Exception as e:
            print(f"[v0] Topic Batch {batch_num} error: {e}")

        remaining = num_questions - len(all_mcqs)
        if remaining > 0:
            time.sleep(0.3)

    print(f"[v0] Total topic MCQs generated: {len(all_mcqs)}")
    return all_mcqs[:num_questions]
