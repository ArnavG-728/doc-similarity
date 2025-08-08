#!/usr/bin/env python3
"""
Debug version of the server to identify issues.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Agent server is running!"}

@app.post("/run-agent")
async def run_agent(request: Request):
    try:
        data = await request.json()
        print(f"Received data: {data}")
        
        jd_filename = data.get("jd_filename")
        jd_content = data.get("jd_content")
        profiles_content = data.get("profiles_content", {})
        
        print(f"JD filename: {jd_filename}")
        print(f"JD content length: {len(jd_content) if jd_content else 0}")
        print(f"Profiles count: {len(profiles_content)}")
        
        if not jd_filename or not jd_content:
            return {"status": "error", "message": "JD filename and content are required."}

        if not profiles_content:
            return {"status": "error", "message": "No profiles provided for comparison."}

        # For now, return a mock response to test the flow
        mock_response = {
            "status": "success",
            "message": f"Agent workflow completed for '{jd_filename}'",
            "top_3_matches": [
                {
                    "profile_name": "Test Profile 1",
                    "applicant_name": "John Doe",
                    "similarity_score": 0.85,
                    "reasoning": "Strong match in Python and React skills"
                },
                {
                    "profile_name": "Test Profile 2", 
                    "applicant_name": "Jane Smith",
                    "similarity_score": 0.72,
                    "reasoning": "Good experience but missing some key skills"
                }
            ]
        }
        
        print(f"Returning response: {mock_response}")
        return mock_response

    except Exception as e:
        print(f"Error in run_agent: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("Starting debug server...")
    uvicorn.run("debug_server:app", host="0.0.0.0", port=8000, reload=True) 