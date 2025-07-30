"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import Header from "@/components/Header";
import { FileText, Users, CheckCircle, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  name: string;
  content: string;
}

export default function UploadPage() {
  const [jobDescriptionFiles, setJobDescriptionFiles] = useState<File[]>([]);
  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [storedJds, setStoredJds] = useState<UploadedFile[]>([]);
  const [storedProfiles, setStoredProfiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const jds = localStorage.getItem("jds");
      const profiles = localStorage.getItem("profiles");
      if (jds) setStoredJds(JSON.parse(jds));
      if (profiles) setStoredProfiles(JSON.parse(profiles));
    } catch {
      toast({
        variant: "destructive",
        title: "Error loading stored files",
        description: "Could not read files from local storage.",
      });
    }

    // Check backend server status
    fetch("http://localhost:8000/health")
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, [toast]);

  const uploadToBackend = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/process-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed for ${file.name} - Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.status === "error") {
        throw new Error(data.message || `Failed to process ${file.name}`);
      }

      return {
        name: data.filename,
        content: data.content,
      };
    } catch (error) {
      console.error('Backend upload failed, trying fallback:', error);
      
      // Fallback: Read file content directly in browser
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve({
            name: file.name,
            content: content,
          });
        };
        reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
        reader.readAsText(file);
      });
    }
  };

  const handleUpload = async () => {
    if (jobDescriptionFiles.length === 0 && profileFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select files to upload.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const jdResults = await Promise.all(
        jobDescriptionFiles.map(uploadToBackend)
      );
      const profileResults = await Promise.all(
        profileFiles.map(uploadToBackend)
      );

      const updatedJds = [...storedJds, ...jdResults];
      const updatedProfiles = [...storedProfiles, ...profileResults];

      localStorage.setItem("jds", JSON.stringify(updatedJds));
      localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
      setStoredJds(updatedJds);
      setStoredProfiles(updatedProfiles);
      setJobDescriptionFiles([]);
      setProfileFiles([]);

      toast({
        title: "Upload Successful",
        description: `${jdResults.length} JDs and ${profileResults.length} profiles saved.`,
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Error uploading files. Check console for details.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileName: string, type: "jds" | "profiles") => {
    try {
      if (type === "jds") {
        const updated = storedJds.filter(f => f.name !== fileName);
        setStoredJds(updated);
        localStorage.setItem("jds", JSON.stringify(updated));
      } else {
        const updated = storedProfiles.filter(f => f.name !== fileName);
        setStoredProfiles(updated);
        localStorage.setItem("profiles", JSON.stringify(updated));
      }
      toast({ title: "File Removed", description: `${fileName} removed.` });
    } catch {
      toast({
        variant: "destructive",
        title: "Error removing file",
        description: "Could not remove file from local storage.",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Documents</CardTitle>
            <CardDescription>
              Select job descriptions and consultant profiles to upload and process.
            </CardDescription>
            <div className="flex items-center gap-2 text-sm">
              <span>Backend Status:</span>
              {backendStatus === 'checking' && (
                <span className="text-yellow-600">Checking...</span>
              )}
              {backendStatus === 'online' && (
                <span className="text-green-600">Online (Full processing available)</span>
              )}
              {backendStatus === 'offline' && (
                <span className="text-orange-600">Offline (Basic file reading only)</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jd-upload" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Job Descriptions
                </Label>
                <Input
                  id="jd-upload"
                  type="file"
                  multiple
                  accept=".txt,.pdf,.docx"
                  onChange={(e) => setJobDescriptionFiles(Array.from(e.target.files || []))}
                />
                {jobDescriptionFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground pt-2">
                    Selected: {jobDescriptionFiles.length} JDs
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profiles-upload" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Consultant Profiles
                </Label>
                <Input
                  id="profiles-upload"
                  type="file"
                  multiple
                  accept=".txt,.pdf,.docx"
                  onChange={(e) => setProfileFiles(Array.from(e.target.files || []))}
                />
                {profileFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground pt-2">
                    Selected: {profileFiles.length} profiles
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading || (jobDescriptionFiles.length === 0 && profileFiles.length === 0)}
              >
                {isUploading ? "Uploading..." : "Save Documents"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/ar-dashboard/compare">Go to Compare</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Uploaded Documents</CardTitle>
            <CardDescription>Review and remove uploaded documents.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Job Descriptions ({storedJds.length})</h3>
              <div className="border rounded-md p-2 space-y-1 max-h-60 overflow-y-auto">
                {storedJds.length ? (
                  storedJds.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveFile(file.name, "jds")}
                      >
                        <XIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-2">No JDs uploaded.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Consultant Profiles ({storedProfiles.length})</h3>
              <div className="border rounded-md p-2 space-y-1 max-h-60 overflow-y-auto">
                {storedProfiles.length ? (
                  storedProfiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveFile(file.name, "profiles")}
                      >
                        <XIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-2">No profiles uploaded.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
