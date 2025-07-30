"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Loader2, Wand2, Send, CheckCircle2, Clock, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { runAgentWorkflow } from "@/lib/api";

interface UploadedFile {
  name: string;
  content: string;
}

interface MatchResult {
  profileName: string;
  applicantName: string;
  matchScore: number;
  justification: string;
}

interface GeneratedEmail {
  emailSubject: string;
  emailBody: string;
}

type WorkflowStep = "idle" | "comparing" | "ranking" | "sending-email" | "complete";

export default function ComparePage() {
  const { toast } = useToast();

  const [jobDescriptionFiles, setJobDescriptionFiles] = useState<UploadedFile[]>([]);
  const [profileFiles, setProfileFiles] = useState<UploadedFile[]>([]);

  const [selectedJdForComparison, setSelectedJdForComparison] = useState<string>("");
  const [selectedProfilesForComparison, setSelectedProfilesForComparison] = useState<Record<string, boolean>>({});

  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UploadedFile | null>(null);

  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("idle");
  const [stepProgress, setStepProgress] = useState(0);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    try {
      const storedJds = localStorage.getItem("jds");
      if (storedJds) setJobDescriptionFiles(JSON.parse(storedJds));

      const storedProfiles = localStorage.getItem("profiles");
      if (storedProfiles) setProfileFiles(JSON.parse(storedProfiles));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to load",
        description: "Could not retrieve files from local storage.",
      });
    }
  }, [toast]);

  const getStepIcon = (step: WorkflowStep) => {
    const order = ["comparing", "ranking", "sending-email"];
    const currentIndex = order.indexOf(currentStep);
    const stepIndex = order.indexOf(step);

    if (currentStep === "complete" || currentIndex > stepIndex) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (currentIndex === stepIndex) {
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
    return <Clock className="h-5 w-5 text-muted-foreground" />;
  };

  const getStepText = (step: WorkflowStep) => {
    switch (step) {
      case "comparing": return "Running Comparison";
      case "ranking": return "Ranking Results";
      case "sending-email": return "Sending Email";
      default: return "";
    }
  };

  const handleProfileSelectionChange = (fileName: string) => {
    setSelectedProfilesForComparison(prev => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  const handleCompare = async () => {
    const selectedProfileNames = Object.keys(selectedProfilesForComparison).filter(name => selectedProfilesForComparison[name]);
    const selectedJd = jobDescriptionFiles.find(jd => jd.name === selectedJdForComparison);

    if (!selectedJd || selectedProfileNames.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Selections",
        description: "Please select a Job Description and at least one Profile.",
      });
      return;
    }

    setMatchResults(null);
    setGeneratedEmail(null);
    setCurrentStep("comparing");
    setStepProgress(0);
    setIsComparing(true);

    try {
      const profilesToCompare = profileFiles.filter(p => selectedProfileNames.includes(p.name));
      const profilesContent: Record<string, string> = {};
      profilesToCompare.forEach(profile => {
        profilesContent[profile.name] = profile.content;
      });
      const response = await runAgentWorkflow({
        jd_filename: selectedJd.name,
        jd_content: selectedJd.content,
        profiles_content: profilesContent,
      });

      // ✅ COMPARISON COMPLETE
      setCurrentStep("ranking");
      setStepProgress(33);

      await new Promise(resolve => setTimeout(resolve, 300)); // brief pause

      if (response.status === "success" && response.top_3_matches) {
        const matches: MatchResult[] = response.top_3_matches.map((item: any) => ({
          profileName: item.profile_name,
          applicantName: item.applicant_name,
          matchScore: Math.round(item.similarity_score * 100),
          justification: item.reasoning,
        }));

        setMatchResults(matches);

        // ✅ RANKING COMPLETE
        setCurrentStep("sending-email");
        setStepProgress(66);

        await new Promise(resolve => setTimeout(resolve, 300)); // brief pause

        setGeneratedEmail({
          emailSubject: `Top Consultant Matches for ${selectedJd.name}`,
          emailBody: `
            <h3>Top ${matches.length} Consultant Matches</h3>
            <p>Here are the top matches for <strong>${selectedJd.name}</strong>:</p>
            <ul>
              ${matches.map((match, idx) =>
                `<li><strong>${idx + 1}. ${match.profileName}</strong> (${match.applicantName}) - ${match.matchScore}% Match</li>`).join("")
              }
            </ul>
            <p><em>Email notifications have been sent.</em></p>
          `
        });

        // ✅ COMMUNICATION COMPLETE
        setStepProgress(100);
        setCurrentStep("complete");

        toast({
          title: "Workflow Complete",
          description: `Found ${matches.length} matches.`,
        });

        setIsNotifyDialogOpen(true);
      } else {
        throw new Error(response.message || "No matches returned");
      }
    } catch (err) {
      setCurrentStep("idle");
      setStepProgress(0);
      toast({
        variant: "destructive",
        title: "Workflow Failed",
        description: err instanceof Error ? err.message : "Unexpected error occurred.",
      });
    } finally {
      setIsComparing(false);
    }

  };

  const selectedProfilesCount = Object.values(selectedProfilesForComparison).filter(Boolean).length;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex flex-col gap-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Run Comparison</CardTitle>
            <CardDescription>Select a Job Description and Profiles to compare.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Job Description</Label>
                <Select value={selectedJdForComparison} onValueChange={setSelectedJdForComparison}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a JD..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobDescriptionFiles.map(jd => (
                      <SelectItem key={jd.name} value={jd.name}>{jd.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Consultant Profiles</Label>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {profileFiles.length > 0 ? profileFiles.map(profile => (
                    <div key={profile.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={profile.name}
                        checked={!!selectedProfilesForComparison[profile.name]}
                        onCheckedChange={() => handleProfileSelectionChange(profile.name)}
                      />
                      <Label htmlFor={profile.name} className="cursor-pointer">{profile.name}</Label>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">Upload profiles to see them here.</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleCompare}
              disabled={isComparing || !selectedJdForComparison || selectedProfilesCount === 0}
              className="w-full"
            >
              {isComparing ? <><Loader2 className="mr-2 animate-spin" /> Running...</> : <><Wand2 className="mr-2" /> Run Workflow</>}
            </Button>

            {currentStep !== "idle" && (
              <div className="space-y-4">
                <Progress
                  value={stepProgress}
                  className="w-full h-3 transition-all duration-500 ease-in-out"
                />
                <div className="grid grid-cols-3 gap-4">
                  {["comparing", "ranking", "sending-email"].map(step => (
                    <div key={step} className="flex items-center space-x-2">
                      {getStepIcon(step as WorkflowStep)}
                      <span className="text-sm font-medium capitalize">{step.replace("-", " ")}</span>
                    </div>
                  ))}
                </div>
                {currentStep !== "complete" && (
                  <p className="text-sm text-muted-foreground text-center">
                    {getStepText(currentStep)}...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {matchResults && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison Results</CardTitle>
              <CardDescription>Top 3 profiles ranked by match score.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matchResults.map((res, i) => (
                <Card key={i} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{res.profileName}</span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-semibold ${
                            res.matchScore > 80
                              ? "text-green-500"
                              : res.matchScore < 50
                              ? "text-red-500"
                              : "text-foreground"
                          }`}
                        >
                          {res.matchScore}% Match
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            setViewingProfile(profileFiles.find(p => p.name === res.profileName) || null)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold">Justification:</p>
                    <p className="text-sm text-muted-foreground">{res.justification}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
          {generatedEmail && (
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{generatedEmail.emailSubject}</DialogTitle>
                <DialogDescription>Email has been sent to relevant parties.</DialogDescription>
              </DialogHeader>
              <div
                className="prose prose-sm dark:prose-invert border p-4 rounded-md"
                dangerouslySetInnerHTML={{ __html: generatedEmail.emailBody }}
              />
            </DialogContent>
          )}
        </Dialog>

        <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
          {viewingProfile && (
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{viewingProfile.name}</DialogTitle>
                <DialogDescription>Consultant Profile</DialogDescription>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap border p-4 rounded-md bg-muted/20 text-sm">
                {viewingProfile.content}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </main>
    </div>
  );
}
