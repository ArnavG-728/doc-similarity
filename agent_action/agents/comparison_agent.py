# # agent_action/agents/comparison_agent.py

# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import JsonOutputParser
# from pydantic import BaseModel, Field
# from typing import List, Dict
# import os
# import json


# class ComparisonResult(BaseModel):
#     profile_name: str = Field(description="Name of the consultant profile.")
#     applicant_name: str = Field(description="Name of the applicant within the content of the profile in title case.")
#     similarity_score: float = Field(description="A similarity score between 0.0 and 1.0, where 1.0 is a perfect match.")
#     reasoning: str = Field(description="Brief explanation for the similarity score. It should be in bullet points")


# class ComparisonOutput(BaseModel):
#     comparisons: List[ComparisonResult]


# class ComparisonAgent:
#     def __init__(self, google_api_key: str):
#         self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=google_api_key)
#         self.parser = JsonOutputParser(pydantic_object=ComparisonOutput)

#         self.prompt = PromptTemplate(
#             template = """
#                 You are an expert recruitment analyst with 15+ years of experience in talent acquisition and candidate assessment. Your task is to compare a Job Description (JD) with several Consultant Profiles and assess their similarity based on skills, experience, and contextual relevance. You must be extremely strict and thorough in your analysis, focusing on core competencies and measurable qualifications.

#                 <analysis_methodology>
#                 For each consultant profile, follow this Chain of Thought approach:

#                 1. **JD Requirements Analysis**: Extract and categorize all requirements
#                 2. **Profile Capabilities Analysis**: Extract and categorize consultant capabilities  
#                 3. **Detailed Gap Analysis**: Identify matches, gaps, and bonus qualifications
#                 4. **Weighted Scoring Calculation**: Apply systematic scoring methodology
#                 5. **Final Assessment**: Provide score with comprehensive reasoning
#                 </analysis_methodology>

#                 <scoring_framework>
#                 Use this structured reasoning for each consultant:

#                 **Step 1: JD Requirements Extraction**
#                 <jd_analysis>
#                 - Core technical skills (must-have): [Extract with priority levels]
#                 - Experience requirements: [Years, domains, specific contexts]
#                 - Educational/certification requirements: [Mandatory vs preferred]
#                 - Soft skills and competencies: [Leadership, communication, problem-solving]
#                 - Industry/domain knowledge: [Specific sectors, regulations, methodologies]
#                 - Role-specific responsibilities: [Key duties and expected outcomes]
#                 </jd_analysis>

#                 **Step 2: Consultant Profile Analysis**
#                 <profile_analysis>
#                 - Technical skills demonstrated: [With specific evidence and context]
#                 - Professional experience: [Relevant years, positions, quantifiable achievements]
#                 - Educational background: [Degrees, certifications, specialized training]
#                 - Demonstrated competencies: [Leadership examples, project outcomes, impact]
#                 - Industry exposure: [Sectors worked in, depth and breadth of knowledge]
#                 - Role-relevant accomplishments: [Measurable results, successful deliveries]
#                 </profile_analysis>

#                 **Step 3: Comprehensive Gap Analysis**
#                 <gap_analysis>
#                 - Perfect matches (100%): [Requirements that exactly align with profile]
#                 - Strong matches (80-99%): [Close alignments with minor gaps or variations]
#                 - Partial matches (50-79%): [Some relevance but with significant gaps]
#                 - Missing critical requirements: [Must-have skills/experience not present]
#                 - Bonus qualifications: [Additional valuable skills beyond JD requirements]
#                 - Potential concerns: [Red flags, misalignments, or unclear areas]
#                 </gap_analysis>

#                 **Step 4: Weighted Scoring Calculation**
#                 <scoring_calculation>
#                 Apply these weights to calculate similarity score:
#                 - Core technical skills alignment: ___% × 0.35 = ___
#                 - Experience relevance and depth: ___% × 0.25 = ___
#                 - Educational/certification match: ___% × 0.15 = ___
#                 - Soft skills and competencies: ___% × 0.15 = ___
#                 - Industry knowledge relevance: ___% × 0.10 = ___
#                 - Base score total: ___
#                 - Bonus points (only if base score >0.85): +___
#                 - Final similarity score: ___
#                 </scoring_calculation>

#                 **Step 5: Comprehensive Assessment**
#                 <final_reasoning>
#                 Provide detailed explanation covering:
#                 - Key strengths that directly support the role requirements
#                 - Critical gaps that may impact job performance
#                 - Overall suitability assessment with specific evidence
#                 - Recommendation level with clear justification
#                 </final_reasoning>
#                 </scoring_framework>

#                 <strictness_criteria>
#                 Be extremely strict in your evaluation:
#                 - Require concrete evidence for all claimed skills (projects, certifications, measurable outcomes)
#                 - Years of experience must be directly relevant and show progressive growth
#                 - Industry knowledge must be demonstrable through specific examples, not just mentions
#                 - Technical skills must show practical application and depth, not superficial familiarity
#                 - Leadership and soft skills must have concrete examples with measurable impact
#                 - Reject vague, unsubstantiated, or generic claims without supporting evidence
#                 - Apply the 85% threshold rigorously before considering bonus qualifications
#                 </strictness_criteria>

#                 <scoring_guidelines>
#                 Similarity Score Criteria (0.0 - 1.0):
#                 - 0.90-1.0: Exceptional match - meets >95% of core requirements with valuable bonus skills
#                 - 0.80-0.89: Strong match - meets 85-95% of core requirements with minor gaps
#                 - 0.70-0.79: Good match - meets 70-84% of core requirements with manageable gaps
#                 - 0.60-0.69: Moderate match - meets 55-69% of requirements with notable gaps
#                 - 0.50-0.59: Weak match - meets 40-54% of requirements with significant gaps
#                 - 0.00-0.49: Poor match - meets <40% of core requirements

#                 **Bonus Qualification Rule**: Only apply bonus points (max +0.10) when base similarity score exceeds 0.85, representing additional valuable skills beyond JD requirements.
#                 </scoring_guidelines>

#                 For each consultant profile, provide a similarity score between 0.0 and 1.0 (where 1.0 is a perfect match) and comprehensive reasoning following the Chain of Thought framework above. The similarity score must be based on rigorous analysis of skills, experience, and contextual relevance between the JD and profile.

#                 Job Description:
#                 {jd_content}

#                 Consultant Profiles:
#                 {profiles_content}

#                 Output in JSON format following this structure:
#                 {format_instructions}
#                 """,
#             input_variables=["jd_content", "profiles_content"],
#             partial_variables={"format_instructions": self.parser.get_format_instructions()}
#         )

#         self.chain = self.prompt | self.llm | self.parser

#     def compare_documents(self, jd_content: str, profiles: Dict[str, str], jd_id: str = None) -> List[Dict]:
#         """
#         Compares a JD with consultant profiles and saves the report if jd_id is given.

#         Args:
#             jd_content: The job description text.
#             profiles: Dictionary of profile name to content.
#             jd_id: Optional filename or identifier for saving the report.

#         Returns:
#             List of dictionaries with comparison results.
#         """
#         if not profiles:
#             return []

#         profiles_text = ""
#         for name, content in profiles.items():
#             profiles_text += f"\n--- Consultant Profile: {name} ---\n{content}\n"

#         try:
#             result = self.chain.invoke({
#                 "jd_content": jd_content,
#                 "profiles_content": profiles_text
#             })

#             comparisons = (
#                 result.get("comparisons", []) if isinstance(result, dict)
#                 else [r.dict() for r in result.comparisons]
#                 if isinstance(result, ComparisonOutput)
#                 else []
#             )

#             if jd_id:
#                 self.save_report(jd_id, comparisons)

#             return comparisons

#         except Exception as e:
#             print(f"❌ Error in ComparisonAgent: {e}")
#             return []

#     def save_report(self, jd_id: str, comparison_results: List[Dict], output_dir: str = "reports"):
#         """
#         Save the comparison results to a JSON file, overwriting any existing report.

#         Args:
#             jd_id: The identifier (usually filename) for the JD.
#             comparison_results: The results to save.
#             output_dir: Folder to store reports.
#         """
#         os.makedirs(output_dir, exist_ok=True)
#         filename = os.path.splitext(jd_id)[0]
#         output_path = os.path.join(output_dir, f"{filename}_report.json")

#         try:
#             with open(output_path, "w", encoding="utf-8") as f:
#                 json.dump(comparison_results, f, indent=2)
#             print(f"✅ Updated report: {output_path}")
#         except Exception as e:
#             print(f"❌ Failed to save report for {jd_id}: {e}")


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
            template = """
                You are an expert recruitment analyst with 15+ years of experience in talent acquisition and candidate assessment. Your task is to compare a Job Description (JD) with several Consultant Profiles and assess their similarity based on skills, experience, and contextual relevance. You must be extremely strict and thorough in your analysis, focusing on core competencies and measurable qualifications.

                <analysis_methodology>
                For each consultant profile, follow this Chain of Thought approach:

                1. **JD Requirements Analysis**: Extract and categorize all requirements
                2. **Profile Capabilities Analysis**: Extract and categorize consultant capabilities  
                3. **Detailed Gap Analysis**: Identify matches, gaps, and bonus qualifications
                4. **Weighted Scoring Calculation**: Apply systematic scoring methodology
                5. **Final Assessment**: Provide score with comprehensive reasoning
                </analysis_methodology>

                <scoring_framework>
                Use this structured reasoning for each consultant:

                **Step 1: JD Requirements Extraction**
                <jd_analysis>
                - Core technical skills (must-have): [Extract with priority levels]
                - Experience requirements: [Years, domains, specific contexts]
                - Educational/certification requirements: [Mandatory vs preferred]
                - Soft skills and competencies: [Leadership, communication, problem-solving]
                - Industry/domain knowledge: [Specific sectors, regulations, methodologies]
                - Role-specific responsibilities: [Key duties and expected outcomes]
                </jd_analysis>

                **Step 2: Consultant Profile Analysis**
                <profile_analysis>
                - Technical skills demonstrated: [With specific evidence and context]
                - Professional experience: [Relevant years, positions, quantifiable achievements]
                - Educational background: [Degrees, certifications, specialized training]
                - Demonstrated competencies: [Leadership examples, project outcomes, impact]
                - Industry exposure: [Sectors worked in, depth and breadth of knowledge]
                - Role-relevant accomplishments: [Measurable results, successful deliveries]
                </profile_analysis>

                **Step 3: Comprehensive Gap Analysis**
                <gap_analysis>
                - Perfect matches (100%): [Requirements that exactly align with profile]
                - Strong matches (80-99%): [Close alignments with minor gaps or variations]
                - Partial matches (50-79%): [Some relevance but with significant gaps]
                - Missing critical requirements: [Must-have skills/experience not present]
                - Bonus qualifications: [Additional valuable skills beyond JD requirements]
                - Potential concerns: [Red flags, misalignments, or unclear areas]
                </gap_analysis>

                **Step 4: Weighted Scoring Calculation**
                <scoring_calculation>
                Apply these weights to calculate similarity score:
                - Core technical skills alignment: ___% × 0.35 = ___
                - Experience relevance and depth: ___% × 0.25 = ___
                - Educational/certification match: ___% × 0.15 = ___
                - Soft skills and competencies: ___% × 0.15 = ___
                - Industry knowledge relevance: ___% × 0.10 = ___
                - Base score total: ___
                - Bonus points (only if base score >0.85): +___
                - Final similarity score: ___
                </scoring_calculation>

                **Step 5: Comprehensive Assessment**
                <final_reasoning>
                Provide detailed explanation covering:
                - Key strengths that directly support the role requirements
                - Critical gaps that may impact job performance
                - Overall suitability assessment with specific evidence
                - Recommendation level with clear justification
                </final_reasoning>
                </scoring_framework>

                <strictness_criteria>
                Be extremely strict in your evaluation:
                - Require concrete evidence for all claimed skills (projects, certifications, measurable outcomes)
                - Years of experience must be directly relevant and show progressive growth
                - Industry knowledge must be demonstrable through specific examples, not just mentions
                - Technical skills must show practical application and depth, not superficial familiarity
                - Leadership and soft skills must have concrete examples with measurable impact
                - Reject vague, unsubstantiated, or generic claims without supporting evidence
                - Apply the 85% threshold rigorously before considering bonus qualifications
                </strictness_criteria>

                <scoring_guidelines>
                Similarity Score Criteria (0.0 - 1.0):
                - 0.90-1.0: Exceptional match - meets >95% of core requirements with valuable bonus skills
                - 0.80-0.89: Strong match - meets 85-95% of core requirements with minor gaps
                - 0.70-0.79: Good match - meets 70-84% of core requirements with manageable gaps
                - 0.60-0.69: Moderate match - meets 55-69% of requirements with notable gaps
                - 0.50-0.59: Weak match - meets 40-54% of requirements with significant gaps
                - 0.00-0.49: Poor match - meets <40% of core requirements

                **Bonus Qualification Rule**: Only apply bonus points (max +0.10) when base similarity score exceeds 0.85, representing additional valuable skills beyond JD requirements.
                </scoring_guidelines>

                For each consultant profile, provide a similarity score between 0.0 and 1.0 (where 1.0 is a perfect match) and comprehensive reasoning following the Chain of Thought framework above. The similarity score must be based on rigorous analysis of skills, experience, and contextual relevance between the JD and profile.

                Job Description:
                {jd_content}

                Consultant Profiles:
                {profiles_content}

                Output in JSON format following this structure:
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

            # if jd_id:
            #     self.save_report(jd_id, comparisons)

            return comparisons

        except Exception as e:
            print(f"❌ Error in ComparisonAgent: {e}")
            return []

    # def save_report(self, jd_id: str, comparison_results: List[Dict], output_dir: str = "reports"):
    #     """
    #     Save the comparison results to a JSON file, overwriting any existing report.

    #     Args:
    #         jd_id: The identifier (usually filename) for the JD.
    #         comparison_results: The results to save.
    #         output_dir: Folder to store reports.
    #     """
    #     os.makedirs(output_dir, exist_ok=True)
    #     filename = os.path.splitext(jd_id)[0]
    #     output_path = os.path.join(output_dir, f"{filename}_report.json")

    #     try:
    #         with open(output_path, "w", encoding="utf-8") as f:
    #             json.dump(comparison_results, f, indent=2)
    #         print(f"✅ Updated report: {output_path}")
    #     except Exception as e:
    #         print(f"❌ Failed to save report for {jd_id}: {e}")





