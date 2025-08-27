"""
Agent backend server implementation.
"""

import os
import tempfile
import shutil
import uvicorn
from dotenv import load_dotenv

from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# Agent imports
from agent_action.agents.comparison_agent import ComparisonAgent
from agent_action.agents.ranking_agent import RankingAgent
from agent_action.agents.communication_agent import CommunicationAgent
from agent_action.agents.report_agent import ReportAgent

# Utility imports
from agent_action.utils.document_loader import load_documents_from_folder, load_document
from agent_action.config import SENDER_EMAIL
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId


# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
comparison_collection = db["ComparisonResult"]  # Match your schema name


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
JD_FOLDER = "agent_action/data/jd"
PROFILES_FOLDER = "agent_action/data/profiles"


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
        if ar_requestor_email:
            try:
                print("📧 Running Communication Agent...")
                comm_agent = CommunicationAgent()
                comm_agent.send_notification(
                    ranked_profiles=ranked_profiles,
                    jd_info={"title": jd_filename},
                    ar_requestor_email=ar_requestor_email,
                    recruiter_email=recruiter_email or ar_requestor_email  # Use AR email as fallback for recruiter
                )

                print("✅ Email notification sent.")
            except Exception as e:
                print(f"⚠️ Email failed: {e}")
        else:
            print("ℹ️ Skipping email: missing AR requestor email")
        
        # print("🔬 Comparison Results:", comparisons)
        # print("📦 Ranked Profiles:", ranked_profiles)


        # Optional: Generate detailed report (only if requested)
        generate_report = data.get("generate_report", False)
        detailed_report = None
        
        if generate_report:
            print("📊 Running Report Agent...")
            report_agent = ReportAgent(google_api_key=google_api_key)
            detailed_report = report_agent.generate_report(
                jd_content=jd_content,
                comparison_results=ranked_profiles,
                jd_title=jd_filename,
                report_id=jd_filename
            )

            # Extract IDs and scores for storage
        job_obj_id = ObjectId(data.get("jd_id") or "000000000000000000000000")  # fallback if needed
        profile_ids = []
        results = []
        top_profiles = []
        
        for result in comparisons:
            print("📍Result entry:", result)  # helpful debug
            pid = ObjectId(result.get("profile_id") or result.get("profileId"))  # robust key handling
            profile_ids.append(pid)
            results.append({
                "profileId": pid,
                "similarityScore": result["similarity_score"]  # ensure this key is correct too
        })

        for prof in ranked_profiles[:3]:
            print("🏆 Top profile entry:", prof)  # helpful debug
            top_profiles.append({
                "profileId": ObjectId(prof.get("profile_id") or prof.get("profileId")),  # fixed
                "similarityScore": prof["similarity_score"]
        })


        # Build and insert document
        comparison_doc = {
            "jobIds": [job_obj_id],
            "profileIds": profile_ids,
            "results": results,
            "topProfiles": top_profiles,
            "createdBy": ObjectId(data.get("user_id")),  # Accept either key
            "createdAt": datetime.utcnow()
        }

        # print("📝 Inserting comparison doc:", comparison_doc)
        comparison_collection.insert_one(comparison_doc)
        print("✅ Stored comparison session in DB.")


        return {
            "status": "success",
            "message": f"Agent workflow completed for '{jd_filename}'",
            "top_3_matches": ranked_profiles[:3],
            "detailed_report": detailed_report
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to process request: {str(e)}"
        }


@app.post("/generate-report")
async def generate_report(request: Request):
    """
    Generates a detailed report based on comparison results.
    """
    try:
        print("📊 Received request to /generate-report")
        data = await request.json()

        jd_content = data.get("jd_content")
        comparison_results = data.get("comparison_results", [])
        jd_title = data.get("jd_title", "Job Description")
        report_id = data.get("report_id")

        # Validate input
        if not jd_content:
            return {"status": "error", "message": "JD content is required."}
        if not comparison_results:
            return {"status": "error", "message": "Comparison results are required."}

        # Handle mock response if no API key
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            print("⚠️ GOOGLE_API_KEY not found. Returning mock report.")
            return {
                "status": "success",
                "message": "Mock report generated",
                "report": {
                    "executive_summary": {
                        "summary": "Mock executive summary for demonstration purposes",
                        "total_profiles_analyzed": len(comparison_results),
                        "top_match_score": 0.85,
                        "average_score": 0.72,
                        "recommendations": ["Mock recommendation 1", "Mock recommendation 2"]
                    },
                    "sections": [
                        {
                            "section_title": "Mock Section",
                            "content": "Mock content for demonstration",
                            "key_points": ["Mock point 1", "Mock point 2"]
                        }
                    ],
                    "technical_analysis": "Mock technical analysis",
                    "market_insights": "Mock market insights",
                    "next_steps": ["Mock next step 1", "Mock next step 2"]
                }
            }

        # Generate report
        print("📊 Running Report Agent...")
        report_agent = ReportAgent(google_api_key=google_api_key)
        detailed_report = report_agent.generate_report(
            jd_content=jd_content,
            comparison_results=comparison_results,
            jd_title=jd_title,
            report_id=report_id
        )

        return {
            "status": "success",
            "message": f"Report generated for '{jd_title}'",
            "report": detailed_report
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to generate report: {str(e)}"
        }


@app.post("/generate-jd-report")
async def generate_jd_report(request: Request):
    """
    Generates a detailed report for a single Job Description.
    """
    try:
        print("📋 Received request to /generate-jd-report")
        data = await request.json()

        jd_content = data.get("jd_content")
        jd_title = data.get("jd_title", "Job Description")
        report_id = data.get("report_id")

        # Validate input
        if not jd_content:
            return {"status": "error", "message": "JD content is required."}

        # Handle mock response if no API key
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            print("⚠️ GOOGLE_API_KEY not found. Returning mock JD report.")
            return {
                "status": "success",
                "message": "Mock JD report generated",
                "report": {
                    "document_type": "job_description",
                    "document_title": jd_title,
                    "analysis_date": "2024-01-01 12:00:00",
                    "jd_analysis": {
                        "role_overview": "Mock role overview for demonstration",
                        "key_responsibilities": ["Mock responsibility 1", "Mock responsibility 2"],
                        "required_skills": ["Mock skill 1", "Mock skill 2"],
                        "preferred_qualifications": ["Mock qualification 1"],
                        "experience_level": "Mid-level",
                        "industry_context": "Technology",
                        "team_structure": "Small team",
                        "growth_opportunities": ["Mock opportunity 1"],
                        "compensation_indicators": ["Competitive salary"],
                        "company_culture_hints": ["Collaborative environment"]
                    },
                    "executive_summary": "Mock executive summary for JD analysis",
                    "key_insights": ["Mock insight 1", "Mock insight 2"],
                    "recommendations": ["Mock recommendation 1", "Mock recommendation 2"]
                }
            }

        # Generate JD report
        print("📋 Running Report Agent for JD...")
        report_agent = ReportAgent(google_api_key=google_api_key)
        jd_report = report_agent.generate_jd_report(
            jd_content=jd_content,
            jd_title=jd_title,
            report_id=report_id
        )

        return {
            "status": "success",
            "message": f"JD report generated for '{jd_title}'",
            "report": jd_report
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to generate JD report: {str(e)}"
        }


@app.post("/generate-profile-report")
async def generate_profile_report(request: Request):
    """
    Generates a detailed report for a single consultant profile.
    """
    try:
        print("👤 Received request to /generate-profile-report")
        data = await request.json()

        profile_content = data.get("profile_content")
        profile_title = data.get("profile_title", "Consultant Profile")
        report_id = data.get("report_id")

        # Validate input
        if not profile_content:
            return {"status": "error", "message": "Profile content is required."}

        # Handle mock response if no API key
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            print("⚠️ GOOGLE_API_KEY not found. Returning mock profile report.")
            return {
                "status": "success",
                "message": "Mock profile report generated",
                "report": {
                    "document_type": "profile",
                    "document_title": profile_title,
                    "analysis_date": "2024-01-01 12:00:00",
                    "profile_analysis": {
                        "profile_summary": "Mock profile summary for demonstration",
                        "key_skills": ["Mock skill 1", "Mock skill 2"],
                        "years_experience": "3-5 years",
                        "industry_focus": ["Technology", "Finance"],
                        "best_job_roles": [
                            {
                                "role_title": "Senior Developer",
                                "match_percentage": 85.0,
                                "reasoning": "Strong technical skills match",
                                "required_skills": ["JavaScript", "React"],
                                "profile_skills": ["JavaScript", "React", "Node.js"]
                            }
                        ],
                        "alternative_roles": [
                            {
                                "role_title": "Tech Lead",
                                "match_percentage": 75.0,
                                "reasoning": "Good leadership potential",
                                "required_skills": ["Leadership", "Architecture"],
                                "profile_skills": ["Team Management", "System Design"]
                            }
                        ],
                        "keywords_for_search": ["JavaScript", "React", "Node.js", "Full Stack"],
                        "career_recommendations": ["Mock recommendation 1", "Mock recommendation 2"]
                    },
                    "executive_summary": "Mock executive summary for profile analysis",
                    "key_insights": ["Mock insight 1", "Mock insight 2"],
                    "recommendations": ["Mock recommendation 1", "Mock recommendation 2"]
                }
            }

        # Generate profile report
        print("👤 Running Report Agent for Profile...")
        report_agent = ReportAgent(google_api_key=google_api_key)
        profile_report = report_agent.generate_profile_report(
            profile_content=profile_content,
            profile_title=profile_title,
            report_id=report_id
        )

        return {
            "status": "success",
            "message": f"Profile report generated for '{profile_title}'",
            "report": profile_report
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to generate profile report: {str(e)}"
        }


if __name__ == "__main__":
    print("🚀 Starting agent server...")
    print("📡 Available at: http://localhost:8000")
    print("🏥 Health check: http://localhost:8000/health")
    print("📄 Upload endpoint: http://localhost:8000/process-upload")
    print("🤖 Run Agent endpoint: http://localhost:8000/run-agent")
    print("📊 Generate Report endpoint: http://localhost:8000/generate-report")
    print("📋 Generate JD Report endpoint: http://localhost:8000/generate-jd-report")
    print("👤 Generate Profile Report endpoint: http://localhost:8000/generate-profile-report")
    # Render provides PORT environment variable; default to 8000 locally.
    # Disable reload by default in production; enable by setting RELOAD=true.
    port = int(os.getenv("PORT", "8000"))
    reload_flag = os.getenv("RELOAD", "true").lower() == "true"
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=reload_flag)