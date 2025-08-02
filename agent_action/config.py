# config.py
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# Existing configurations
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# MongoDB configurations
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "doc-similarity")
MONGODB_COLLECTIONS = {
    "profiles": "profiles",
    "job_descriptions": "job_descriptions", 
    "consultant_profiles": "consultant_profiles",
    "comparison_results": "comparison_results",
    "reports": "reports"
}

JD_FOLDER = "data/jd"
PROFILES_FOLDER = "data/profiles"

# Email Configuration (for placeholder)
SENDER_EMAIL = "arnavstudies28@gmail.com"