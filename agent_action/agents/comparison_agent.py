# agent_action/agents/comparison_agent.py

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict
import os
import json


class ComparisonResult(BaseModel):
    profile_name: str = Field(description="Name of the consultant profile.")
    applicant_name: str = Field(description="Name of the applicant within the content of the profile in title case.")
    similarity_score: float = Field(description="A similarity score between 0.0 and 1.0, where 1.0 is a perfect match.")
    reasoning: str = Field(description="Brief explanation for the similarity score. It should be in bullet points")


class ComparisonOutput(BaseModel):
    comparisons: List[ComparisonResult]


class ComparisonAgent:
    def __init__(self, google_api_key: str):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=google_api_key)
        self.parser = JsonOutputParser(pydantic_object=ComparisonOutput)

        self.prompt = PromptTemplate(
            template="""
            You are an expert recruitment analyst. Your task is to compare a Job Description (JD) with several Consultant Profiles and assess their similarity based on skills, experience, and contextual relevance. You have to be very strict with the JD and the profiles. Please assess the core skills and experience of the JD and the profiles.

            For each consultant profile, provide a similarity score between 0.0 and 1.0 (where 1.0 is a perfect match) and a brief reasoning. The similarity score should be based on the skills, experience, and contextual relevance of the JD and the profile.
            If a consultant profile matches more than 85% of the job description, then extra skills are considered as a bonus.

            Job Description:
            {jd_content}

            Consultant Profiles:
            {profiles_content}

            Output in JSON format:
            {format_instructions}
            """,
            input_variables=["jd_content", "profiles_content"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )

        self.chain = self.prompt | self.llm | self.parser

    def compare_documents(self, jd_content: str, profiles: Dict[str, str], jd_id: str = None) -> List[Dict]:
        """
        Compares a JD with consultant profiles and saves the report if jd_id is given.

        Args:
            jd_content: The job description text.
            profiles: Dictionary of profile name to content.
            jd_id: Optional filename or identifier for saving the report.

        Returns:
            List of dictionaries with comparison results.
        """
        if not profiles:
            return []

        profiles_text = ""
        for name, content in profiles.items():
            profiles_text += f"\n--- Consultant Profile: {name} ---\n{content}\n"

        try:
            result = self.chain.invoke({
                "jd_content": jd_content,
                "profiles_content": profiles_text
            })

            comparisons = (
                result.get("comparisons", []) if isinstance(result, dict)
                else [r.dict() for r in result.comparisons]
                if isinstance(result, ComparisonOutput)
                else []
            )

            if jd_id:
                self.save_report(jd_id, comparisons)

            return comparisons

        except Exception as e:
            print(f"❌ Error in ComparisonAgent: {e}")
            return []

    def save_report(self, jd_id: str, comparison_results: List[Dict], output_dir: str = "reports"):
        """
        Save the comparison results to a JSON file, overwriting any existing report.

        Args:
            jd_id: The identifier (usually filename) for the JD.
            comparison_results: The results to save.
            output_dir: Folder to store reports.
        """
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.splitext(jd_id)[0]
        output_path = os.path.join(output_dir, f"{filename}_report.json")

        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(comparison_results, f, indent=2)
            print(f"✅ Updated report: {output_path}")
        except Exception as e:
            print(f"❌ Failed to save report for {jd_id}: {e}")

