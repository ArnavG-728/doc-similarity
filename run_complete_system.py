#!/usr/bin/env python3
"""
Script to run the complete agent system with all components.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def main():
    print("🚀 Starting Complete Agent System")
    print("=" * 50)
    
    # Change to the project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    # Check if we're in the right directory
    if not (project_dir / "agent_action").exists():
        print("❌ Error: agent_action directory not found")
        return
    
    # Step 1: Install Python dependencies
    print("\n📦 Step 1: Installing Python dependencies...")
    agent_dir = project_dir / "agent_action"
    os.chdir(agent_dir)
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Python dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Python dependencies: {e}")
        return
    
    # Step 2: Check environment variables
    print("\n🔧 Step 2: Checking environment variables...")
    env_file = agent_dir / ".env"
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
        print("📝 Created .env template. Please add your API keys for full functionality.")
    else:
        print("✅ .env file found")
    
    # Step 3: Create data directories
    print("\n📁 Step 3: Creating data directories...")
    os.makedirs("data/jd", exist_ok=True)
    os.makedirs("data/profiles", exist_ok=True)
    print("✅ Data directories created")
    
    # Step 4: Start the backend server
    print("\n🖥️  Step 4: Starting backend server...")
    print("📡 Backend will be available at: http://localhost:8000")
    print("🔗 API endpoint: http://localhost:8000/run-agent")
    
    try:
        # Start the server in the background
        server_process = subprocess.Popen([
            sys.executable, "server.py"
        ], cwd=agent_dir)
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Test the server
        print("\n🧪 Testing backend server...")
        test_result = subprocess.run([
            sys.executable, "test_frontend_connection.py"
        ], cwd=agent_dir, capture_output=True, text=True)
        
        if test_result.returncode == 0:
            print("✅ Backend server is working correctly!")
        else:
            print("❌ Backend server test failed")
            print(test_result.stderr)
        
        print("\n🎉 System is ready!")
        print("\n📋 Next steps:")
        print("1. Start the frontend: npm run dev")
        print("2. Open http://localhost:3000")
        print("3. Login as 'AR Requestor'")
        print("4. Upload files and test the comparison")
        print("\n💡 The backend will use mock responses if no Google API key is provided.")
        print("   Add your GOOGLE_API_KEY to .env for real agent processing.")
        
        # Keep the server running
        try:
            server_process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Shutting down server...")
            server_process.terminate()
            server_process.wait()
            print("✅ Server stopped")
            
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main() 