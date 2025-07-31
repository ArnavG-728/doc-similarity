# agent_action/agents/report_agent.py

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
import os
import json
from datetime import datetime


class JobRoleSuggestion(BaseModel):
    role_title: str = Field(description="Title of the suggested job role")
    match_percentage: float = Field(description="How well the profile matches this role (0-100%)")
    reasoning: str = Field(description="Why this role is a good match")
    required_skills: List[str] = Field(description="Key skills needed for this role")
    profile_skills: List[str] = Field(description="Skills from the profile that match")


class ProfileAnalysis(BaseModel):
    profile_summary: str = Field(description="Summary of the consultant's background and experience")
    key_skills: List[str] = Field(description="Main technical and soft skills identified")
    years_experience: str = Field(description="Estimated years of experience")
    industry_focus: List[str] = Field(description="Industries or domains they've worked in")
    best_job_roles: List[JobRoleSuggestion] = Field(description="Top 3-5 job roles that best match this profile")
    alternative_roles: List[JobRoleSuggestion] = Field(description="Alternative job roles to consider")
    keywords_for_search: List[str] = Field(description="Keywords for job search optimization")
    career_recommendations: List[str] = Field(description="Career development suggestions")


class JobDescriptionAnalysis(BaseModel):
    role_overview: str = Field(description="Clear explanation of what this job role is")
    key_responsibilities: List[str] = Field(description="Main responsibilities and duties")
    required_skills: List[str] = Field(description="Technical and soft skills required")
    preferred_qualifications: List[str] = Field(description="Nice-to-have qualifications")
    experience_level: str = Field(description="Junior, Mid-level, Senior, or Lead level")
    industry_context: str = Field(description="Industry or domain context")
    team_structure: str = Field(description="Team size and reporting structure if mentioned")
    growth_opportunities: List[str] = Field(description="Career growth and learning opportunities")
    compensation_indicators: List[str] = Field(description="Salary range indicators or benefits mentioned")
    company_culture_hints: List[str] = Field(description="Company culture and work environment hints")


class DocumentReport(BaseModel):
    document_type: Literal["job_description", "profile"] = Field(description="Type of document being analyzed")
    document_title: str = Field(description="Title or name of the document")
    analysis_date: str = Field(description="Date and time of analysis")
    
    # For Job Descriptions
    jd_analysis: Optional[JobDescriptionAnalysis] = Field(description="Analysis specific to job descriptions")
    
    # For Profiles
    profile_analysis: Optional[ProfileAnalysis] = Field(description="Analysis specific to consultant profiles")
    
    # Common fields
    executive_summary: str = Field(description="Executive summary of the document analysis")
    key_insights: List[str] = Field(description="Key insights and takeaways")
    recommendations: List[str] = Field(description="Actionable recommendations")


class ReportAgent:
    def __init__(self, google_api_key: str):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=google_api_key)
        self.parser = JsonOutputParser(pydantic_object=DocumentReport)
        
        # Prompt for Job Description analysis
        self.jd_prompt = PromptTemplate(
            template="""
            You are an expert recruitment analyst and job description specialist. Your task is to analyze a Job Description (JD) and create a comprehensive report explaining what the role is, what it requires, and providing detailed insights.

            Analyze the following job description and provide:
            1. Clear explanation of what this job role is
            2. Key responsibilities and duties
            3. Required skills (technical and soft skills)
            4. Preferred qualifications
            5. Experience level assessment
            6. Industry context and team structure
            7. Growth opportunities and compensation indicators
            8. Company culture hints

            Job Description:
            {document_content}

            Document Title: {document_title}
            Analysis Date: {analysis_date}

            Focus on providing actionable insights that would help:
            - Candidates understand if this role is right for them
            - Recruiters understand what to look for in candidates
            - Hiring managers understand the role requirements

            Output in JSON format:
            {format_instructions}
            """,
            input_variables=["document_content", "document_title", "analysis_date"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )

        # Prompt for Profile analysis
        self.profile_prompt = PromptTemplate(
            template="""
            You are an expert recruitment analyst and career counselor. Your task is to analyze a consultant profile and create a comprehensive report explaining their background, suggesting the best job roles, and providing career alternatives.

            Analyze the following consultant profile and provide:
            1. Summary of their background and experience
            2. Key skills (technical and soft skills)
            3. Estimated years of experience
            4. Industry focus areas
            5. Top 3-5 job roles that best match this profile
            6. Alternative job roles to consider
            7. Keywords for job search optimization
            8. Career development recommendations

            Consultant Profile:
            {document_content}

            Document Title: {document_title}
            Analysis Date: {analysis_date}

            Focus on providing actionable insights that would help:
            - The consultant understand their career options
            - Recruiters find suitable job opportunities
            - Career counselors provide guidance

            For job role suggestions, consider:
            - Skills alignment
            - Experience level match
            - Industry relevance
            - Career progression opportunities

            Output in JSON format:
            {format_instructions}
            """,
            input_variables=["document_content", "document_title", "analysis_date"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )

        self.jd_chain = self.jd_prompt | self.llm | self.parser
        self.profile_chain = self.profile_prompt | self.llm | self.parser

    def generate_document_report(self, 
                               document_content: str, 
                               document_title: str,
                               document_type: Literal["job_description", "profile"],
                               report_id: Optional[str] = None) -> Dict:
        """
        Generates a detailed report for a single document (JD or Profile).

        Args:
            document_content: The document text content
            document_title: Title or name of the document
            document_type: Type of document ("job_description" or "profile")
            report_id: Optional identifier for saving the report

        Returns:
            Dictionary containing the detailed report
        """
        if not document_content.strip():
            return {"error": "No document content provided"}

        analysis_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            if document_type == "job_description":
                result = self.jd_chain.invoke({
                    "document_content": document_content,
                    "document_title": document_title,
                    "analysis_date": analysis_date
                })
            else:  # profile
                result = self.profile_chain.invoke({
                    "document_content": document_content,
                    "document_title": document_title,
                    "analysis_date": analysis_date
                })

            report_data = (
                result.dict() if isinstance(result, DocumentReport)
                else result if isinstance(result, dict)
                else {"error": "Failed to parse report"}
            )

            # Ensure document_type is set correctly
            report_data["document_type"] = document_type
            report_data["document_title"] = document_title
            report_data["analysis_date"] = analysis_date

            if report_id:
                self.save_report(report_id, report_data)

            return report_data

        except Exception as e:
            print(f"❌ Error in ReportAgent: {e}")
            return {"error": f"Failed to generate report: {str(e)}"}

    def save_report(self, report_id: str, report_data: Dict, output_dir: str = "reports"):
        """
        Save the generated report to a JSON file.

        Args:
            report_id: The identifier for the report
            report_data: The report data to save
            output_dir: Folder to store reports
        """
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.splitext(report_id)[0]
        doc_type = report_data.get("document_type", "unknown")
        output_path = os.path.join(output_dir, f"{filename}_{doc_type}_report.json")

        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(report_data, f, indent=2)
            print(f"✅ {doc_type.title()} report saved: {output_path}")
        except Exception as e:
            print(f"❌ Failed to save {doc_type} report for {report_id}: {e}")

    def generate_jd_report(self, jd_content: str, jd_title: str, report_id: Optional[str] = None) -> Dict:
        """
        Convenience method to generate a job description report.

        Args:
            jd_content: The job description text
            jd_title: Title of the job description
            report_id: Optional identifier for saving the report

        Returns:
            Dictionary containing the JD analysis report
        """
        return self.generate_document_report(
            document_content=jd_content,
            document_title=jd_title,
            document_type="job_description",
            report_id=report_id
        )

    def generate_profile_report(self, profile_content: str, profile_title: str, report_id: Optional[str] = None) -> Dict:
        """
        Convenience method to generate a profile report.

        Args:
            profile_content: The profile text content
            profile_title: Title of the profile
            report_id: Optional identifier for saving the report

        Returns:
            Dictionary containing the profile analysis report
        """
        return self.generate_document_report(
            document_content=profile_content,
            document_title=profile_title,
            document_type="profile",
            report_id=report_id
        ) 