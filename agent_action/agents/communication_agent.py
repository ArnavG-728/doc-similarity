import os
import sys
import logging
from typing import List, Dict
from pymongo import MongoClient
from bson import ObjectId

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the parent directory to the path to allow importing config and utils
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.email_sender import send_email
from config import SENDER_EMAIL

# ✅ Connect to MongoDB
try:
    mongo_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME")

    if not mongo_uri or not db_name:
        raise ValueError("❌ MONGODB_URI or DB_NAME is not set in environment variables.")

    client = MongoClient(mongo_uri)
    db = client[db_name]
    logger.info(f"✅ Connected to MongoDB: {db_name}")

    profile_collection = db["consultantprofiles"]
    sample = profile_collection.find_one()
    logger.info(f"📄 Sample ConsultantProfile fetched: {sample if sample else 'None found'}")

except Exception as e:
    logger.error(f"❌ Failed to connect to MongoDB or access collection: {e}")
    raise


class CommunicationAgent:
    def __init__(self):
        pass

    def generate_email_content(self, jd_title: str, top_matches: List[Dict]) -> str:
        """Generates email for AR Requestor with top matches."""
        email_body = f"Subject: Top Consultant Matches for Job: {jd_title}\n\n"
        email_body += "Dear AR Requestor,\n\n"
        email_body += f"Here are the top 3 consultant profiles matching your Job Description: '{jd_title}'.\n\n"
        for i, match in enumerate(top_matches):
            email_body += f"Match {i+1}:\n"
            email_body += f"  Consultant: {match.get('profile_name')}\n"
            email_body += f"  Applicant: {match.get('applicant_name')}\n"
            email_body += f"  Similarity Score: {match.get('similarity_score', 0):.2f}\n"
            email_body += f"  Reasoning: {match.get('reasoning')}\n\n"
        email_body += "Best regards,\nYour Recruitment Team"
        return email_body

    def generate_no_match_email_content(self, jd_title: str) -> str:
        """Generates email for recruiter when no matches are found."""
        return (
            f"Subject: No Suitable Matches Found for Job: {jd_title}\n\n"
            f"Dear Recruiter,\n\n"
            f"We could not find suitable consultant profiles matching your Job Description: '{jd_title}'.\n"
            f"Please review the JD or consider expanding your search criteria.\n\n"
            f"Best regards,\nYour Recruitment Team"
        )

    def generate_recruiter_match_found_email(self, jd_title: str) -> str:
        """Generates email for recruiter when matches are found."""
        return (
            f"Subject: Matches Found for Job: {jd_title}\n\n"
            f"Dear Recruiter,\n\n"
            f"We're pleased to inform you that matches have been found for the '{jd_title}' job profile.\n"
            f"We continue to expect more profiles from you to further refine our recommendations and ensure the best candidate selection.\n\n"
            f"Best regards,\nYour Recruitment Team"
        )

    def fetch_profile_attachments(self, profiles: List[Dict]) -> List[Dict]:
        """Fetches PDF resumes for given profile IDs from MongoDB."""
        attachments = []
        for profile in profiles:
            profile_id = (
                profile.get("_id")
                or profile.get("profileId")
                or profile.get("profile._id")
                or profile.get("profile_id")
            )
            logger.info(f"🔍 Fetching profile from DB with ID: {profile_id}")
            if profile_id:
                try:
                    record = profile_collection.find_one({"_id": ObjectId(profile_id)})
                    if record and "pdfFile" in record:
                        attachments.append({
                            "filename": f"{record.get('name', 'Profile').replace(' ', '_')}.pdf",
                            "data": record["pdfFile"]["data"]
                        })
                except Exception as e:
                    logger.warning(f"⚠️ Could not fetch profile with ID {profile_id}: {e}")
        return attachments

    def send_notification(
    self,
    ranked_profiles: List[Dict],
    jd_info: Dict,
    ar_requestor_email: str,
    recruiter_email: str
    ):
        """Sends notifications based on matching results, including resume attachments."""
        jd_title = jd_info.get("title", "Unknown Job")
        logger.info(f"📩 Preparing email for JD: {jd_title}")

        top_3_matches = ranked_profiles[:3]

        # Modify list so low-similarity profiles get replaced with placeholder
        filtered_matches = []
        for match in top_3_matches:
            if match.get('similarity_score', 0) >= 0.5:
                filtered_matches.append(match)
            else:
                filtered_matches.append({
                    "profile_name": "(No profile over 50% similarity found)",
                    "applicant_name": "",
                    "similarity_score": 0,
                    "reasoning": ""
                })

        # Send only if there is at least one profile ≥ 0.50
        if any(m.get('similarity_score', 0) >= 0.5 for m in top_3_matches):
            # Fetch attachments for profiles ≥ 0.50
            attachments = self.fetch_profile_attachments(
                [m for m in top_3_matches if m.get('similarity_score', 0) >= 0.5]
            )

            # Send to AR Requestor with attachments
            email_subject = f"Top 3 Consultant Matches for {jd_title}"
            email_body = self.generate_email_content(jd_title, filtered_matches)
            send_email(ar_requestor_email, email_subject, email_body, attachments)
            logger.info(f"📧 Email sent to AR Requestor: {ar_requestor_email} with {len(attachments)} resume(s).")

            # Send to Recruiter (match confirmation)
            recruiter_subject = f"Matches Found for Job: {jd_title}"
            recruiter_body = self.generate_recruiter_match_found_email(jd_title)
            send_email(recruiter_email, recruiter_subject, recruiter_body)
            logger.info(f"📨 Email sent to Recruiter: {recruiter_email}")
        else:
            # No matches found
            email_subject = f"No Suitable Matches Found for {jd_title}"
            email_body = self.generate_no_match_email_content(jd_title)
            send_email(recruiter_email, email_subject, email_body)
            logger.info(f"⚠️ Email sent to Recruiter: {recruiter_email} — no matches.")
