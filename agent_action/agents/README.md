# Agent System Documentation

This directory contains the AI agents that power the document similarity and recruitment analysis system.

## Agents Overview

### 1. ComparisonAgent (`comparison_agent.py`)
**Purpose**: Compares job descriptions with consultant profiles to assess similarity.

**Key Features**:
- Uses Google Gemini 2.0 Flash model for analysis
- Generates similarity scores (0.0-1.0) for each profile
- Provides detailed reasoning for each comparison
- Saves comparison results to JSON files

**Input**: Job description content + consultant profiles
**Output**: List of comparison results with scores and reasoning

### 2. RankingAgent (`ranking_agent.py`)
**Purpose**: Ranks consultant profiles based on similarity scores.

**Key Features**:
- Sorts profiles by similarity score in descending order
- Provides ranked list for decision making
- Simple but effective ranking algorithm

**Input**: Comparison results from ComparisonAgent
**Output**: Ranked list of profiles

### 3. CommunicationAgent (`communication_agent.py`)
**Purpose**: Handles email notifications and communication.

**Key Features**:
- Generates email content for different scenarios
- Sends notifications to AR Requestors and Recruiters
- Handles both match-found and no-match scenarios
- Uses configured email settings

**Input**: Ranked profiles + job information
**Output**: Email notifications sent

### 4. ReportAgent (`report_agent.py`) - UPDATED
**Purpose**: Generates detailed analysis reports for individual documents (JDs and profiles).

**Key Features**:
- **JD Analysis**: Explains what the job role is, what it requires, and provides detailed insights
- **Profile Analysis**: Analyzes consultant profiles and suggests best job roles and alternatives
- **Role Suggestions**: Provides job role recommendations with match percentages and reasoning
- **Career Guidance**: Offers career development recommendations and keywords for job search
- **Comprehensive Insights**: Includes skills analysis, experience assessment, and industry focus
- **Saves reports in JSON format** for easy access and integration

**Input**: Individual document content (JD or Profile)
**Output**: Detailed document-specific analysis report

## Tech Stack

All agents use the following technologies:
- **LangChain**: Framework for LLM interactions
- **Google Gemini 2.0 Flash**: Primary LLM for analysis
- **Pydantic**: Data validation and serialization
- **FastAPI**: Backend API framework
- **JSON**: Data storage and exchange format

## API Endpoints

### `/run-agent` (POST)
Runs the complete workflow:
1. ComparisonAgent → Compare JD with profiles
2. RankingAgent → Rank results
3. CommunicationAgent → Send emails (optional)
4. ReportAgent → Generate detailed report

### `/generate-jd-report` (POST)
Generates detailed reports for Job Descriptions:
- Requires: JD content
- Returns: Comprehensive JD analysis report

### `/generate-profile-report` (POST)
Generates detailed reports for consultant profiles:
- Requires: Profile content
- Returns: Comprehensive profile analysis report

### `/generate-report` (POST) - Legacy
Legacy endpoint for comparison-based reports:
- Requires: JD content + comparison results
- Returns: Comprehensive analysis report

## Report Structure

The ReportAgent generates different report structures based on document type:

### JD Report Structure
```json
{
  "document_type": "job_description",
  "document_title": "Senior Developer Position",
  "analysis_date": "2024-01-01 12:00:00",
  "jd_analysis": {
    "role_overview": "Clear explanation of the job role",
    "key_responsibilities": ["Responsibility 1", "Responsibility 2"],
    "required_skills": ["Skill 1", "Skill 2"],
    "preferred_qualifications": ["Qualification 1"],
    "experience_level": "Senior",
    "industry_context": "Technology",
    "team_structure": "Small team",
    "growth_opportunities": ["Opportunity 1"],
    "compensation_indicators": ["Competitive salary"],
    "company_culture_hints": ["Collaborative environment"]
  },
  "executive_summary": "Executive summary of the JD analysis",
  "key_insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
```

### Profile Report Structure
```json
{
  "document_type": "profile",
  "document_title": "John Doe Profile",
  "analysis_date": "2024-01-01 12:00:00",
  "profile_analysis": {
    "profile_summary": "Summary of consultant's background",
    "key_skills": ["Skill 1", "Skill 2"],
    "years_experience": "5-7 years",
    "industry_focus": ["Technology", "Finance"],
    "best_job_roles": [
      {
        "role_title": "Senior Developer",
        "match_percentage": 85.0,
        "reasoning": "Strong technical skills match",
        "required_skills": ["JavaScript", "React"],
        "profile_skills": ["JavaScript", "React", "Node.js"]
      }
    ],
    "alternative_roles": [
      {
        "role_title": "Tech Lead",
        "match_percentage": 75.0,
        "reasoning": "Good leadership potential",
        "required_skills": ["Leadership", "Architecture"],
        "profile_skills": ["Team Management", "System Design"]
      }
    ],
    "keywords_for_search": ["JavaScript", "React", "Node.js"],
    "career_recommendations": ["Recommendation 1", "Recommendation 2"]
  },
  "executive_summary": "Executive summary of the profile analysis",
  "key_insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
```

## Usage Examples

### Running Complete Workflow
```python
# Via API endpoint
POST /run-agent
{
  "jd_filename": "senior_developer.txt",
  "jd_content": "Job description content...",
  "profiles_content": {"profile1": "content1", "profile2": "content2"},
  "ar_email": "ar@example.com",
  "recruiter_email": "recruiter@example.com"
}
```

### Generating JD Report
```python
# Via API endpoint
POST /generate-jd-report
{
  "jd_content": "Job description content...",
  "jd_title": "Senior Developer Position",
  "report_id": "senior_dev_report"
}
```

### Generating Profile Report
```python
# Via API endpoint
POST /generate-profile-report
{
  "profile_content": "Profile content...",
  "profile_title": "John Doe Profile",
  "report_id": "john_doe_report"
}
```

## File Structure

```
agents/
├── comparison_agent.py    # Compares JD with profiles
├── ranking_agent.py       # Ranks results by score
├── communication_agent.py # Handles email notifications
├── report_agent.py        # Generates detailed reports
└── README.md             # This documentation
```

## Configuration

All agents require:
- `GOOGLE_API_KEY`: For Gemini model access
- Email configuration (for CommunicationAgent)
- Proper file permissions for report saving

## Error Handling

All agents include comprehensive error handling:
- API key validation
- Input validation
- Graceful fallbacks for missing data
- Detailed error logging

## Future Enhancements

Potential improvements for the ReportAgent:
- PDF report generation with professional formatting
- Custom report templates for different industries
- Historical trend analysis across multiple reports
- Integration with external job market data sources
- Real-time report updates and notifications
- Multi-language support for international profiles
- Advanced skill mapping and career path suggestions 