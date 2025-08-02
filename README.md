# Document Similarity Agent System

A full-stack application that uses AI agents to compare job descriptions with consultant profiles and provide ranked matches.

## Features

- **Frontend**: React/Next.js UI for uploading files and running comparisons
- **Backend**: Python FastAPI server with AI agents for document comparison
- **Database**: MongoDB integration with Supabase fallback support
- **Agents**: 
  - Comparison Agent: Compares JD with profiles using Google Gemini
  - Ranking Agent: Ranks profiles by similarity score
  - Communication Agent: Sends email notifications
  - Report Agent: Generates detailed analysis reports

## Quick Start

### 1. Set Up Database

The project supports both MongoDB and Supabase. MongoDB is recommended for better performance.

**Option A: MongoDB (Recommended)**
```bash
# Install MongoDB locally or use MongoDB Atlas
# Copy environment template
cp env.example .env.local

# Edit .env.local with your MongoDB URI and other settings
# Set USE_MONGODB=true to enable MongoDB
```

**Option B: Supabase (Fallback)**
```bash
# Use existing Supabase setup
# Set USE_MONGODB=false in .env.local
```

### 2. Start the Backend Server

```bash
# Install Python dependencies
cd agent_action
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your API keys and MongoDB settings

# Start the FastAPI server with MongoDB support
python fastapi_server.py
# Or start the original LangGraph server
python run-server.py
```

### 2. Start the Frontend

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

### 3. Use the System

1. Go to `http://localhost:3000`
2. Login as "AR Requestor"
3. Upload job descriptions and consultant profiles
4. Go to "Compare" page and run the comparison
5. View results and notifications

## Environment Variables

Create a `.env` file in the `agent_action` directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
SENDER_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
AR_REQUESTOR_EMAIL=ar@example.com
RECRUITER_EMAIL=recruiter@example.com
```

## API Endpoints

- `POST /run-agent`: Runs the full agent workflow
  - Input: `{ jd_filename, jd_content, profiles_content, ar_email?, recruiter_email? }`
  - Output: `{ status, message, top_3_matches }`

## Architecture

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Backend**: FastAPI with CORS enabled
- **Agents**: LangChain with Google Gemini integration
- **Data Flow**: Frontend → Backend → Agents → Results → Frontend
