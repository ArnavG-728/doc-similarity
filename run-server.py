
"""
Script to run the agent backend server.
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Check if requirements are installed
    try:
        import fastapi
        import uvicorn
        import langchain_google_genai
        print("✅ Dependencies are installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Installing requirements...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "agent_action/requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  .env file not found. Creating template...")
        with open(env_file, "w") as f:
            f.write("""# Add your API keys and configuration here
GOOGLE_API_KEY=your_google_api_key_here
SENDER_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
AR_REQUESTOR_EMAIL=ar@example.com
RECRUITER_EMAIL=recruiter@example.com
""")
        print("📝 Created .env template. Please add your API keys.")
    
    # Create data directories if they don't exist
    os.makedirs("agent_action/data/jd", exist_ok=True)
    os.makedirs("agent_action/data/profiles", exist_ok=True)
    
    print("🚀 Starting agent backend server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("🔗 Frontend can connect to: http://localhost:8000/run-agent")
    print("📊 Available endpoints:")
    print("  - Health check: http://localhost:8000/health")
    print("  - Upload: http://localhost:8000/process-upload")
    print("  - Run Agent: http://localhost:8000/run-agent")
    print("  - Generate Report: http://localhost:8000/generate-report")
    print("  - Generate JD Report: http://localhost:8000/generate-jd-report")
    print("  - Generate Profile Report: http://localhost:8000/generate-profile-report")
    
    # Start the server using the server.py file
    subprocess.run([sys.executable, "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])
    # subprocess.run([sys.executable, "-m", "uvicorn", "agent_action.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])

if __name__ == "__main__":
    main()
