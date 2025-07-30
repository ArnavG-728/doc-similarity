#!/usr/bin/env python3
"""
Test script for the agent backend server.
"""

import requests
import json

def test_agent_workflow():
    """Test the agent workflow with sample data."""
    
    # Sample test data
    test_data = {
        "jd_filename": "test_jd.txt",
        "jd_content": """
Job Title: Senior Software Engineer
Skills Required: Python, React, TypeScript, AWS
Experience: 5+ years
Responsibilities: Develop web applications, lead technical projects, mentor junior developers
        """,
        "profiles_content": {
            "profile1.txt": """
Name: John Doe
Skills: Python, React, TypeScript, AWS, Docker
Experience: 7 years
Current Role: Senior Developer at TechCorp
        """,
            "profile2.txt": """
Name: Jane Smith
Skills: JavaScript, Node.js, MongoDB
Experience: 3 years
Current Role: Full Stack Developer at StartupXYZ
        """
        }
    }
    
    try:
        # Test the endpoint
        response = requests.post(
            "http://localhost:8000/run-agent",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_agent_workflow() 