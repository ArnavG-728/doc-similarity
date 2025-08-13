

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
                Apply these weights to calculate similarity score (to 3 decimal places):
                - Core technical skills alignment: ___% × 0.350 = ___
                - Experience relevance and depth: ___% × 0.250 = ___
                - Educational/certification match: ___% × 0.150 = ___
                - Soft skills and competencies: ___% × 0.150 = ___
                - Industry knowledge relevance: ___% × 0.100 = ___
                - Base score total: ___.___
                - Bonus points (only if base score >0.850): +___.___
                - Final similarity score: ___.___
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
                - Apply the 0.850 threshold rigorously before considering bonus qualifications
                </strictness_criteria>

                <enhanced_scoring_guidelines>
                Similarity Score Criteria (0.000 - 1.000):
                
                **Exceptional Tier (0.900-1.000):**
                - 0.950-1.000: Perfect/Near-perfect match - exceeds 98% of core requirements with exceptional bonus skills
                - 0.925-0.949: Outstanding match - meets 96-98% of core requirements with strong bonus qualifications
                - 0.900-0.924: Excellent match - meets 94-96% of core requirements with valuable additional skills
                
                **Strong Tier (0.800-0.899):**
                - 0.875-0.899: Very strong match - meets 92-94% of core requirements with minor gaps
                - 0.850-0.874: Strong match - meets 88-92% of core requirements with manageable gaps
                - 0.825-0.849: Good strong match - meets 84-88% of core requirements with some notable gaps
                - 0.800-0.824: Solid match - meets 80-84% of core requirements with moderate gaps
                
                **Moderate Tier (0.600-0.799):**
                - 0.775-0.799: Upper moderate match - meets 76-80% of requirements with manageable training gaps
                - 0.750-0.774: Good moderate match - meets 72-76% of requirements with notable skill gaps
                - 0.725-0.749: Mid-moderate match - meets 68-72% of requirements with significant gaps
                - 0.700-0.724: Lower moderate match - meets 64-68% of requirements with major gaps
                - 0.675-0.699: Weak moderate match - meets 60-64% of requirements with extensive gaps
                - 0.650-0.674: Poor moderate match - meets 56-60% of requirements with critical gaps
                - 0.625-0.649: Very weak match - meets 52-56% of requirements with severe limitations
                - 0.600-0.624: Minimal match - meets 48-52% of requirements with fundamental gaps
                
                **Weak Tier (0.400-0.599):**
                - 0.575-0.599: Upper weak match - meets 44-48% of requirements with major deficiencies
                - 0.550-0.574: Mid-weak match - meets 40-44% of requirements with critical deficiencies
                - 0.525-0.549: Lower weak match - meets 36-40% of requirements with severe deficiencies
                - 0.500-0.524: Very weak match - meets 32-36% of requirements with extensive deficiencies
                - 0.475-0.499: Extremely weak match - meets 28-32% of requirements with fundamental misalignment
                - 0.450-0.474: Poor weak match - meets 24-28% of requirements with major misalignment
                - 0.425-0.449: Very poor match - meets 20-24% of requirements with severe misalignment
                - 0.400-0.424: Minimal weak match - meets 16-20% of requirements with critical misalignment
                
                **Poor Tier (0.000-0.399):**
                - 0.375-0.399: Upper poor match - meets 12-16% of requirements with fundamental incompatibility
                - 0.350-0.374: Mid-poor match - meets 8-12% of requirements with severe incompatibility
                - 0.325-0.349: Lower poor match - meets 4-8% of requirements with critical incompatibility
                - 0.300-0.324: Very poor match - meets 0-4% of requirements with complete misalignment
                - 0.200-0.299: Extremely poor match - minimal to no relevant qualifications
                - 0.100-0.199: Critically poor match - fundamentally incompatible profile
                - 0.000-0.099: No match - completely irrelevant or insufficient profile information

                **Precision Scoring Instructions:**
                - Calculate each component score to 3 decimal places (e.g., 0.847, 0.923)
                - Round final scores to nearest 0.001 (three decimal places)
                - Justify score precision with specific evidence and detailed reasoning
                - For scores within 0.005 of tier boundaries, provide additional justification
                
                **Bonus Qualification Rule**: Only apply bonus points (max +0.100) when base similarity score exceeds 0.850, representing additional valuable skills beyond JD requirements. Bonus points should be calculated to 3 decimal places (e.g., +0.025, +0.067).
                </enhanced_scoring_guidelines>

                For each consultant profile, provide a similarity score between 0.000 and 1.000 (where 1.000 is a perfect match) and comprehensive reasoning following the Chain of Thought framework above. The similarity score must be based on rigorous analysis of skills, experience, and contextual relevance between the JD and profile, calculated to three decimal places for maximum precision.

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





