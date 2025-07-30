# agent_action/agents/communication_agent.py

import email
from typing import List, Dict
import sys
import os

# Add the parent directory to the path to allow importing config and utils
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.email_sender import send_email
from config import SENDER_EMAIL

class CommunicationAgent:
    def __init__(self):
        pass

    def generate_email_content(self, jd_title: str, top_matches: List[Dict]) -> str:
        """Generates the email body for top matches (AR Requestor)."""
        email_body = f"Subject: Top Consultant Matches for Job: {jd_title}\n\n"
        email_body += "Dear AR Requestor,\n\n"
        email_body += f"Here are the top 3 consultant profiles matching your Job Description: '{jd_title}'.\n\n"

        for i, match in enumerate(top_matches):
            email_body += f"Match {i+1}:\n"
            email_body += f"  Consultant: {match['profile_name']}\n"
            email_body += f"  Applicant: {match['applicant_name']}\n"
            email_body += f"  Similarity Score: {match['similarity_score']:.2f}\n"
            email_body += f"  Reasoning: {match['reasoning']}\n\n"

        email_body += "Best regards,\nYour Recruitment Team"
        return email_body

    def generate_no_match_email_content(self, jd_title: str) -> str:
        """Generates the email body for no suitable matches (Recruiter)."""
        email_body = f"Subject: No Suitable Matches Found for Job: {jd_title}\n\n"
        email_body += "Dear Recruiter,\n\n"
        email_body += f"We could not find suitable consultant profiles matching your Job Description: '{jd_title}'.\n"
        email_body += "Please review the JD or consider expanding your search criteria.\n\n"
        email_body += "Best regards,\nYour Recruitment Team"
        return email_body

    def generate_recruiter_match_found_email(self, jd_title: str, top_matches: List[Dict]) -> str:
        """Generates the email body for recruiter when matches are found."""
        email_body = f"Subject: Matches Found for Job: {jd_title}\n\n"
        email_body += "Dear Recruiter,\n\n"
        email_body += f"We're pleased to inform you that matches have been found for the '{jd_title}' job profile.\n"
        email_body += "We continue to expect more profiles from you to further refine our recommendations and ensure the best candidate selection.\n\n"
        email_body += "Best regards,\nYour Recruitment Team"
        return email_body

    def send_notification(self,
                          ranked_profiles: List[Dict],
                          jd_info: Dict,
                          ar_requestor_email: str,
                          recruiter_email: str):
        """
        Sends automated emails to the AR requestor and recruiter based on results.
        """
        jd_title = jd_info.get("title", "Unknown Job")
        top_3_matches = ranked_profiles[:3]

        if top_3_matches and top_3_matches[0]['similarity_score'] > 0.5:
            # Send to AR Requestor
            email_subject = f"Top 3 Consultant Matches for {jd_title}"
            email_body = self.generate_email_content(jd_title, top_3_matches)
            send_email(ar_requestor_email, email_subject, email_body)
            print(f"Email successfully sent to AR Requestor: {ar_requestor_email} with top 3 matches.")

            # Send to Recruiter (match confirmation + encouragement)
            recruiter_subject = f"Matches Found for Job: {jd_title}"
            recruiter_body = self.generate_recruiter_match_found_email(jd_title, top_3_matches)
            send_email(recruiter_email, recruiter_subject, recruiter_body)
            print(f"Email successfully sent to Recruiter: {recruiter_email} confirming matches found.")
        else:
            # No suitable matches
            email_subject = f"No Suitable Matches Found for {jd_title}"
            email_body = self.generate_no_match_email_content(jd_title)
            send_email(recruiter_email, email_subject, email_body)
            print(f"Email successfully sent to Recruiter: {recruiter_email} about no suitable matches.")
