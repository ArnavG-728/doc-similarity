
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
    name: string;
    content: string;
}

export default function ReportGenerator() {
  const [reportType, setReportType] = useState<'jds' | 'profiles'>('jds');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jds, setJds] = useState<UploadedFile[]>([]);
  const [profiles, setProfiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedJds = localStorage.getItem("jds");
        if (storedJds) setJds(JSON.parse(storedJds));

        const storedProfiles = localStorage.getItem("profiles");
        if (storedProfiles) setProfiles(JSON.parse(storedProfiles));
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Could not load files",
            description: "There was an error reading files from local storage."
        });
    }
  }, [toast]);

  const handleGenerateReport = async () => {
    if (!selectedItem) return;
    setIsLoading(true);
    setGeneratedReport(null);

    try {
      const options = reportType === 'jds' ? jds : profiles;
      const selectedFile = options.find(item => item.name === selectedItem);
      
      if (!selectedFile) {
        throw new Error('Selected file not found');
      }

      // Use the appropriate endpoint based on report type
      const endpoint = reportType === 'jds' ? '/generate-jd-report' : '/generate-profile-report';
      const requestBody = reportType === 'jds' ? {
        jd_content: selectedFile.content,
        jd_title: selectedFile.name,
        report_id: selectedFile.name
      } : {
        profile_content: selectedFile.content,
        profile_title: selectedFile.name,
        report_id: selectedFile.name
      };

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        const report = data.report;
        let reportText = '';

        if (reportType === 'jds' && report.jd_analysis) {
          // Format JD report
          reportText = `
Job Description Analysis Report
==============================

Document: ${report.document_title}
Analysis Date: ${report.analysis_date}

Executive Summary:
${report.executive_summary || 'No summary available'}

Role Overview:
${report.jd_analysis.role_overview || 'No role overview available'}

Key Responsibilities:
${report.jd_analysis.key_responsibilities?.map((resp: string) => `• ${resp}`).join('\n') || 'No responsibilities listed'}

Required Skills:
${report.jd_analysis.required_skills?.map((skill: string) => `• ${skill}`).join('\n') || 'No skills listed'}

Preferred Qualifications:
${report.jd_analysis.preferred_qualifications?.map((qual: string) => `• ${qual}`).join('\n') || 'No qualifications listed'}

Experience Level: ${report.jd_analysis.experience_level || 'Not specified'}
Industry Context: ${report.jd_analysis.industry_context || 'Not specified'}
Team Structure: ${report.jd_analysis.team_structure || 'Not specified'}

Growth Opportunities:
${report.jd_analysis.growth_opportunities?.map((opp: string) => `• ${opp}`).join('\n') || 'No opportunities listed'}

Compensation Indicators:
${report.jd_analysis.compensation_indicators?.map((comp: string) => `• ${comp}`).join('\n') || 'No compensation info'}

Company Culture Hints:
${report.jd_analysis.company_culture_hints?.map((culture: string) => `• ${culture}`).join('\n') || 'No culture info'}

Key Insights:
${report.key_insights?.map((insight: string) => `• ${insight}`).join('\n') || 'No insights available'}

Recommendations:
${report.recommendations?.map((rec: string) => `• ${rec}`).join('\n') || 'No recommendations available'}
          `;
        } else if (reportType === 'profiles' && report.profile_analysis) {
          // Format Profile report
          reportText = `
Consultant Profile Analysis Report
=================================

Document: ${report.document_title}
Analysis Date: ${report.analysis_date}

Executive Summary:
${report.executive_summary || 'No summary available'}

Profile Summary:
${report.profile_analysis.profile_summary || 'No profile summary available'}

Key Skills:
${report.profile_analysis.key_skills?.map((skill: string) => `• ${skill}`).join('\n') || 'No skills listed'}

Years of Experience: ${report.profile_analysis.years_experience || 'Not specified'}

Industry Focus:
${report.profile_analysis.industry_focus?.map((industry: string) => `• ${industry}`).join('\n') || 'No industries listed'}

Best Job Roles:
${report.profile_analysis.best_job_roles?.map((role: any) => `
• ${role.role_title} (${role.match_percentage}% match)
  Reasoning: ${role.reasoning}
  Required Skills: ${role.required_skills?.join(', ') || 'Not specified'}
  Profile Skills: ${role.profile_skills?.join(', ') || 'Not specified'}
`).join('\n') || 'No job roles suggested'}

Alternative Roles:
${report.profile_analysis.alternative_roles?.map((role: any) => `
• ${role.role_title} (${role.match_percentage}% match)
  Reasoning: ${role.reasoning}
  Required Skills: ${role.required_skills?.join(', ') || 'Not specified'}
  Profile Skills: ${role.profile_skills?.join(', ') || 'Not specified'}
`).join('\n') || 'No alternative roles suggested'}

Keywords for Job Search:
${report.profile_analysis.keywords_for_search?.map((keyword: string) => `• ${keyword}`).join('\n') || 'No keywords suggested'}

Career Recommendations:
${report.profile_analysis.career_recommendations?.map((rec: string) => `• ${rec}`).join('\n') || 'No recommendations available'}

Key Insights:
${report.key_insights?.map((insight: string) => `• ${insight}`).join('\n') || 'No insights available'}

Recommendations:
${report.recommendations?.map((rec: string) => `• ${rec}`).join('\n') || 'No recommendations available'}
          `;
        } else {
          reportText = 'Report format not recognized';
        }

        setGeneratedReport(reportText);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred while generating the report."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const options = reportType === 'jds' ? jds : profiles;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Generation</CardTitle>
        <CardDescription>Generate reports about matching results by Job Description or consultant profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <RadioGroup defaultValue="jds" onValueChange={(value: 'jds' | 'profiles') => {
              setReportType(value);
              setSelectedItem('');
              setGeneratedReport(null);
            }}
            value={reportType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jds" id="r1" />
                <Label htmlFor="r1">By Job Description</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="profiles" id="r2" />
                <Label htmlFor="r2">By Consultant Profile</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="select-item">Select {reportType === 'jds' ? 'Job Description' : 'Consultant'}</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem} disabled={options.length === 0}>
              <SelectTrigger id="select-item">
                <SelectValue placeholder={`Select a ${reportType === 'jds' ? 'JD' : 'consultant'}...`} />
              </SelectTrigger>
              <SelectContent>
                                 {options.length > 0 ? options.map((option, index) => (
                   <SelectItem key={`${option.name}-${index}`} value={option.name}>
                     {option.name}
                   </SelectItem>
                 )) : (
                  <SelectItem value="no-files" disabled>No files uploaded yet.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={handleGenerateReport} disabled={!selectedItem || isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {(isLoading || generatedReport) && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Generated Report</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <pre className="font-code text-sm whitespace-pre-wrap p-4 bg-background rounded-md overflow-x-auto">
                  {generatedReport}
                </pre>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
