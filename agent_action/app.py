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
    
    # Get ConsultantProfile collection to map names to IDs
    consultant_collection = db["consultantprofiles"]
    
    # Build a map of profile names to MongoDB IDs
    profile_name_to_id = {}
    profile_names = [result["profile_name"] for result in state["comparison_results"]]
    
    # Query ConsultantProfile collection to get actual IDs
    consultant_docs = consultant_collection.find({"name": {"$in": profile_names}}, {"name": 1})
    for doc in consultant_docs:
        profile_name_to_id[doc["name"]] = doc["_id"]
    
    print(f"Found {len(profile_name_to_id)} profile mappings: {profile_name_to_id}")
    
    profile_ids = []
    results = []
    top_profiles = []

    for result in state["comparison_results"]:
        profile_name = result["profile_name"]
        profile_id = profile_name_to_id.get(profile_name)
        
        if profile_id:
            profile_ids.append(profile_id)
            results.append({
                "profileId": profile_id,
                "similarityScore": result["similarity_score"],
                "name": result.get("applicant_name", profile_name)  # Include candidate name
            })
        else:
            print(f"⚠️ Warning: Could not find ConsultantProfile for name: {profile_name}")

    for prof in state["ranked_profiles"][:3]:
        profile_name = prof["profile_name"]
        profile_id = profile_name_to_id.get(profile_name)
        
        if profile_id:
            top_profiles.append({
                "profileId": profile_id,
                "similarityScore": prof["similarity_score"],
                "name": prof.get("applicant_name", profile_name)  # Include candidate name
            })
        else:
            print(f"⚠️ Warning: Could not find ConsultantProfile for top profile: {profile_name}")

    comparison_doc = {
        "jobIds": [job_obj_id],
        "profileIds": profile_ids,
        "results": results,
        "topProfiles": top_profiles,
        "createdBy": ObjectId(state["created_by"]),
        "createdAt": datetime.utcnow()
    }
    
    print(f"📦 Saving ComparisonResult with {len(results)} results and {len(top_profiles)} top profiles")
    print(f"Sample result: {results[0] if results else 'None'}")
    print(f"Sample top profile: {top_profiles[0] if top_profiles else 'None'}")
    
    comparison_collection.insert_one(comparison_doc)
    print("✅ Successfully stored comparison session in DB.")

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
