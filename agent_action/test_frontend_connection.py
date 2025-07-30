
"""
Test script to verify frontend-backend connection.
"""

import requests
import json

def test_frontend_connection():
    """Test the connection that the frontend would make."""
    
    # Test data similar to what frontend would send
    test_data = {
        "jd_filename": "senior_developer.txt",
        "jd_content": """
Job Title: Senior Software Engineer
Company: TechCorp
Location: Remote
Salary: $120,000 - $150,000

Requirements:
- 5+ years of experience in software development
- Strong knowledge of Python, JavaScript, and React
- Experience with cloud platforms (AWS, Azure, or GCP)
- Familiarity with microservices architecture
- Experience with CI/CD pipelines
- Strong problem-solving skills
- Excellent communication skills

Responsibilities:
- Design and implement scalable software solutions
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews
- Contribute to technical architecture decisions
        """,
        "profiles_content": {
            "john_doe_profile.txt": """
Name: John Doe
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

Experience: 7 years
Current Role: Senior Software Engineer at TechStartup

Skills:
- Python (Expert)
- JavaScript (Expert)
- React (Advanced)
- Node.js (Advanced)
- AWS (Intermediate)
- Docker (Intermediate)
- Git (Expert)

Education:
- BS Computer Science, Stanford University

Recent Projects:
- Led development of microservices architecture
- Implemented CI/CD pipeline reducing deployment time by 60%
- Mentored 3 junior developers
        """,
            "jane_smith_profile.txt": """
Name: Jane Smith
Email: jane.smith@email.com
Phone: (555) 987-6543
Location: New York, NY

Experience: 4 years
Current Role: Full Stack Developer at StartupXYZ

Skills:
- JavaScript (Expert)
- React (Expert)
- Node.js (Advanced)
- Python (Intermediate)
- MongoDB (Advanced)
- Express.js (Advanced)
- Git (Advanced)

Education:
- BS Software Engineering, MIT

Recent Projects:
- Built scalable web applications
- Implemented real-time features using WebSockets
- Optimized database queries improving performance by 40%
        """
        }
    }
    
    try:
        print("🧪 Testing frontend-backend connection...")
        
        # Test the endpoint
        response = requests.post(
            "http://localhost:8000/run-agent",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Response: {json.dumps(result, indent=2)}")
            
            if result.get("status") == "success":
                print("🎉 Backend is working correctly!")
                matches = result.get("top_3_matches", [])
                print(f"📊 Found {len(matches)} matches")
                for i, match in enumerate(matches, 1):
                    print(f"  {i}. {match.get('profile_name')} - {match.get('similarity_score', 0):.1%} match")
            else:
                print(f"❌ Backend returned error: {result.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on http://localhost:8000")
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The server might be overloaded.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_frontend_connection() 