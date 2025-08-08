"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Loader2, Wand2, Send, CheckCircle2, Clock, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { runAgentWorkflow } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface UploadedFile {
  title: string;
  id: string;
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

type WorkflowStep =
  | "idle"
  | "comparing"
  | "ranking"
  | "sending-email"
  | "complete";

export default function ComparePage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [jobDescriptionFiles, setJobDescriptionFiles] = useState<
    UploadedFile[]
  >([]);
  const [profileFiles, setProfileFiles] = useState<UploadedFile[]>([]);
  const [selectedJdForComparison, setSelectedJdForComparison] =
    useState<string>("");
  const [selectedProfilesForComparison, setSelectedProfilesForComparison] =
    useState<Record<string, boolean>>({});
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(
    null
  );
  const [viewingProfile, setViewingProfile] = useState<UploadedFile | null>(
    null
  );
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("idle");
  const [stepProgress, setStepProgress] = useState(0);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // Fetch Job Descriptions
        const jdRes = await fetch("/api/upload/job-description");
        const jdsFromDB = await jdRes.json();
        const formattedJDs = jdsFromDB.map((jd: any) => ({
          name: jd.title,
          content: jd.content,
          id: jd._id, // required for sending jd_id in comparison
        }));
        setJobDescriptionFiles(formattedJDs);

        // Fetch Consultant Profiles
        const profileRes = await fetch("/api/upload/consultant-profile");
        const profilesFromDB = await profileRes.json();
        const formattedProfiles = profilesFromDB.map((p: any) => ({
          name: p.name,
          content: p.resumeText,
          id: p._id,
        }));

        setProfileFiles(formattedProfiles);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to load",
          description: "Could not fetch files from server.",
        });
      }
    };

    fetchFiles();
  }, []);

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
      case "comparing":
        return "Running Comparison";
      case "ranking":
        return "Ranking Results";
      case "sending-email":
        return "Sending Email";
      default:
        return "";
    }
  };

  const handleProfileSelectionChange = (fileName: string) => {
    setSelectedProfilesForComparison((prev) => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  const toggleSelectAllProfiles = () => {
    const allSelected = profileFiles.every(
      (profile) => selectedProfilesForComparison[profile.name]
    );
    const newSelections: Record<string, boolean> = {};
    profileFiles.forEach((profile) => {
      newSelections[profile.name] = !allSelected;
    });
    setSelectedProfilesForComparison(newSelections);
  };

  const handleCompare = async () => {
    const selectedProfileNames = Object.keys(
      selectedProfilesForComparison
    ).filter((name) => selectedProfilesForComparison[name]);
    // const selectedJd = jobDescriptionFiles.find(jd => jd.name === selectedJdForComparison);
    const selectedJd = jobDescriptionFiles.find(
      (jd) => jd.id === selectedJdForComparison
    );

    if (!selectedJd || selectedProfileNames.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Selections",
        description:
          "Please select a Job Description and at least one Profile.",
      });
      return;
    }

    if (!user?.email || !user.id) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "Please log in to receive email notifications.",
      });
      return;
    }

    setMatchResults(null);
    setGeneratedEmail(null);
    setCurrentStep("comparing");
    setStepProgress(0);
    setIsComparing(true);

    try {
      const profilesToCompare = profileFiles.filter((p) =>
        selectedProfileNames.includes(p.name)
      );
      const profilesContent: Record<string, string> = {};
      profilesToCompare.forEach((profile) => {
        profilesContent[profile.name] = profile.content;
      });

      if (Object.keys(profilesContent).length === 0) {
        throw new Error("No profiles selected for comparison.");
      }

      console.log("Selected Profile Names:", selectedProfileNames);
      console.log("Profiles To Compare:", profilesToCompare);
      console.log("Profiles Content:", profilesContent);

      const response = await runAgentWorkflow({
        jd_id: selectedJd.id,
        jd_filename: selectedJd.name,
        jd_content: selectedJd.content,
        profiles_content: profilesContent,
        ar_email: user.email,
        recruiter_email: "",
        user_id: user.id,
      });

      setCurrentStep("ranking");
      setStepProgress(33);
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (response?.status === "success" && response?.top_3_matches?.length) {
        const matches: MatchResult[] = response.top_3_matches.map(
          (item: any) => ({
            profileName: item.profile_name,
            applicantName: item.applicant_name,
            matchScore: Math.round(item.similarity_score * 100),
            justification: item.reasoning,
          })
        );

        setMatchResults(matches);
        setCurrentStep("sending-email");
        setStepProgress(66);
        await new Promise((resolve) => setTimeout(resolve, 300));

        setGeneratedEmail({
          emailSubject: `Top Consultant Matches for ${selectedJd.name}`,
          emailBody: `
          <h3>Top ${matches.length} Consultant Matches</h3>
          <p>Here are the top matches for <strong>${
            selectedJd.name
          }</strong>:</p>
          <ul>
            ${matches
              .map(
                (match, idx) =>
                  `<li><strong>${idx + 1}. ${match.profileName}</strong> (${
                    match.applicantName
                  }) - ${match.matchScore}% Match</li>`
              )
              .join("")}
          </ul>
          <p><em>Email notifications have been sent to ${user.email}.</em></p>
        `,
        });

        setStepProgress(100);
        setCurrentStep("complete");
        toast({
          title: "Workflow Complete",
          description: `Found ${matches.length} matches.`,
        });

        setIsNotifyDialogOpen(true);
      } else {
        throw new Error(response?.message || "No matches returned");
      }
    } catch (err) {
      setCurrentStep("idle");
      setStepProgress(0);
      toast({
        variant: "destructive",
        title: "Workflow Failed",
        description:
          err instanceof Error ? err.message : "Unexpected error occurred.",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const selectedProfilesCount = Object.values(
    selectedProfilesForComparison
  ).filter(Boolean).length;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex flex-col gap-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Run Comparison</CardTitle>
            <CardDescription>
              Select a Job Description and Profiles to compare.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Job Description</Label>
                <Select
                  value={selectedJdForComparison}
                  onValueChange={setSelectedJdForComparison}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a JD..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobDescriptionFiles.map((jd, index) => (
                      // <SelectItem key={`${jd.name}-${index}`} value={jd.name}>{jd.name}</SelectItem>
                      <SelectItem key={`${jd.id}-${index}`} value={jd.id}>
                        {jd.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label>Consultant Profiles</Label>
                  {profileFiles.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAllProfiles}
                    >
                      {profileFiles.every(
                        (profile) => selectedProfilesForComparison[profile.name]
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  )}
                </div>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {profileFiles.length > 0 ? (
                    profileFiles.map((profile, index) => (
                      <div
                        key={`${profile.name}-${index}`}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={profile.name}
                          checked={
                            !!selectedProfilesForComparison[profile.name]
                          }
                          onCheckedChange={() =>
                            handleProfileSelectionChange(profile.name)
                          }
                        />
                        <Label
                          htmlFor={profile.name}
                          className="cursor-pointer"
                        >
                          {profile.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Upload profiles to see them here.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleCompare}
              disabled={
                isComparing ||
                !selectedJdForComparison ||
                selectedProfilesCount === 0
              }
              className="w-full"
            >
              {isComparing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Running...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2" /> Run Workflow
                </>
              )}
            </Button>

            {currentStep !== "idle" && (
              <div className="space-y-4">
                <Progress
                  value={stepProgress}
                  className="w-full h-3 transition-all duration-500 ease-in-out"
                />
                <div className="grid grid-cols-3 gap-4">
                  {["comparing", "ranking", "sending-email"].map((step) => (
                    <div key={step} className="flex items-center space-x-2">
                      {getStepIcon(step as WorkflowStep)}
                      <span className="text-sm font-medium capitalize">
                        {step.replace("-", " ")}
                      </span>
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
              <CardDescription>
                Top 3 profiles ranked by match score.
              </CardDescription>
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
                            setViewingProfile(
                              profileFiles.find(
                                (p) => p.name === res.profileName
                              ) || null
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold">Justification:</p>
                    <p className="text-sm text-muted-foreground">
                      {res.justification}
                    </p>
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
                <DialogDescription>
                  Email has been sent to relevant parties.
                </DialogDescription>
              </DialogHeader>
              <div
                className="prose prose-sm dark:prose-invert border p-4 rounded-md"
                dangerouslySetInnerHTML={{ __html: generatedEmail.emailBody }}
              />
            </DialogContent>
          )}
        </Dialog>

        <Dialog
          open={!!viewingProfile}
          onOpenChange={() => setViewingProfile(null)}
        >
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
