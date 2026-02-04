from flask import Flask, request, jsonify, session
from flask_cors import CORS
from database import db, init_db
from models import User, MCQSet, MCQ, Test, TestAnswer
from mcq_ai import generate_mcqs, generate_mcqs_from_pdf
from summarize_ai import generate_summary, generate_summary_from_pdf
from datetime import timedelta
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path)

groq_api_key = os.getenv('GROQ_API_KEY')
gemini_api_key = os.getenv('GEMINI_API_KEY')
print("\n" + "="*60)
print("[v0] ENVIRONMENT VARIABLE CHECK")
print("="*60)
print(f"Backend directory: {basedir}")
print(f".env file path: {dotenv_path}")
print(f".env file exists: {os.path.exists(dotenv_path)}")
print(f"GROQ_API_KEY exists: {groq_api_key is not None}")
if groq_api_key:
    print(f"GROQ_API_KEY value: {groq_api_key[:10]}...{groq_api_key[-10:]}")
else:
    print("⚠️  WARNING: GROQ_API_KEY not found!")
    print(f"   Make sure .env file exists at: {dotenv_path}")
    print("   and contains: GROQ_API_KEY=your_actual_key_here")
print(f"GEMINI_API_KEY exists: {gemini_api_key is not None}")
if gemini_api_key:
    print(f"GEMINI_API_KEY value: {gemini_api_key[:10]}...{gemini_api_key[-10:]}")
else:
    print("⚠️  WARNING: GEMINI_API_KEY not found!")
    print(f"   Make sure .env file exists at: {dotenv_path}")
    print("   and contains: GEMINI_API_KEY=your_actual_key_here")
print("="*60 + "\n")

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-change-in-production-12345')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///mcq.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Session cookie configuration
app.config['SESSION_COOKIE_NAME'] = 'mcq_session'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['SESSION_COOKIE_DOMAIN'] = None  # Works for localhost

CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:3000"],
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

init_db(app)

@app.before_request
def log_session_info():
    print(f"\n{'='*60}")
    print(f"[v0] REQUEST: {request.method} {request.path}")
    print(f"[v0] Session ID: {session.get('_id', 'NO SESSION')}")
    print(f"[v0] User ID in session: {session.get('user_id', 'NOT SET')}")
    print(f"[v0] Session permanent: {session.permanent}")
    print(f"[v0] Cookies received: {list(request.cookies.keys())}")
    print(f"{'='*60}\n")

def get_current_user():
    """Get user_id from session. Returns None if not logged in."""
    user_id = session.get('user_id')
    print(f"[v0] get_current_user() -> {user_id}")
    return user_id

# AUTHENTICATION ROUTES

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Validation
        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        session.permanent = True
        print(f"[v0] User {user.id} signed up and logged in via session")
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Validation
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        session.clear()
        session['user_id'] = user.id
        session.permanent = True
        
        print(f"\n{'*'*60}")
        print(f"[v0] ✓✓✓ LOGIN SUCCESSFUL ✓✓✓")
        print(f"[v0] User ID: {user.id}")
        print(f"[v0] Email: {user.email}")
        print(f"[v0] Session ID: {session.get('_id', 'GENERATED')}")
        print(f"[v0] Session user_id: {session.get('user_id')}")
        print(f"[v0] Session permanent: {session.permanent}")
        print(f"{'*'*60}\n")
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
def verify_session():
    """Verify session and return user info"""
    try:
        user_id = get_current_user()
        
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.get(user_id)
        
        if not user:
            session.pop('user_id', None)
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user by clearing session"""
    session.pop('user_id', None)
    print("[v0] User logged out, session cleared")
    return jsonify({'message': 'Logged out successfully'}), 200

# MCQ GENERATION ROUTES

@app.route('/api/mcq/generate', methods=['POST'])
def generate_mcq():
    """Generate MCQs from text or PDF (public or authenticated)"""
    
    print(f"\n{'#'*60}")
    print("[v0] MCQ GENERATION - SESSION CHECK")
    print(f"{'#'*60}")
    print(f"Session exists: {bool(session)}")
    print(f"Session keys: {list(session.keys())}")
    print(f"Session user_id: {session.get('user_id', 'NOT SET')}")
    print(f"Session _id: {session.get('_id', 'NOT SET')}")
    print(f"Cookies in request: {dict(request.cookies)}")
    print(f"{'#'*60}\n")
    
    user_id = get_current_user()
    is_authenticated = user_id is not None
    
    print(f"[BACKEND AUTH CHECK]")
    print(f"User ID from session: {user_id}")
    print(f"Is Authenticated: {is_authenticated}")
    
    try:
        # Get form data
        source_type = request.form.get('source_type', 'text')
        num_questions = int(request.form.get('num_questions', 5))
        difficulty = request.form.get('difficulty', 'medium')
        
        print(f"Generating {num_questions} MCQs from {source_type} (difficulty: {difficulty})")
        
        mcqs = []
        try:
            if source_type == 'text':
                text = request.form.get('text', '')
                if not text:
                    return jsonify({'error': 'Text is required for MCQ generation'}), 400
                print(f"[v0] Generating MCQs from text (length: {len(text)} chars)")
                mcqs = generate_mcqs(text, num_questions, difficulty)
            
            elif source_type == 'pdf':
                if 'pdf_file' not in request.files:
                    return jsonify({'error': 'PDF file is required'}), 400
                
                pdf_file = request.files['pdf_file']
                print(f"[v0] Generating MCQs from PDF: {pdf_file.filename}")
                mcqs = generate_mcqs_from_pdf(pdf_file, num_questions, difficulty)
            
            if not mcqs or len(mcqs) == 0:
                error_msg = 'No MCQs were generated. Please check if your text is meaningful and try again.'
                print(f"[v0] ERROR: {error_msg}")
                return jsonify({'error': error_msg}), 500
            
            print(f"[v0] ✓ Generated {len(mcqs)} MCQs successfully")
        
        except ValueError as ve:
            # Handle missing API key or validation errors
            error_msg = str(ve)
            print(f"[v0] VALIDATION ERROR: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        except Exception as gen_error:
            # Handle any other generation errors
            error_msg = f"MCQ generation failed: {str(gen_error)}"
            print(f"[v0] GENERATION ERROR: {error_msg}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': error_msg}), 500
        
        # If user is logged in, save to database
        saved_successfully = False
        save_error = None
        
        if is_authenticated and user_id:
            print(f"\n--- SAVING TO DATABASE ---")
            print(f"Authenticated user {user_id} - attempting to save MCQs...")
            try:
                # Create MCQ set
                mcq_set = MCQSet(
                    user_id=user_id,
                    title=f"MCQ Set - {source_type.upper()}",
                    source_type=source_type,
                    difficulty=difficulty
                )
                db.session.add(mcq_set)
                db.session.flush()
                
                print(f"✓ Created MCQ set with ID: {mcq_set.id}")
                
                # Add all MCQs
                for idx, mcq_data in enumerate(mcqs):
                    mcq = MCQ(
                        mcq_set_id=mcq_set.id,
                        question=mcq_data['question'],
                        option_a=mcq_data['option_a'],
                        option_b=mcq_data['option_b'],
                        option_c=mcq_data['option_c'],
                        option_d=mcq_data['option_d'],
                        correct_answer=mcq_data['correct_answer'],
                        difficulty=mcq_data.get('difficulty', difficulty)
                    )
                    db.session.add(mcq)
                
                db.session.commit()
                saved_successfully = True
                print(f"✓✓✓ ALL {len(mcqs)} MCQs SAVED TO DATABASE SUCCESSFULLY!")
                
            except Exception as save_error_ex:
                save_error = str(save_error_ex)
                print(f"✗ Database save error: {save_error}")
                import traceback
                traceback.print_exc()
                db.session.rollback()
        else:
            print(f"\n--- NOT SAVING ---")
            print(f"Reason: is_authenticated={is_authenticated}, user_id={user_id}")
        
        response_data = {
            'message': 'MCQs generated successfully',
            'mcqs': mcqs,
            'saved': saved_successfully,
            'authenticated': is_authenticated,
            'user_id': user_id
        }
        
        if save_error:
            response_data['save_error'] = save_error
        
        print(f"\n--- RESPONSE ---")
        print(f"authenticated: {is_authenticated}")
        print(f"saved: {saved_successfully}")
        print(f"user_id: {user_id}")
        print(f"----------------\n")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"\n✗✗✗ CRITICAL ERROR in generate_mcq: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/mcq/history', methods=['GET'])
def get_mcq_history():
    """Get user's MCQ generation history"""
    try:
        user_id = get_current_user()
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        mcq_sets = MCQSet.query.filter_by(user_id=user_id).order_by(MCQSet.created_at.desc()).all()
        
        return jsonify({
            'mcq_sets': [mcq_set.to_dict() for mcq_set in mcq_sets]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mcq/set/<int:set_id>', methods=['GET'])
def get_mcq_set(set_id):
    """Get specific MCQ set with all questions"""
    try:
        user_id = get_current_user()
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        mcq_set = MCQSet.query.filter_by(id=set_id, user_id=user_id).first()
        
        if not mcq_set:
            return jsonify({'error': 'MCQ set not found'}), 404
        
        return jsonify({
            'mcq_set': mcq_set.to_dict(),
            'mcqs': [mcq.to_dict() for mcq in mcq_set.mcqs]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# TEST ROUTES

@app.route('/api/test/create', methods=['POST'])
def create_test():
    """Create a new test with generated questions"""
    try:
        user_id = get_current_user()
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle file upload
            source_type = request.form.get('source_type', 'text')
            num_questions = int(request.form.get('num_questions', 5))
            difficulty = request.form.get('difficulty', 'medium')
            time_duration = int(request.form.get('time_duration', 10))
            
            if source_type == 'pdf':
                if 'pdf_file' not in request.files:
                    return jsonify({'error': 'PDF file is required'}), 400
                
                pdf_file = request.files['pdf_file']
                
                if pdf_file.filename == '':
                    return jsonify({'error': 'No file selected'}), 400
                
                if not pdf_file.filename.endswith('.pdf'):
                    return jsonify({'error': 'Only PDF files are allowed'}), 400
                
                # Generate MCQs from PDF
                from mcq_ai import generate_mcqs_from_pdf
                mcqs = generate_mcqs_from_pdf(pdf_file, num_questions, difficulty)
            else:
                source_text = request.form.get('source_text', '')
                
                if not source_text:
                    return jsonify({'error': 'Source text is required'}), 400
                
                mcqs = generate_mcqs(source_text, num_questions, difficulty)
        else:
            data = request.get_json()
            
            num_questions = data.get('num_questions', 5)
            difficulty = data.get('difficulty', 'medium')
            time_duration = data.get('time_duration', 10)
            source_text = data.get('source_text', '')
            
            if not source_text:
                return jsonify({'error': 'Source text is required'}), 400
            
            mcqs = generate_mcqs(source_text, num_questions, difficulty)
        
        if not mcqs:
            return jsonify({'error': 'Could not generate MCQs'}), 400
        
        return jsonify({
            'message': 'Test created successfully',
            'test_data': {
                'num_questions': len(mcqs),
                'difficulty': difficulty,
                'time_duration': time_duration,
                'mcqs': mcqs
            }
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/test/submit', methods=['POST'])
def submit_test():
    """Submit test answers and calculate score"""
    try:
        user_id = get_current_user()
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        test_title = data.get('title', 'Test')
        difficulty = data.get('difficulty', 'medium')
        time_duration = data.get('time_duration', 10)
        questions = data.get('questions', [])
        answers = data.get('answers', {})
        
        print(f"\n{'='*60}")
        print(f"[v0] TEST SUBMISSION DEBUG")
        print(f"{'='*60}")
        print(f"User ID: {user_id}")
        print(f"Total Questions: {len(questions)}")
        print(f"User Answers: {answers}")
        print(f"\n[v0] First Question Structure:")
        if questions:
            print(f"  Question: {questions[0].get('question', 'N/A')}")
            print(f"  Options keys: {list(questions[0].get('options', {}).keys())}")
            print(f"  Options values: {questions[0].get('options', {})}")
        print(f"{'='*60}\n")
        
        if not questions:
            return jsonify({'error': 'No questions provided'}), 400
        
        score = 0
        total_marks = len(questions)
        
        test = Test(
            user_id=user_id,
            title=test_title,
            difficulty=difficulty,
            total_questions=total_marks,
            time_duration=time_duration,
            total_marks=total_marks
        )
        db.session.add(test)
        db.session.flush()
        
        for idx, question in enumerate(questions):
            # Get user answer (convert index to string for dict lookup)
            user_answer = answers.get(str(idx))
            correct_answer = question['correct_answer']
            
            user_answer_normalized = user_answer.strip().upper() if user_answer else None
            correct_answer_normalized = correct_answer.strip().upper() if correct_answer else None
            
            is_correct = user_answer_normalized == correct_answer_normalized
            
            print(f"Question {idx + 1}:")
            print(f"  Correct: {correct_answer} (normalized: {correct_answer_normalized})")
            print(f"  User: {user_answer} (normalized: {user_answer_normalized})")
            print(f"  Is Correct: {is_correct}")
            options = question.get('options', {})
            option_a = options.get('A') or options.get('a') or question.get('option_a') or ''
            option_b = options.get('B') or options.get('b') or question.get('option_b') or ''
            option_c = options.get('C') or options.get('c') or question.get('option_c') or ''
            option_d = options.get('D') or options.get('d') or question.get('option_d') or ''
            
            print(f"  Option A: {option_a[:50]}..." if len(option_a) > 50 else f"  Option A: {option_a}")
            print(f"  Option B: {option_b[:50]}..." if len(option_b) > 50 else f"  Option B: {option_b}")
            
            if is_correct:
                score += 1
            
            test_answer = TestAnswer(
                test_id=test.id,
                question=question['question'],
                option_a=option_a,
                option_b=option_b,
                option_c=option_c,
                option_d=option_d,
                correct_answer=correct_answer,
                user_answer=user_answer,
                is_correct=is_correct
            )
            db.session.add(test_answer)
        
        test.score = score
        test.percentage = round((score / total_marks * 100), 2) if total_marks > 0 else 0
        
        db.session.commit()
        
        print(f"\n[v0] Test submitted: Score {score}/{total_marks} ({test.percentage}%)\n")
        
        return jsonify({
            'message': 'Test submitted successfully',
            'test_id': test.id,
            'score': score,
            'total_marks': total_marks,
            'percentage': test.percentage
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"[v0] Error submitting test: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/test/<int:test_id>', methods=['GET'])
def get_test_result(test_id):
    """Get test results with all answers"""
    try:
        user_id = get_current_user()
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        test = Test.query.filter_by(id=test_id, user_id=user_id).first()
        
        if not test:
            return jsonify({'error': 'Test not found'}), 404
        
        return jsonify({
            'test': test.to_dict(),
            'answers': [answer.to_dict() for answer in test.answers]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test/history', methods=['GET'])
def get_test_history():
    """Get user's test history"""
    try:
        user_id = get_current_user()
        
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        tests = Test.query.filter_by(user_id=user_id).order_by(Test.submitted_at.desc()).all()
        
        return jsonify({
            'tests': [test.to_dict() for test in tests]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# SUMMARIZATION ROUTES

@app.route('/api/summary/generate', methods=['POST'])
def generate_summary_endpoint():
    """Generate summary from text or PDF"""
    
    try:
        # Get form data
        source_type = request.form.get('source_type', 'text')
        summary_length = request.form.get('summary_length', 'medium')
        
        print(f"\n{'='*60}")
        print("[v0] SUMMARIZATION REQUEST")
        print(f"{'='*60}")
        print(f"Source type: {source_type}")
        print(f"Summary length: {summary_length}")
        
        summary = ""
        try:
            if source_type == 'text':
                text = request.form.get('text', '')
                if not text:
                    return jsonify({'error': 'Text is required for summarization'}), 400
                print(f"[v0] Generating summary from text (length: {len(text)} chars)")
                summary = generate_summary(text, summary_length)
            
            elif source_type == 'pdf':
                if 'pdf_file' not in request.files:
                    return jsonify({'error': 'PDF file is required'}), 400
                
                pdf_file = request.files['pdf_file']
                print(f"[v0] Generating summary from PDF: {pdf_file.filename}")
                summary = generate_summary_from_pdf(pdf_file, summary_length)
            
            if not summary:
                error_msg = 'No summary was generated. Please check if your text is meaningful and try again.'
                print(f"[v0] ERROR: {error_msg}")
                return jsonify({'error': error_msg}), 500
            
            print(f"[v0] ✓ Summary generated successfully")
            print(f"{'='*60}\n")
        
        except ValueError as ve:
            error_msg = str(ve)
            print(f"[v0] VALIDATION ERROR: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        except Exception as gen_error:
            error_msg = f"Summary generation failed: {str(gen_error)}"
            print(f"[v0] GENERATION ERROR: {error_msg}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': error_msg}), 500
        
        return jsonify({
            'message': 'Summary generated successfully',
            'summary': summary
        }), 200
        
    except Exception as e:
        print(f"\n✗✗✗ CRITICAL ERROR in generate_summary_endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# DASHBOARD ROUTES

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get dashboard statistics for user"""
    
    print(f"\n{'#'*60}")
    print("[v0] DASHBOARD - SESSION CHECK")
    print(f"{'#'*60}")
    print(f"Session exists: {bool(session)}")
    print(f"Session keys: {list(session.keys())}")
    print(f"Session user_id: {session.get('user_id', 'NOT SET')}")
    print(f"Cookies in request: {dict(request.cookies)}")
    print(f"{'#'*60}\n")
    
    user_id = get_current_user()
    
    if not user_id:
        print("[v0] Dashboard: No valid session - user_id is None")
        return jsonify({'error': 'Authentication required', 'authenticated': False}), 401
    
    try:
        user = User.query.get(user_id)
        
        if not user:
            session.pop('user_id', None)
            return jsonify({'error': 'User not found'}), 404
        
        # Get statistics
        total_tests = Test.query.filter_by(user_id=user_id).count()
        total_mcq_sets = MCQSet.query.filter_by(user_id=user_id).count()
        
        # Get recent tests
        recent_tests = Test.query.filter_by(user_id=user_id).order_by(Test.submitted_at.desc()).limit(5).all()
        
        # Calculate average score
        tests = Test.query.filter_by(user_id=user_id).all()
        avg_score = 0
        if tests:
            total_percentage = sum([(t.score / t.total_marks * 100) for t in tests if t.total_marks > 0])
            avg_score = round(total_percentage / len(tests), 2)
        
        return jsonify({
            'user': user.to_dict(),
            'stats': {
                'total_tests': total_tests,
                'total_mcq_sets': total_mcq_sets,
                'average_score': avg_score
            },
            'recent_tests': [test.to_dict() for test in recent_tests]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# RUN APPLICATION

if __name__ == '__main__':
    app.run(debug=True, port=5000)
