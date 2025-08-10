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
