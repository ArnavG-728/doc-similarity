# agent_actions/server.py

import os
import tempfile
import shutil
import uvicorn
from dotenv import load_dotenv

from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# Agent imports
from agents.comparison_agent import ComparisonAgent
from agents.ranking_agent import RankingAgent
from agents.communication_agent import CommunicationAgent

# Utility imports
from utils.document_loader import load_documents_from_folder, load_document
from config import SENDER_EMAIL

# Load environment variables
load_dotenv()

# FastAPI app setup
app = FastAPI()

# CORS middleware setup for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants for file storage (optional - used by other agents)
JD_FOLDER = "data/jd"
PROFILES_FOLDER = "data/profiles"


@app.get("/")
async def root():
    return {"message": "Agent server is running!", "status": "active"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents": "ready"}


@app.post("/process-upload")
async def process_uploaded_file(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded .txt, .pdf, or .docx file
    using the document_loader utility.
    """
    try:
        ext = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        extracted_text = load_document(tmp_path)
        os.remove(tmp_path)

        return {
            "filename": file.filename,
            "content": extracted_text
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to process file {file.filename}: {str(e)}"
        }


@app.post("/run-agent")
async def run_agent(request: Request):
    """
    Executes document comparison, ranking, and optional email notification
    between a JD and a set of consultant profiles.
    """
    try:
        print("🔔 Received request to /run-agent")
        data = await request.json()

        jd_filename = data.get("jd_filename")
        jd_content = data.get("jd_content")
        profiles_content = data.get("profiles_content", {})
        ar_requestor_email = data.get("ar_email", os.getenv("AR_REQUESTOR_EMAIL"))
        recruiter_email = data.get("recruiter_email", os.getenv("RECRUITER_EMAIL"))

        # Validate input
        if not jd_filename or not jd_content:
            return {"status": "error", "message": "JD filename and content are required."}
        if not profiles_content:
            return {"status": "error", "message": "No profiles provided for comparison."}

        # Handle mock response if no API key
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            print("⚠️ GOOGLE_API_KEY not found. Returning mock response.")
            return {
                "status": "success",
                "message": f"Mock run complete for '{jd_filename}'",
                "top_3_matches": [
                    {
                        "profile_name": "Mock Profile 1",
                        "applicant_name": "John Doe",
                        "similarity_score": 0.88,
                        "reasoning": "Strong Python and ML experience"
                    },
                    {
                        "profile_name": "Mock Profile 2",
                        "applicant_name": "Jane Smith",
                        "similarity_score": 0.77,
                        "reasoning": "Good overlap but missing key tech"
                    },
                    {
                        "profile_name": "Mock Profile 3",
                        "applicant_name": "Alex Patel",
                        "similarity_score": 0.69,
                        "reasoning": "Partial skill match"
                    }
                ]
            }

        # Run agents
        print("🔍 Running Comparison Agent...")
        comparison_agent = ComparisonAgent(google_api_key=google_api_key)
        comparisons = comparison_agent.compare_documents(jd_content, profiles_content, jd_filename)

        if not comparisons:
            return {"status": "error", "message": "No comparison results generated."}

        print("📊 Running Ranking Agent...")
        ranking_agent = RankingAgent()
        ranked_profiles = ranking_agent.rank_profiles(comparisons)

        # Optional: Send email
        if ar_requestor_email and recruiter_email:
            try:
                print("📧 Running Communication Agent...")
                comm_agent = CommunicationAgent()
                comm_agent.send_notification(
                    ranked_profiles=ranked_profiles,
                    jd_info={"title": jd_filename},
                    ar_requestor_email=ar_requestor_email,
                    recruiter_email=recruiter_email
                )
                print("✅ Email notification sent.")
            except Exception as e:
                print(f"⚠️ Email failed: {e}")
        else:
            print("ℹ️ Skipping email: missing AR or recruiter email")

        return {
            "status": "success",
            "message": f"Agent workflow completed for '{jd_filename}'",
            "top_3_matches": ranked_profiles[:3]
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to process request: {str(e)}"
        }


if __name__ == "__main__":
    print("🚀 Starting agent server...")
    print("📡 Available at: http://localhost:8000")
    print("🏥 Health check: http://localhost:8000/health")
    print("📄 Upload endpoint: http://localhost:8000/process-upload")
    print("🤖 Run Agent endpoint: http://localhost:8000/run-agent")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
