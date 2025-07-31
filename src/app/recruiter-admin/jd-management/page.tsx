
"use client";

import { useState, useMemo, useEffect } from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
    name: string;
    content: string;
}

export default function JdManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jds, setJds] = useState<UploadedFile[]>([]);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedJds = localStorage.getItem("jds");
        if (storedJds) {
            setJds(JSON.parse(storedJds));
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Could not load JDs",
            description: "There was an error reading JDs from local storage."
        });
    }
  }, [toast]);


  const filteredJds = useMemo(() => {
    return jds.filter(jd => {
      const matchesSearch = jd.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, jds]);

  const handleGenerateReport = async (jd: UploadedFile) => {
    setGeneratingReports(prev => new Set(prev).add(jd.name));
    
    try {
      // Mock comparison results for demonstration
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
        },
        {
          profile_name: "Junior Developer Profile",
          applicant_name: "Alex Johnson", 
          similarity_score: 0.65,
          reasoning: "Basic skills present but needs more experience"
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
          title: "Report Generated Successfully",
          description: `Detailed report created for ${jd.name}`,
        });
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
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(jd.name);
        return newSet;
      });
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
            <CardHeader>
                <CardTitle>Job Descriptions</CardTitle>
                <CardDescription>Search and manage all uploaded job descriptions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                    />
                </div>
                </div>
                <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Filename</TableHead>
                        <TableHead>Content Snippet</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                                         {filteredJds.length > 0 ? filteredJds.map((jd, index) => (
                         <TableRow key={`${jd.name}-${index}`}>
                        <TableCell className="font-medium">{jd.name}</TableCell>
                        <TableCell>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                {jd.content}
                            </p>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateReport(jd)}
                                disabled={generatingReports.has(jd.name)}
                            >
                                {generatingReports.has(jd.name) ? (
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
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No job descriptions uploaded.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
            </Card>
        </main>
    </div>
  );
}
