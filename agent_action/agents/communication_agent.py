# # agent_action/agents/communication_agent.py

# import email
# from typing import List, Dict
# import sys
# import os
# import logging

# from pymongo import MongoClient
# from bson import ObjectId
# import base64

# # Setup logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Connect to MongoDB
# # try:
# #     mongo_uri = os.getenv("MONGODB_URI")
# #     db_name = os.getenv("DB_NAME")

# #     if not mongo_uri:
# #         raise ValueError("❌ MONGODB_URI is not set in environment variables.")
# #     if not db_name:
# #         raise ValueError("❌ DB_NAME is not set in environment variables.")

# #     client = MongoClient(mongo_uri)
# #     db = client[db_name]
# #     logger.info(f"✅ Connected to MongoDB: {mongo_uri}")
# #     logger.info(f"✅ Accessing database: {db_name}")

# #     profile_collection = db["ConsultantProfile"]
# #     logger.info("✅ ConsultantProfile collection accessed successfully.")

# # except Exception as e:
# #     logger.error(f"❌ Failed to connect to MongoDB or access collection: {e}")
# #     raise

# db = MongoClient(os.getenv("MONGODB_URI"))
# # db = client[os.getenv("DB_NAME")]
# profile_collection = db["ConsultantProfile"]

# # Add the parent directory to the path to allow importing config and utils
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from utils.email_sender import send_email
# from config import SENDER_EMAIL

# class CommunicationAgent:
#     def __init__(self):
#         pass

#     def generate_email_content(self, jd_title: str, top_matches: List[Dict]) -> str:
#         """Generates the email body for top matches (AR Requestor)."""
#         email_body = f"Subject: Top Consultant Matches for Job: {jd_title}\n\n"
#         email_body += "Dear AR Requestor,\n\n"
#         email_body += f"Here are the top 3 consultant profiles matching your Job Description: '{jd_title}'.\n\n"

#         for i, match in enumerate(top_matches):
#             email_body += f"Match {i+1}:\n"
#             email_body += f"  Consultant: {match['profile_name']}\n"
#             email_body += f"  Applicant: {match['applicant_name']}\n"
#             email_body += f"  Similarity Score: {match['similarity_score']:.2f}\n"
#             email_body += f"  Reasoning: {match['reasoning']}\n\n"

#         email_body += "Best regards,\nYour Recruitment Team"
#         return email_body

#     def generate_no_match_email_content(self, jd_title: str) -> str:
#         """Generates the email body for no suitable matches (Recruiter)."""
#         email_body = f"Subject: No Suitable Matches Found for Job: {jd_title}\n\n"
#         email_body += "Dear Recruiter,\n\n"
#         email_body += f"We could not find suitable consultant profiles matching your Job Description: '{jd_title}'.\n"
#         email_body += "Please review the JD or consider expanding your search criteria.\n\n"
#         email_body += "Best regards,\nYour Recruitment Team"
#         return email_body

#     def generate_recruiter_match_found_email(self, jd_title: str, top_matches: List[Dict]) -> str:
#         """Generates the email body for recruiter when matches are found."""
#         email_body = f"Subject: Matches Found for Job: {jd_title}\n\n"
#         email_body += "Dear Recruiter,\n\n"
#         email_body += f"We're pleased to inform you that matches have been found for the '{jd_title}' job profile.\n"
#         email_body += "We continue to expect more profiles from you to further refine our recommendations and ensure the best candidate selection.\n\n"
#         email_body += "Best regards,\nYour Recruitment Team"
#         return email_body

#     # def send_notification(self,
#     #                       ranked_profiles: List[Dict],
#     #                       jd_info: Dict,
#     #                       ar_requestor_email: str,
#     #                       recruiter_email: str):
#     #     """
#     #     Sends automated emails to the AR requestor and recruiter based on results.
#     #     """
#     #     jd_title = jd_info.get("title", "Unknown Job")
#     #     top_3_matches = ranked_profiles[:3]

#     #     if top_3_matches and top_3_matches[0]['similarity_score'] > 0.5:
#     #         # Send to AR Requestor
#     #         email_subject = f"Top 3 Consultant Matches for {jd_title}"
#     #         email_body = self.generate_email_content(jd_title, top_3_matches)
#     #         send_email(ar_requestor_email, email_subject, email_body)
#     #         print(f"Email successfully sent to AR Requestor: {ar_requestor_email} with top 3 matches.")

#     #         # Send to Recruiter (match confirmation + encouragement)
#     #         recruiter_subject = f"Matches Found for Job: {jd_title}"
#     #         recruiter_body = self.generate_recruiter_match_found_email(jd_title, top_3_matches)
#     #         send_email(recruiter_email, recruiter_subject, recruiter_body)
#     #         print(f"Email successfully sent to Recruiter: {recruiter_email} confirming matches found.")
#     #     else:
#     #         # No suitable matches
#     #         email_subject = f"No Suitable Matches Found for {jd_title}"
#     #         email_body = self.generate_no_match_email_content(jd_title)
#     #         send_email(recruiter_email, email_subject, email_body)
#     #         print(f"Email successfully sent to Recruiter: {recruiter_email} about no suitable matches.")


# def send_notification(self,
#                       ranked_profiles: List[Dict],
#                       jd_info: Dict,
#                       ar_requestor_email: str,
#                       recruiter_email: str):

#     jd_title = jd_info.get("title", "Unknown Job")
#     top_3_matches = ranked_profiles[:3]

#     # ✅ Prepare attachments
#     attachments = []
#     for profile in top_3_matches:
#         profile_id = profile.get("profile_id") or profile.get("profileId")
#         if profile_id:
#             record = profile_collection.find_one({"_id": ObjectId(profile_id)})
#             if record and "pdfFile" in record:
#                 attachments.append({
#                     "filename": f"{record['name'].replace(' ', '_')}.pdf",
#                     "data": record["pdfFile"]["data"]
#                 })

#     if top_3_matches and top_3_matches[0]['similarity_score'] > 0.5:
#         # Email AR Requestor with attachments
#         email_subject = f"Top 3 Consultant Matches for {jd_title}"
#         email_body = self.generate_email_content(jd_title, top_3_matches)
#         send_email(ar_requestor_email, email_subject, email_body, attachments)
#         print(f"✅ Email sent to AR Requestor: {ar_requestor_email} with top 3 resumes attached.")

#         # Recruiter gets confirmation only
#         recruiter_subject = f"Matches Found for Job: {jd_title}"
#         recruiter_body = self.generate_recruiter_match_found_email(jd_title, top_3_matches)
#         send_email(recruiter_email, recruiter_subject, recruiter_body)
#         print(f"📩 Email sent to Recruiter: {recruiter_email}")
#     else:
#         email_subject = f"No Suitable Matches Found for {jd_title}"
#         email_body = self.generate_no_match_email_content(jd_title)
#         send_email(recruiter_email, email_subject, email_body)
#         print(f"⚠️ Email sent to Recruiter: {recruiter_email} — no matches.")




# from typing import List, Dict
# import logging
# import os
# import sys
# from pymongo import MongoClient
# from bson import ObjectId

# # Add parent directory to path for config/util imports
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from utils.email_sender import send_email
# from config import SENDER_EMAIL

# # Setup logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# client = MongoClient(os.getenv("MONGODB_URI"))
# db = client.get_default_database()  # ✅ Extracts `doc-similarity` from URI

# # OR (more robust)
# # db = client[os.getenv("DB_NAME")] 
# profile_collection = db["consultantprofiles"]
# print("🧠 Current DB Name:", db.name)
# print("📂 Collections:", db.list_collection_names())
# print("🔍 Sample ConsultantProfile:", profile_collection.find_one())
# # logger.info("✅ Connected to MongoDB", db)
# logger.info("✅ Connected to MongoDB: %s", db)


# class CommunicationAgent:
#     def __init__(self):
#         pass

#     def generate_email_content(self, jd_title: str, top_matches: List[Dict]) -> str:
#         email_body = f"Subject: Top Consultant Matches for Job: {jd_title}\n\n"
#         email_body += "Dear AR Requestor,\n\n"
#         email_body += f"Here are the top 3 consultant profiles matching your Job Description: '{jd_title}'.\n\n"

#         for i, match in enumerate(top_matches):
#             email_body += f"Match {i+1}:\n"
#             email_body += f"  Consultant: {match['profile_name']}\n"
#             email_body += f"  Applicant: {match['applicant_name']}\n"
#             email_body += f"  Similarity Score: {match['similarity_score']:.2f}\n"
#             email_body += f"  Reasoning: {match['reasoning']}\n\n"

#         email_body += "Best regards,\nYour Recruitment Team"
#         return email_body

#     def generate_no_match_email_content(self, jd_title: str) -> str:
#         return (
#             f"Subject: No Suitable Matches Found for Job: {jd_title}\n\n"
#             "Dear Recruiter,\n\n"
#             f"We could not find suitable consultant profiles matching your Job Description: '{jd_title}'.\n"
#             "Please review the JD or consider expanding your search criteria.\n\n"
#             "Best regards,\nYour Recruitment Team"
#         )

#     def generate_recruiter_match_found_email(self, jd_title: str, top_matches: List[Dict]) -> str:
#         return (
#             f"Subject: Matches Found for Job: {jd_title}\n\n"
#             "Dear Recruiter,\n\n"
#             f"Matches have been found for the '{jd_title}' job profile.\n"
#             "You may upload more profiles to improve matching further.\n\n"
#             "Best regards,\nYour Recruitment Team"
#         )

#     def send_notification(self,
#                           ranked_profiles: List[Dict],
#                           jd_info: Dict,
#                           ar_requestor_email: str,
#                           recruiter_email: str):
#         jd_title = jd_info.get("title", "Unknown Job")
#         top_3_matches = ranked_profiles[:3]

#         # Prepare attachments from ConsultantProfile collection
#         attachments = []
#         for profile in top_3_matches:
#             profile_id = profile.get("profile_id") or profile.get("profileId")
#             if profile_id:
#                 record = profile_collection.find_one({"_id": ObjectId(profile_id)})
#                 if record and "pdfFile" in record:
#                     attachments.append({
#                         "filename": f"{record['name'].replace(' ', '_')}.pdf",
#                         "data": record["pdfFile"]["data"]
#                     })

#         if top_3_matches and top_3_matches[0]["similarity_score"] > 0.5:
#             # Send email to AR Requestor with resume attachments
#             ar_subject = f"Top 3 Consultant Matches for {jd_title}"
#             ar_body = self.generate_email_content(jd_title, top_3_matches)
#             send_email(ar_requestor_email, ar_subject, ar_body, attachments)
#             print(f"✅ Email sent to AR Requestor: {ar_requestor_email}")

#             # Send summary email to Recruiter
#             recruiter_subject = f"Matches Found for Job: {jd_title}"
#             recruiter_body = self.generate_recruiter_match_found_email(jd_title, top_3_matches)
#             send_email(recruiter_email, recruiter_subject, recruiter_body)
#             print(f"📩 Email sent to Recruiter: {recruiter_email}")
#         else:
#             # No suitable matches — notify recruiter only
#             no_match_subject = f"No Suitable Matches Found for {jd_title}"
#             no_match_body = self.generate_no_match_email_content(jd_title)
#             send_email(recruiter_email, no_match_subject, no_match_body)
#             print(f"⚠️ No matches email sent to Recruiter: {recruiter_email}")










# from typing import List, Dict
# import logging
# import os
# import sys
# from pymongo import MongoClient
# from bson import ObjectId

# # Add parent directory to path for config/util imports
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from utils.email_sender import send_email
# from config import SENDER_EMAIL

# # Setup logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # MongoDB connection
# client = MongoClient(os.getenv("MONGODB_URI"))
# db = client.get_default_database()  # Extracts from URI

# logger.info(f"✅ Connected to MongoDB: {db.name}")

# # ConsultantProfile collection
# profile_collection = db["consultantprofiles"]
# logger.info("🔍 Sample ConsultantProfile: %s", profile_collection.find_one())


# class CommunicationAgent:
#     def __init__(self):
#         pass

#     def generate_email_content(self, jd_title: str, top_matches: List[Dict]) -> str:
#         email_body = f"Subject: Top Consultant Matches for Job: {jd_title}\n\n"
#         email_body += "Dear AR Requestor,\n\n"
#         email_body += f"Here are the top 3 consultant profiles matching your Job Description: '{jd_title}'.\n\n"

#         for i, match in enumerate(top_matches):
#             email_body += f"Match {i+1}:\n"
#             email_body += f"  Consultant: {match['profile_name']}\n"
#             email_body += f"  Applicant: {match['applicant_name']}\n"
#             email_body += f"  Similarity Score: {match['similarity_score']:.2f}\n"
#             email_body += f"  Reasoning: {match['reasoning']}\n\n"

#         email_body += "Best regards,\nYour Recruitment Team"
#         return email_body

#     def generate_no_match_email_content(self, jd_title: str) -> str:
#         return (
#             f"Subject: No Suitable Matches Found for Job: {jd_title}\n\n"
#             "Dear Recruiter,\n\n"
#             f"We could not find suitable consultant profiles matching your Job Description: '{jd_title}'.\n"
#             "Please review the JD or consider expanding your search criteria.\n\n"
#             "Best regards,\nYour Recruitment Team"
#         )

#     def generate_recruiter_match_found_email(self, jd_title: str, top_matches: List[Dict]) -> str:
#         return (
#             f"Subject: Matches Found for Job: {jd_title}\n\n"
#             "Dear Recruiter,\n\n"
#             f"Matches have been found for the '{jd_title}' job profile.\n"
#             "You may upload more profiles to improve matching further.\n\n"
#             "Best regards,\nYour Recruitment Team"
#         )

#     def send_notification(self,
#                           ranked_profiles: List[Dict],
#                           jd_info: Dict,
#                           ar_requestor_email: str,
#                           recruiter_email: str):
#         jd_title = jd_info.get("title", "Unknown Job")
#         top_3_matches = ranked_profiles[:3]

#         # Prepare attachments from ConsultantProfile collection
#         attachments = []
#         for profile in top_3_matches:
#             profile_id = profile.get("profile_id") or profile.get("profileId")
#             if profile_id:
#                 record = profile_collection.find_one({"_id": ObjectId(profile_id)})
#                 if record and "pdfFile" in record:
#                     attachments.append({
#                         "filename": f"{record['name'].replace(' ', '_')}.pdf",
#                         "data": record["pdfFile"]["data"]
#                     })

#         if top_3_matches and top_3_matches[0]["similarity_score"] > 0.5:
#             # Email to AR Requestor
#             ar_subject = f"Top 3 Consultant Matches for {jd_title}"
#             ar_body = self.generate_email_content(jd_title, top_3_matches)
#             send_email(ar_requestor_email, ar_subject, ar_body, attachments)
#             logger.info(f"✅ Email sent to AR Requestor: {ar_requestor_email}")

#             # Email to Recruiter
#             recruiter_subject = f"Matches Found for Job: {jd_title}"
#             recruiter_body = self.generate_recruiter_match_found_email(jd_title, top_3_matches)
#             send_email(recruiter_email, recruiter_subject, recruiter_body)
#             logger.info(f"📩 Email sent to Recruiter: {recruiter_email}")
#         else:
#             # No matches
#             no_match_subject = f"No Suitable Matches Found for {jd_title}"
#             no_match_body = self.generate_no_match_email_content(jd_title)
#             send_email(recruiter_email, no_match_subject, no_match_body)
#             logger.info(f"⚠️ No matches email sent to Recruiter: {recruiter_email}")













# from typing import List, Dict
# import logging
# import os
# import sys
# from pymongo import MongoClient
# from bson import ObjectId

# # Path setup
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from utils.email_sender import send_email
# from config import SENDER_EMAIL

# # Logging config
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # MongoDB setup
# client = MongoClient(os.getenv("MONGODB_URI"))
# db = client.get_database()
# logger.info(f"✅ Connected to MongoDB: {db.name}")

# # ConsultantProfile collection
# profile_collection = db["consultantprofiles"]
# sample_doc = profile_collection.find_one()
# logger.info("📄 Sample ConsultantProfile fetched: %s", sample_doc if sample_doc else "None found")

# class CommunicationAgent:
#     def __init__(self):
#         pass

#     def generate_email_content(self, jd_title: str, top_matches: List[Dict]) -> str:
#         body = f"Dear AR Requestor,\n\nHere are the top 3 consultant profiles matching the Job Description: '{jd_title}':\n\n"
#         for i, match in enumerate(top_matches):
#             body += f"Match {i + 1}:\n"
#             body += f"  Consultant: {match.get('profile_name')}\n"
#             body += f"  Applicant: {match.get('applicant_name')}\n"
#             body += f"  Score: {match.get('similarity_score'):.2f}\n"
#             body += f"  Reason: {match.get('reasoning')}\n\n"
#         body += "Best,\nRecruitment Team"
#         return body

#     def generate_no_match_email_content(self, jd_title: str) -> str:
#         return (
#             f"Dear Recruiter,\n\n"
#             f"No suitable matches were found for the Job Description: '{jd_title}'.\n"
#             "Please review or widen the criteria.\n\nBest,\nRecruitment Team"
#         )

#     def generate_recruiter_match_found_email(self, jd_title: str, top_matches: List[Dict]) -> str:
#         return (
#             f"Dear Recruiter,\n\n"
#             f"Top matches were found for JD: '{jd_title}'.\n"
#             "You may upload more profiles to refine results.\n\nBest,\nRecruitment Team"
#         )

#     def send_notification(self,
#                           ranked_profiles: List[Dict],
#                           jd_info: Dict,
#                           ar_requestor_email: str,
#                           recruiter_email: str):
#         jd_title = jd_info.get("title", "Unknown JD")
#         top_3 = ranked_profiles[:3]
#         attachments = []

#         logger.info("📩 Preparing email for JD: %s", jd_title)

#         for profile in top_3:
#             profile_id = profile.get("profile_id") or profile.get("profileId")
#             logger.info("🔍 Fetching profile from DB with ID: %s", profile_id)
#             if profile_id:
#                 try:
#                     record = profile_collection.find_one({"_id": ObjectId(profile_id)})
#                     if record:
#                         if "pdfFile" in record and record["pdfFile"].get("data"):
#                             attachments.append({
#                                 "filename": f"{record['name'].replace(' ', '_')}.pdf",
#                                 "data": record["pdfFile"]["data"]
#                             })
#                             logger.info("✅ Attachment added for profile: %s", record["name"])
#                         else:
#                             logger.warning("⚠️ No PDF data found for profile ID: %s", profile_id)
#                     else:
#                         logger.warning("❌ No profile record found in DB for ID: %s", profile_id)
#                 except Exception as e:
#                     logger.error("❌ Error fetching profile ID %s: %s", profile_id, e)

#         if top_3 and top_3[0].get("similarity_score", 0) > 0.5:
#             # Send to AR Requestor
#             subject = f"Top 3 Consultant Matches for {jd_title}"
#             body = self.generate_email_content(jd_title, top_3)
#             if send_email(ar_requestor_email, subject, body, attachments):
#                 logger.info("📧 Email sent to AR Requestor: %s", ar_requestor_email)
#             else:
#                 logger.error("❌ Failed to send email to AR Requestor: %s", ar_requestor_email)

#             # Send to Recruiter
#             rec_subject = f"Matches Found for JD: {jd_title}"
#             rec_body = self.generate_recruiter_match_found_email(jd_title, top_3)
#             if send_email(recruiter_email, rec_subject, rec_body):
#                 logger.info("📤 Email sent to Recruiter: %s", recruiter_email)
#             else:
#                 logger.error("❌ Failed to send email to Recruiter: %s", recruiter_email)
#         else:
#             no_match_subject = f"No Matches for JD: {jd_title}"
#             no_match_body = self.generate_no_match_email_content(jd_title)
#             if send_email(recruiter_email, no_match_subject, no_match_body):
#                 logger.warning("⚠️ Sent 'no matches' email to Recruiter: %s", recruiter_email)
#             else:
#                 logger.error("❌ Failed to send 'no matches' email to Recruiter: %s", recruiter_email)











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
        email_body = f"Subject: Top Consultant Matches for Job: {jd_title}\n\n"
        email_body += "Dear AR Requestor,\n\n"
        email_body += f"Here are the top 3 consultant profiles matching your Job Description: '{jd_title}'.\n\n"
        for i, match in enumerate(top_matches):
            email_body += f"Match {i+1}:\n"
            email_body += f"  Consultant: {match.get('profile_name')}\n"
            email_body += f"  Applicant: {match.get('applicant_name')}\n"
            email_body += f"  Similarity Score: {match.get('similarity_score'):.2f}\n"
            email_body += f"  Reasoning: {match.get('reasoning')}\n\n"
        email_body += "Best regards,\nYour Recruitment Team"
        return email_body

    def generate_no_match_email_content(self, jd_title: str) -> str:
        return (
            f"Subject: No Suitable Matches Found for Job: {jd_title}\n\n"
            f"Dear Recruiter,\n\n"
            f"We could not find suitable consultant profiles matching your Job Description: '{jd_title}'.\n"
            f"Please review the JD or consider expanding your search criteria.\n\n"
            f"Best regards,\nYour Recruitment Team"
        )

    def generate_recruiter_match_found_email(self, jd_title: str, top_matches: List[Dict]) -> str:
        return (
            f"Subject: Matches Found for Job: {jd_title}\n\n"
            f"Dear Recruiter,\n\n"
            f"We're pleased to inform you that matches have been found for the '{jd_title}' job profile.\n"
            f"We continue to expect more profiles from you to further refine our recommendations and ensure the best candidate selection.\n\n"
            f"Best regards,\nYour Recruitment Team"
        )


def send_notification(
    ranked_profiles: List[Dict],
    jd_info: Dict,
    ar_requestor_email: str,
    recruiter_email: str
):
    jd_title = jd_info.get("title", "Unknown Job")
    logger.info(f"📩 Preparing email for JD: {jd_title}")
    top_3_matches = ranked_profiles[:3]

    # ✅ Prepare attachments
    attachments = []
    for profile in top_3_matches:
        profile_id = profile.get("_id") or profile.get("profileId") or profile.get("profile._id") or profile.get("profile_id")
        logger.info(f"🔍 Fetching profile from DB with ID: {profile_id}")
        if profile_id:
            try:
                record = profile_collection.find_one({"_id": ObjectId(profile_id)})
                if record and "pdfFile" in record:
                    attachments.append({
                        "filename": f"{record['name'].replace(' ', '_')}.pdf",
                        "data": record["pdfFile"]["data"]
                    })
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch profile with ID {profile_id}: {e}")

    if top_3_matches and top_3_matches[0].get('similarity_score', 0) > 0.5:
        email_subject = f"Top 3 Consultant Matches for {jd_title}"
        email_body = CommunicationAgent().generate_email_content(jd_title, top_3_matches)
        send_email(ar_requestor_email, email_subject, email_body, attachments)
        logger.info(f"📧 Email sent to AR Requestor: {ar_requestor_email} with top 3 resumes attached.")

        recruiter_subject = f"Matches Found for Job: {jd_title}"
        recruiter_body = CommunicationAgent().generate_recruiter_match_found_email(jd_title, top_3_matches)
        send_email(recruiter_email, recruiter_subject, recruiter_body)
        logger.info(f"📨 Email sent to Recruiter: {recruiter_email}")
    else:
        email_subject = f"No Suitable Matches Found for {jd_title}"
        email_body = CommunicationAgent().generate_no_match_email_content(jd_title)
        send_email(recruiter_email, email_subject, email_body)
        logger.info(f"⚠️ Email sent to Recruiter: {recruiter_email} — no matches.")
