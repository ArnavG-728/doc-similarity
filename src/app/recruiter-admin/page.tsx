"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowRight, Search, BarChart, FileText, Loader2, Upload, Wand2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

export default function RecruiterAdminPage() {
  const [recentJds, setRecentJds] = useState<Array<{name: string, content: string}>>([]);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    // Fetch most recent JDs from API instead of relying on localStorage
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/upload/job-description');
        if (!res.ok) throw new Error('Failed to fetch job descriptions');
        const data = await res.json();
        // API already sorted by createdAt desc; take top 3 and map to name/content
        const mapped = (Array.isArray(data) ? data : []).slice(0, 3).map((d: any) => ({
          name: d.title ?? d.name ?? 'Untitled JD',
          content: d.content ?? ''
        }));
        setRecentJds(mapped);
      } catch (error) {
        console.error('Error loading recent JDs:', error);
      }
    };
    fetchRecent();
  }, []);

  const handleQuickReport = async (jd: {name: string, content: string}) => {
    setGeneratingReports(prev => new Set(prev).add(jd.name));
    
    try {
      const mockComparisonResults = [
        {
          profile_name: "Senior Developer Profile",
          applicant_name: "John Doe",
          similarity_score: 0.85,
          reasoning: "Strong technical skills match with required technologies"
        },
        {
          profile_name: "Mid-level Developer Profile", 
          applicant_name: "Jane Smith",
          similarity_score: 0.72,
          reasoning: "Good experience but missing some advanced skills"
        }
      ];

      const response = await fetch('http://localhost:8000/generate-jd-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jd_content: jd.content,
          jd_title: jd.name,
          report_id: jd.name
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: "Quick Report Generated",
          description: `Report created for ${jd.name}`,
        });
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating quick report:', error);
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred while generating the report."
      });
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(jd.name);
        return newSet;
      });
    }
  };

  const features = [
    {
      href: "/recruiter-admin/upload",
      icon: <Upload className="h-6 w-6 text-primary" />,
      title: "Upload Resumes",
      description: "Upload Job Descriptions and Consultant Profiles to prepare them for comparison.",
      cta: "Go to Upload",
    },
    {
      href: "/recruiter-admin/compare",
      icon: <Wand2 className="h-6 w-6 text-primary" />,
      title: "Compare Profiles",
      description: "Choose uploaded documents and run the AI-powered comparison workflow.",
      cta: "Go to Compare",
    },
    {
      href: "/recruiter-admin/jd-management",
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "JD Management",
      description: "Search, filter, and manage all uploaded Job Descriptions.",
      cta: "Go to JD Management",
    },
    {
      href: "/recruiter-admin/agentic-metrics",
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Agentic Metrics",
      description: "Analyze framework performance with AI-powered insights.",
      cta: "Go to Metrics Tool",
    },
    {
      href: "/recruiter-admin/reporting",
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "AI Report Generation",
      description: "Generate comprehensive analysis reports using the ReportAgent for detailed insights.",
      cta: "Generate Reports",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl font-headline">Recruiter Admin</h1>
        </div>
        <p className="text-muted-foreground">
          Select a tool below to get started.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="flex">
              <Card className="w-full hover:bg-card/80 transition-colors flex flex-col">
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="pt-2 text-left">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold text-primary flex items-center">
                    {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Report Generation Section */}
        {recentJds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Report Generation</CardTitle>
              <CardDescription>
                Generate AI-powered reports for your recent job descriptions using the ReportAgent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentJds.map((jd, index) => (
                  <div key={`${jd.name}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{jd.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {jd.content.substring(0, 50)}...
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickReport(jd)}
                      disabled={generatingReports.has(jd.name)}
                      className="ml-2"
                    >
                      {generatingReports.has(jd.name) ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-3 w-3" />
                          Quick Report
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}