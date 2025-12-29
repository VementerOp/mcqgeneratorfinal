# MCQ Generator & Test Application

A full-stack application for generating and taking MCQ tests with AI-powered question generation using Groq API.

## Tech Stack

**Backend:**
- Python Flask
- SQLite Database
- JWT Authentication
- SQLAlchemy ORM
- Groq API for MCQ Generation

**Frontend:**
- React
- React Router DOM
- Context API for State Management

## Features

- ✅ User Authentication (Signup/Login with JWT)
- ✅ Session Management (Persistent login)
- ✅ Public Home Page (No auto-redirect)
- ✅ Guest Mode (Generate MCQs without login)
- ✅ Protected Dashboard with Analytics
- ✅ AI-Powered MCQ Generation (Groq API) from Text and PDF
- ✅ Customizable Tests (Questions, Difficulty, Time)
- ✅ Timed Tests with Auto-submit
- ✅ Test Results with Detailed Analytics
- ✅ User-wise History & Progress Tracking
- ✅ Responsive Design

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── database.py         # Database initialization
├── models.py           # SQLAlchemy models
├── mcq_ai.py          # Grok API MCQ generation
├── requirements.txt    # Python dependencies
└── .env               # Environment variables (create this)

frontend/
├── public/
├── src/
│   ├── pages/         # All page components
│   ├── components/    # Reusable components
│   ├── context/       # Auth context
│   ├── App.js
│   └── index.js
└── package.json
```

## Setup Instructions

### 1. Backend Setup

#### a. Navigate to backend directory:
```bash
cd backend
```

#### b. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### c. Install dependencies:
```bash
pip install -r requirements.txt
```

#### d. Create `.env` file in backend directory:
```bash
# Create .env file
touch .env  # On Windows: type nul > .env
```

#### e. Add the following to your `.env` file:
```env
# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-change-this-in-production

# Groq API Configuration
GROQ_API_KEY=gsk_your-api-key-here

# Database
DATABASE_URL=sqlite:///mcq.db
```

**Important Notes:**
- Replace `your-secret-key-change-this-in-production` with any random string for Flask
- Replace `your-jwt-secret-change-this-in-production` with any random string for JWT
- Replace `gsk_your-api-key-here` with your actual Groq API key from console.groq.com
- Keep your API key secure and never commit it to version control

**How to Get Your Groq API Key:**
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in to your Groq account (free tier available)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`) and paste it in your `.env` file as `GROQ_API_KEY`

#### f. Run the Flask server:
```bash
python app.py
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

#### a. Navigate to frontend directory:
```bash
cd frontend
```

#### b. Install dependencies:
```bash
npm install
```

#### c. Start the React app:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## How to Use

### First Time Setup:
1. **Get Groq API Key**: Visit [https://console.groq.com](https://console.groq.com) to create account and get your free API key
2. **Add API Key**: Put your key in `backend/.env` file (see setup instructions above)
3. **Start Backend**: Run Flask server (port 5000)
4. **Start Frontend**: Run React app (port 3000)

### Using the Application:

#### As a Guest (No Login):
1. Visit home page at `http://localhost:3000`
2. Click "Try as Guest" or navigate to "Generate MCQs"
3. Enter text or upload PDF
4. Generate MCQs (won't be saved to database)

#### As a Registered User:
1. Click "Sign Up" and create an account
2. After signup, you'll be redirected to home page (logged in)
3. Access features:
   - **Generate MCQs**: Create and save MCQ sets
   - **Take Timed Test**: Create tests with timer
   - **Track Progress**: View dashboard with statistics
   - **Test History**: See all past test results

## API Endpoints

### Authentication:
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### MCQ Generation:
- `POST /api/mcq/generate` - Generate MCQs (public or authenticated)
- `GET /api/mcq/history` - Get user's MCQ history (protected)
- `GET /api/mcq/set/:id` - Get specific MCQ set (protected)

### Tests:
- `POST /api/test/create` - Create new test (protected)
- `POST /api/test/submit` - Submit test answers (protected)
- `GET /api/test/:id` - Get test result (protected)
- `GET /api/test/history` - Get test history (protected)

### Dashboard:
- `GET /api/dashboard` - Get user statistics (protected)

## Troubleshooting

### Backend Issues:
- **"GROQ_API_KEY not found"**: Make sure you created `.env` file in the `backend/` directory with the API key
- **"400 Bad Request" from Groq**: Your API key might be invalid. Get a new one from [https://console.groq.com](https://console.groq.com)
- **"Failed to generate MCQs"**: Check your API key is valid and you have credits/access. Also check backend console logs for detailed error messages
- **Database errors**: Delete `mcq.db` and restart Flask to recreate
- **Import errors**: Reinstall requirements with `pip install -r requirements.txt`

### Frontend Issues:
- **"Network error"**: Ensure Flask backend is running on port 5000
- **Login redirect loop**: Clear localStorage and try again
- **Components not found**: Run `npm install` again

### Common Problems:
- **Can't generate MCQs**: Check that Groq API key is valid
- **Login doesn't persist**: Check browser localStorage is enabled
- **Guest mode not working**: This is expected - Generate MCQ page should work without login

## Notes

- MCQs generated without login are preview-only (not stored)
- MCQs generated after login are saved to database
- All test data is user-specific
- Session persists via JWT in localStorage
- Timer auto-submits test when time expires
- Groq API (llama-3.1-8b-instant model) generates intelligent questions from your content
- Groq offers free tier with generous rate limits

## Security

- Passwords are hashed using Werkzeug security
- JWT tokens expire after 24 hours
- Protected routes require valid JWT token
- CORS enabled for local development

## License

This project is for educational purposes.
