from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    mcq_sets = db.relationship('MCQSet', backref='user', lazy=True, cascade='all, delete-orphan')
    tests = db.relationship('Test', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class MCQSet(db.Model):
    __tablename__ = 'mcq_sets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200))
    source_type = db.Column(db.String(20))  # 'text' or 'pdf'
    difficulty = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    mcqs = db.relationship('MCQ', backref='mcq_set', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'source_type': self.source_type,
            'difficulty': self.difficulty,
            'created_at': self.created_at.isoformat(),
            'mcq_count': len(self.mcqs)
        }

class MCQ(db.Model):
    __tablename__ = 'mcqs'
    
    id = db.Column(db.Integer, primary_key=True)
    mcq_set_id = db.Column(db.Integer, db.ForeignKey('mcq_sets.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.Text, nullable=False)
    option_b = db.Column(db.Text, nullable=False)
    option_c = db.Column(db.Text, nullable=False)
    option_d = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)  # A, B, C, or D
    difficulty = db.Column(db.String(20))
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'options': {
                'A': self.option_a,
                'B': self.option_b,
                'C': self.option_c,
                'D': self.option_d
            },
            'correct_answer': self.correct_answer,
            'difficulty': self.difficulty
        }

class Test(db.Model):
    __tablename__ = 'tests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200))
    difficulty = db.Column(db.String(20))
    total_questions = db.Column(db.Integer, nullable=False)
    time_duration = db.Column(db.Integer)  # in minutes
    score = db.Column(db.Integer, default=0)
    total_marks = db.Column(db.Integer, nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    answers = db.relationship('TestAnswer', backref='test', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'difficulty': self.difficulty,
            'total_questions': self.total_questions,
            'time_duration': self.time_duration,
            'score': self.score,
            'total_marks': self.total_marks,
            'submitted_at': self.submitted_at.isoformat(),
            'percentage': round((self.score / self.total_marks * 100), 2) if self.total_marks > 0 else 0
        }

class TestAnswer(db.Model):
    __tablename__ = 'test_answers'
    
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('tests.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.Text, nullable=False)
    option_b = db.Column(db.Text, nullable=False)
    option_c = db.Column(db.Text, nullable=False)
    option_d = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)
    user_answer = db.Column(db.String(1))
    is_correct = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'options': {
                'A': self.option_a,
                'B': self.option_b,
                'C': self.option_c,
                'D': self.option_d
            },
            'correct_answer': self.correct_answer,
            'user_answer': self.user_answer,
            'is_correct': self.is_correct
        }
