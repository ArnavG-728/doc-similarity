# # agent_actions/app.py
# import os
# from dotenv import load_dotenv
# from typing import List, Dict, TypedDict, Annotated
# import operator

# from langchain_core.messages import BaseMessage
# from langgraph.graph import StateGraph, START, END

# # Import agents
# from agents.comparison_agent import ComparisonAgent
# from agents.ranking_agent import RankingAgent
# from agents.communication_agent import CommunicationAgent

# # Import utilities and config
# from utils.document_loader import load_document, load_documents_from_folder
# from config import GOOGLE_API_KEY, JD_FOLDER, PROFILES_FOLDER

# # Load environment variables
# load_dotenv()

# # --- State Definition for LangGraph ---
# class AgentState(TypedDict):
#     """
#     Represents the state of our graph.

#     Attributes:
#         jd_id: The ID of the Job Description being processed.
#         jd_content: The full content of the Job Description.
#         jd_info: Parsed information about the JD (e.g., title).
#         profiles: A dictionary of consultant profiles (name -> content).
#         comparison_results: List of dictionaries with 'profile_name', 'applicant_name', 'similarity_score', 'reasoning'.
#         ranked_profiles: List of dictionaries, sorted by similarity_score.
#         ar_requestor_email: Email of the AR requestor.
#         recruiter_email: Email of the recruiter.
#         # chat_history: List[BaseMessage] # Optional: for conversational aspects
#     """
#     jd_id: str
#     jd_content: str
#     jd_info: Dict # e.g., {"title": "Senior Software Engineer"}
#     profiles: Dict[str, str]
#     comparison_results: List[Dict]
#     ranked_profiles: List[Dict]
#     ar_requestor_email: str
#     recruiter_email: str
#     # chat_history: Annotated[List[BaseMessage], operator.add]


# # --- Agent Nodes ---
# # Initialize agents
# comparison_agent = ComparisonAgent(google_api_key=GOOGLE_API_KEY)
# ranking_agent = RankingAgent()
# communication_agent = CommunicationAgent()

# def parse_jd_title(jd_content: str) -> str:
#     """Simple function to extract job title from JD content."""
#     lines = jd_content.split('\n')
#     for line in lines:
#         if line.strip().lower().startswith("job title:"):
#             return line.split(':', 1)[1].strip()
#     return "Unknown Job"


# def compare_node(state: AgentState):
#     """
#     Node for the Comparison Agent.
#     Compares the JD with all profiles.
#     """
#     print("\n--- Executing Comparison Agent ---")
#     jd_content = state['jd_content']
#     profiles = state['profiles']
#     results = comparison_agent.compare_documents(jd_content, profiles, jd_id=jd_filename)
#     return {"comparison_results": results}

# def rank_node(state: AgentState):
#     """
#     Node for the Ranking Agent.
#     Ranks the profiles based on comparison results.
#     """
#     print("\n--- Executing Ranking Agent ---")
#     comparison_results = state['comparison_results']
#     ranked_results = ranking_agent.rank_profiles(comparison_results)
#     return {"ranked_profiles": ranked_results}

# def communicate_node(state: AgentState):
#     """
#     Node for the Communication Agent.
#     Sends email notifications.
#     """
#     print("\n--- Executing Communication Agent ---")
#     ranked_profiles = state['ranked_profiles']
#     jd_info = state['jd_info']
#     ar_email = state['ar_requestor_email']
#     recruiter_email = state['recruiter_email']
#     communication_agent.send_notification(ranked_profiles, jd_info, ar_email, recruiter_email)
#     return {} # No state change needed after sending email

# # --- LangGraph Workflow Definition ---
# workflow = StateGraph(AgentState)

# # Add nodes
# workflow.add_node("compare", compare_node)
# workflow.add_node("rank", rank_node)
# workflow.add_node("communicate", communicate_node)

# # Set up edges
# workflow.add_edge(START, "compare")
# workflow.add_edge("compare", "rank")
# workflow.add_edge("rank", "communicate")
# workflow.add_edge("communicate", END)

# # Compile and visualize the graph
# app = workflow.compile()


# # --- Main Execution ---
# if __name__ == "__main__":
#     # Ensure the folders exist
#     os.makedirs(JD_FOLDER, exist_ok=True)
#     os.makedirs(PROFILES_FOLDER, exist_ok=True)

#     # Load all JDs and Profiles
#     jd_docs = load_documents_from_folder(JD_FOLDER)
#     all_profiles = load_documents_from_folder(PROFILES_FOLDER)

#     # Mocked email addresses (these can later be read from metadata or a database)
#     ar_requestor_email = os.getenv("ar_requestor_email") #"pranavperumalofficial@gmail.com"
#     recruiter_email = os.getenv("recruiter_email") #"Gg9850@srmist.edu.in"

#     # Process each JD
#     for jd_filename, jd_content in jd_docs.items():
#         if not jd_content.strip():
#             print(f"\nSkipping empty JD file: {jd_filename}")
#             continue

#         jd_info = {"title": parse_jd_title(jd_content)}
#         print(f"\n\n📄 Starting workflow for JD: {jd_info['title']} ({jd_filename})")

#         initial_state = AgentState(
#             jd_id=jd_filename,
#             jd_content=jd_content,
#             jd_info=jd_info,
#             profiles=all_profiles,
#             comparison_results=[],
#             ranked_profiles=[],
#             ar_requestor_email=ar_requestor_email,
#             recruiter_email=recruiter_email
#         )

#         try:
#             final_state = app.invoke(initial_state)
#             top_3 = final_state["ranked_profiles"][:3]

#             print("\n✅ Workflow completed.")
#             if top_3:
#                 print("🏆 Top 3 Profiles:")
#                 for i, prof in enumerate(top_3, start=1):
#                     print(f"  {i}. {prof['profile_name']} ({prof['applicant_name']})- Score: {prof['similarity_score']:.2f}")
#             else:
#                 print("⚠️ No suitable matches found.")
#         except Exception as e:
#             print(f"❌ Error processing JD {jd_filename}: {e}")






















# agent_actions/app.py

import os
from dotenv import load_dotenv
from typing import List, Dict, TypedDict
from bson import ObjectId
from langgraph.graph import StateGraph, START, END

from agents.comparison_agent import ComparisonAgent
from agents.ranking_agent import RankingAgent
from agents.communication_agent import CommunicationAgent
from utils.document_loader import load_documents_from_folder
from config import GOOGLE_API_KEY, JD_FOLDER, PROFILES_FOLDER

from pymongo import MongoClient
from datetime import datetime
import logging
logging.basicConfig(level=logging.DEBUG)


# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
print("MONGO_URI:", MONGO_URI)
print("DB_NAME:", DB_NAME)
print("MongoClient DB List:", client.list_database_names())  # ✅ Shows if connected


client = MongoClient(MONGO_URI)
db = client[DB_NAME]
comparison_collection = db["ComparisonResult"]
# comparison_collection = db["comparisonSessions"]


# --- LangGraph State ---
class AgentState(TypedDict):
    jd_id: str
    jd_content: str
    jd_info: Dict
    profiles: Dict[str, str]
    comparison_results: List[Dict]
    ranked_profiles: List[Dict]
    ar_requestor_email: str
    recruiter_email: str
    created_by: str  # user._id

# --- Agents ---
comparison_agent = ComparisonAgent(google_api_key=GOOGLE_API_KEY)
ranking_agent = RankingAgent()
communication_agent = CommunicationAgent()

def parse_jd_title(jd_content: str) -> str:
    lines = jd_content.split('\n')
    for line in lines:
        if line.strip().lower().startswith("job title:"):
            return line.split(':', 1)[1].strip()
    return "Unknown Job"

def compare_node(state: AgentState):
    print("\n--- Executing Comparison Agent ---")
    jd_content = state['jd_content']
    profiles = state['profiles']
    results = comparison_agent.compare_documents(jd_content, profiles, jd_id=state['jd_id'])
    return {"comparison_results": results}

def rank_node(state: AgentState):
    print("\n--- Executing Ranking Agent ---")
    ranked = ranking_agent.rank_profiles(state['comparison_results'])
    return {"ranked_profiles": ranked}

def communicate_node(state: AgentState):
    print("\n--- Executing Communication Agent ---")
    communication_agent.send_notification(
        state['ranked_profiles'],
        state['jd_info'],
        state['ar_requestor_email'],
        state['recruiter_email']
    )

    # --- Save to MongoDB ---
    job_obj_id = ObjectId(state["jd_id"])
    profile_ids = []
    results = []
    top_profiles = []

    for result in state["comparison_results"]:
        profile_id = ObjectId(result["profile_id"])
        profile_ids.append(profile_id)
        results.append({
            "profileId": profile_id,
            "similarityScore": result["similarity_score"]
        })

    for prof in state["ranked_profiles"][:3]:
        top_profiles.append({
            "profileId": ObjectId(prof["profile_id"]),
            "similarityScore": prof["similarity_score"]
        })

    comparison_doc = {
        "jobIds": [job_obj_id],
        "profileIds": profile_ids,
        "results": results,
        "topProfiles": top_profiles,
        "createdBy": ObjectId(state["created_by"]),
        "createdAt": datetime.utcnow()
    }
    print(comparison_doc)
    comparison_collection.insert_one(comparison_doc)
    print("📦 Stored comparison session in DB.")

    return {}

# --- Workflow Graph ---
workflow = StateGraph(AgentState)
workflow.add_node("compare", compare_node)
workflow.add_node("rank", rank_node)
workflow.add_node("communicate", communicate_node)

workflow.add_edge(START, "compare")
workflow.add_edge("compare", "rank")
workflow.add_edge("rank", "communicate")
workflow.add_edge("communicate", END)

app = workflow.compile()
