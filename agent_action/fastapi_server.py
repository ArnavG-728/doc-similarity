from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import sys
from typing import Optional, Dict, Any, List
from datetime import datetime
from bson import ObjectId
import json

# Custom JSON response class to handle ObjectId serialization
class MongoJSONResponse(JSONResponse):
    def render(self, content):
        return json.dumps(content, default=str).encode("utf-8")

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import GOOGLE_API_KEY
from agents.report_agent import ReportAgent
from agents.comparison_agent import ComparisonAgent
from agents.communication_agent import CommunicationAgent
from agents.ranking_agent import RankingAgent
from utils.document_loader import load_document

# Lazy MongoDB client initialization
mongodb_client = None

def get_mongodb_client():
    global mongodb_client
    if mongodb_client is None:
        from utils.mongodb_client import mongodb_client as client
        mongodb_client = client
    return mongodb_client

# Custom JSON encoder to handle ObjectId
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

app = FastAPI(title="Document Similarity API", version="1.0.0")

# Configure custom JSON encoder
app.json_encoder = CustomJSONEncoder

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents (lazy initialization)
report_agent = None
comparison_agent = None
communication_agent = None
ranking_agent = None

def get_agents():
    global report_agent, comparison_agent, communication_agent, ranking_agent
    if report_agent is None:
        report_agent = ReportAgent(GOOGLE_API_KEY)
        comparison_agent = ComparisonAgent(GOOGLE_API_KEY)
        communication_agent = CommunicationAgent()
        ranking_agent = RankingAgent()
    return report_agent, comparison_agent, communication_agent, ranking_agent

# Initialize MongoDB connection
@app.on_event("startup")
async def startup_event():
    """Initialize MongoDB connection on startup"""
    try:
        client = get_mongodb_client()
        await client.connect_async()
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    if mongodb_client:
        mongodb_client.disconnect()
        print("✅ MongoDB disconnected")

def serialize_mongo_data(data):
    """Serialize MongoDB data to JSON-safe format"""
    if isinstance(data, list):
        return [serialize_mongo_data(item) for item in data]
    elif isinstance(data, dict):
        return {k: serialize_mongo_data(v) for k, v in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    elif hasattr(data, '__dict__'):
        # Handle objects with __dict__ attribute
        return serialize_mongo_data(data.__dict__)
    else:
        return data

@app.get("/")
async def root():
    return {"message": "Document Similarity API is running", "database": "MongoDB"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        client = get_mongodb_client()
        await client.connect_async()
        return {
            "status": "healthy",
            "database": "MongoDB",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# MongoDB Data Endpoints
@app.get("/api/mongodb/profiles/{user_id}")
async def get_profile(user_id: str):
    """Get user profile from MongoDB"""
    try:
        profile = await mongodb_client.get_profile_async(user_id)
        if profile:
            return MongoJSONResponse(content=profile)
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mongodb/profiles")
async def create_profile(profile_data: Dict[str, Any]):
    """Create user profile in MongoDB"""
    try:
        profile_data["created_at"] = datetime.now().isoformat()
        profile_data["updated_at"] = datetime.now().isoformat()
        profile_id = await mongodb_client.create_profile_async(profile_data)
        if profile_id:
            return {"id": profile_id, "message": "Profile created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mongodb/job-descriptions")
async def get_job_descriptions(user_id: Optional[str] = None):
    """Get job descriptions from MongoDB"""
    try:
        print("DEBUG: Starting function")
        client = get_mongodb_client()
        job_descriptions = await client.get_job_descriptions_async(user_id)
        print(f"DEBUG: Retrieved {len(job_descriptions)} job descriptions")
        
        # Convert to JSON-serializable format manually
        import json
        serialized_data = []
        for doc in job_descriptions:
            serialized_doc = {}
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    serialized_doc[key] = str(value)
                else:
                    serialized_doc[key] = value
            serialized_data.append(serialized_doc)
        
        # Return as JSONResponse with custom serialization
        return JSONResponse(content=serialized_data)
        
    except Exception as e:
        print(f"DEBUG: Exception: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mongodb/job-descriptions")
async def create_job_description(job_data: Dict[str, Any]):
    """Create job description in MongoDB"""
    try:
        job_data["created_at"] = datetime.now().isoformat()
        job_data["updated_at"] = datetime.now().isoformat()
        job_id = await mongodb_client.create_job_description_async(job_data)
        if job_id:
            return {"id": job_id, "message": "Job description created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create job description")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mongodb/consultant-profiles")
async def get_consultant_profiles(user_id: Optional[str] = None):
    """Get consultant profiles from MongoDB"""
    try:
        profiles = await mongodb_client.get_consultant_profiles_async(user_id)
        return MongoJSONResponse(content=profiles)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mongodb/consultant-profiles")
async def create_consultant_profile(profile_data: Dict[str, Any]):
    """Create consultant profile in MongoDB"""
    try:
        profile_data["created_at"] = datetime.now().isoformat()
        profile_data["updated_at"] = datetime.now().isoformat()
        profile_id = await mongodb_client.create_consultant_profile_async(profile_data)
        if profile_id:
            return {"id": profile_id, "message": "Consultant profile created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create consultant profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mongodb/comparison-results")
async def get_comparison_results(user_id: Optional[str] = None):
    """Get comparison results from MongoDB"""
    try:
        results = await mongodb_client.get_comparison_results_async(user_id)
        return MongoJSONResponse(content=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mongodb/comparison-results")
async def create_comparison_result(result_data: Dict[str, Any]):
    """Create comparison result in MongoDB"""
    try:
        result_data["created_at"] = datetime.now().isoformat()
        result_id = await mongodb_client.create_comparison_result_async(result_data)
        if result_id:
            return {"id": result_id, "message": "Comparison result created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create comparison result")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mongodb/reports")
async def get_reports(user_id: Optional[str] = None):
    """Get reports from MongoDB"""
    try:
        reports = await mongodb_client.get_reports_async(user_id)
        return MongoJSONResponse(content=reports)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Document Analysis Endpoints
@app.post("/api/analyze/job-description")
async def analyze_job_description(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)
):
    """Analyze a job description document"""
    try:
        # Load document content
        content = load_document(file)
        
        # Generate report
        report = report_agent.generate_jd_report(
            jd_content=content,
            jd_title=file.filename,
            report_id=file.filename
        )
        
        # Save to MongoDB if user_id provided
        if user_id and "error" not in report:
            report_data = {
                "report_id": file.filename,
                "document_type": "job_description",
                "document_title": file.filename,
                "analysis_date": datetime.now().isoformat(),
                "report_data": report,
                "created_by": user_id
            }
            await mongodb_client.save_report_async(report_data)
        
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/consultant-profile")
async def analyze_consultant_profile(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)
):
    """Analyze a consultant profile document"""
    try:
        # Load document content
        content = load_document(file)
        
        # Generate report
        report = report_agent.generate_profile_report(
            profile_content=content,
            profile_title=file.filename,
            report_id=file.filename
        )
        
        # Save to MongoDB if user_id provided
        if user_id and "error" not in report:
            report_data = {
                "report_id": file.filename,
                "document_type": "profile",
                "document_title": file.filename,
                "analysis_date": datetime.now().isoformat(),
                "report_data": report,
                "created_by": user_id
            }
            await mongodb_client.save_report_async(report_data)
        
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/compare")
async def compare_documents(
    jd_file: UploadFile = File(...),
    profile_files: List[UploadFile] = File(...),
    user_id: Optional[str] = Form(None)
):
    """Compare a job description with consultant profiles"""
    try:
        # Load job description
        jd_content = load_document(jd_file)
        
        # Load consultant profiles
        profiles = {}
        for profile_file in profile_files:
            content = load_document(profile_file)
            profiles[profile_file.filename] = content
        
        # Perform comparison
        comparison_results = comparison_agent.compare_documents(
            jd_content=jd_content,
            profiles=profiles,
            jd_id=jd_file.filename,
            user_id=user_id
        )
        
        return {
            "job_description": jd_file.filename,
            "profiles_compared": len(profiles),
            "results": comparison_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 