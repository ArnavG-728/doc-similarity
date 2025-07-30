# config.py
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
JD_FOLDER = "data/jd"
PROFILES_FOLDER = "data/profiles"

# Email Configuration (for placeholder)
SENDER_EMAIL = "arnavstudies28@gmail.com"