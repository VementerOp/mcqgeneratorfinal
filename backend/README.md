# MCQ Generator Backend

## Setup Instructions

1. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Groq API key to `.env`:
     ```
     GROQ_API_KEY=your-actual-groq-api-key-here
     FLASK_SECRET_KEY=your-secret-key-change-this-in-production
     ```
   - Get your Groq API key from: https://console.groq.com/keys

3. **Initialize Database**
   - The database will be created automatically on first run

4. **Run the Server**
   ```bash
   python app.py
   ```
   
   The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify session
- `POST /api/auth/logout` - Logout user

### MCQ Generation
- `POST /api/mcq/generate` - Generate MCQs (public or authenticated)
- `GET /api/mcq/history` - Get user's MCQ history (authenticated)
- `GET /api/mcq/set/<id>` - Get specific MCQ set (authenticated)

### Tests
- `POST /api/test/create` - Create test with questions (authenticated)
- `POST /api/test/submit` - Submit test answers (authenticated)
- `GET /api/test/<id>` - Get test results (authenticated)
- `GET /api/test/history` - Get test history (authenticated)

### Dashboard
- `GET /api/dashboard` - Get user statistics (authenticated)

## Authentication

This application uses **session-based authentication** (not JWT):
- Sessions are stored in encrypted cookies
- `credentials: "include"` must be set in frontend fetch requests
- CORS is configured for `http://localhost:3000`

## AI Model

This application uses **Groq API** with the `mixtral-8x7b-32768` model for MCQ generation. Groq provides fast inference with a generous free tier.
