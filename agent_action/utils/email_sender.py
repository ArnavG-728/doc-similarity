# # agent_actions/utils/email_service.py
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# import os
# from dotenv import load_dotenv

# load_dotenv()

# def send_email(recipient_email: str, subject: str, body: str) -> bool:
#     """
#     Sends an email using SMTP.
    
#     Args:
#         recipient_email: Email address of the recipient
#         subject: Email subject
#         body: Email body content
        
#     Returns:
#         bool: True if email sent successfully, False otherwise
#     """
#     try:
#         # Get email configuration from environment variables
#         sender_email = os.getenv("SENDER_EMAIL", "arnavstudies28@gmail.com")
#         smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
#         smtp_port = int(os.getenv("SMTP_PORT", "587"))
#         smtp_username = os.getenv("SMTP_USERNAME", sender_email)
#         smtp_password = os.getenv("SMTP_PASSWORD")
        
#         if not smtp_password:
#             print("Warning: SMTP_PASSWORD not set. Email will not be sent.")
#             return False
        
#         # Create message
#         msg = MIMEMultipart()
#         msg['From'] = sender_email
#         msg['To'] = recipient_email
#         msg['Subject'] = subject
        
#         # Add body to email
#         msg.attach(MIMEText(body, 'plain'))
        
#         # Create SMTP session
#         server = smtplib.SMTP(smtp_server, smtp_port)
#         server.starttls()
#         server.login(smtp_username, smtp_password)
        
#         # Send email
#         text = msg.as_string()
#         server.sendmail(sender_email, recipient_email, text)
#         server.quit()
        
#         return True
        
#     except Exception as e:
#         print(f"Failed to send email: {e}")
#         return False 



import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv
from typing import List, Dict
import base64
import os

load_dotenv()

def send_email(recipient_email: str, subject: str, body: str, attachments: List[Dict] = None) -> bool:
    """
    Sends an email using SMTP, optionally with base64 PDF attachments.
    
    Args:
        recipient_email: Email address of the recipient
        subject: Email subject
        body: Email body content
        attachments: Optional list of dicts with 'filename' and 'data' (base64-encoded)
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Load SMTP configuration
        sender_email = os.getenv("SENDER_EMAIL", "arnavstudies28@gmail.com")
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME", sender_email)
        smtp_password = os.getenv("SMTP_PASSWORD")

        if not smtp_password:
            print("Warning: SMTP_PASSWORD not set. Email will not be sent.")
            return False

        # Create email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # ✅ Add optional attachments
        if attachments:
            for attachment in attachments:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(base64.b64decode(attachment["data"]))
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename={attachment['filename']}",
                )
                msg.attach(part)

        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(sender_email, recipient_email, msg.as_string())
        server.quit()

        return True

    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
