"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import { FileText, Users, CheckCircle, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const jdInputRef = useRef<HTMLInputElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchJds();
    fetchProfiles();

    fetch("/api/health")
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const fetchJds = async () => {
    try {
      const res = await fetch("/api/upload/job-description");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // setStoredJds(Array.isArray(data) ? data : []);
      setStoredJds(
        Array.isArray(data)
          ? data.map((d: any) => ({
              name: d.title, // 🧠 Map `title` to `name`
              content: d.content,
            }))
          : []
      );
    } catch (err) {
      console.error("JD Fetch Error:", err);
      toast({
        variant: "destructive",
        title: "Error fetching JDs",
      });
      setStoredJds([]); // fallback to empty to prevent .map crash
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/upload/consultant-profile");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStoredProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      toast({
        variant: "destructive",
        title: "Error fetching profiles",
      });
      setStoredProfiles([]); // fallback to empty array to avoid map crash
    }
  };

  const uploadToBackend = async (file: File, type: "jds" | "profiles") => {
    return new Promise<UploadedFile>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        if (!e.target?.result) return reject(new Error("Empty file"));

        // const base64Data = (e.target.result as string).split(",")[1];
        const binary = new Uint8Array(e.target.result as ArrayBuffer);
        const base64Data = Buffer.from(binary).toString("base64");

        const plainText = await file.text();

        // Common payload for both types
        const payload =
          type === "jds"
            ? {
                title: file.name,
                content: plainText,
                pdfFile: {
                  data: base64Data,
                  mimeType: file.type,
                  size: file.size,
                },
              }
            : {
                name: file.name,
                // resumeText: plainText,
                pdfFile: {
                  data: base64Data,
                  mimeType: file.type,
                  size: file.size,
                },
              };

        if (file.size > 2 * 1024 * 1024) {
          return reject(new Error(`${file.name} exceeds 2MB limit`));
        }

        const endpoint =
          type === "jds"
            ? "/api/upload/job-description"
            : "/api/upload/consultant-profile";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) return reject(new Error(`Upload failed for ${file.name}`));
        resolve({ name: file.name, content: plainText });
      };

      reader.onerror = () =>
        reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async (redirectToCompare = false) => {
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
      await Promise.all([
        ...jobDescriptionFiles.map((file) => uploadToBackend(file, "jds")),
        ...profileFiles.map((file) => uploadToBackend(file, "profiles")),
      ]);

      toast({
        title: "Upload Successful",
        description: "Documents uploaded and saved to database.",
        action: <CheckCircle className="text-green-500" />,
      });

      await fetchJds();
      await fetchProfiles();
      setJobDescriptionFiles([]); // ✅ Clear JD file state
      setProfileFiles([]); // ✅ Clear Profile file state

      if (jdInputRef.current) jdInputRef.current.value = "";
      if (profileInputRef.current) profileInputRef.current.value = "";

      if (redirectToCompare) {
        router.push("/ar-dashboard/compare"); // ✅ Redirect only if specified
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not upload documents.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (
    fileName: string,
    type: "jds" | "profiles"
  ) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const endpoint =
        type === "jds"
          ? "/api/upload/job-description"
          : "/api/upload/consultant-profile";

      await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fileName }),
      });
      toast({ title: "File Removed", description: `${fileName} removed.` });
      type === "jds" ? await fetchJds() : await fetchProfiles();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to remove file",
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
              Select job descriptions and consultant profiles to upload and
              process.
            </CardDescription>
            <div className="flex items-center gap-2 text-sm">
              <span>Backend Status:</span>
              <span
                className={
                  backendStatus === "checking"
                    ? "text-yellow-600"
                    : backendStatus === "online"
                    ? "text-green-600"
                    : "text-orange-600"
                }
              >
                {backendStatus === "checking"
                  ? "Checking..."
                  : backendStatus === "online"
                  ? "Online"
                  : "Offline"}
              </span>
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
                  ref={jdInputRef} // ✅ attach ref
                  onChange={(e) =>
                    setJobDescriptionFiles(Array.from(e.target.files || []))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="profiles-upload"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" /> Consultant Profiles
                </Label>
                <Input
                  id="profiles-upload"
                  type="file"
                  multiple
                  accept=".txt,.pdf,.docx"
                  ref={profileInputRef} // ✅ attach ref
                  onChange={(e) =>
                    setProfileFiles(Array.from(e.target.files || []))
                  }
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleUpload(false)} // ✅ This defers execution until click
                disabled={
                  isUploading ||
                  (jobDescriptionFiles.length === 0 &&
                    profileFiles.length === 0)
                }
              >
                {isUploading ? "Uploading..." : "Save Documents"}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleUpload(true)} // ✅ Pass true to trigger upload + redirect
                disabled={
                  isUploading ||
                  (jobDescriptionFiles.length === 0 &&
                    profileFiles.length === 0)
                }
              >
                Go to Compare
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Uploaded Documents</CardTitle>
            <CardDescription>
              Review and remove uploaded documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">
                Job Descriptions ({storedJds.length})
              </h3>
              <div className="border rounded-md p-2 space-y-1 max-h-60 overflow-y-auto">
                {storedJds.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
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
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">
                Consultant Profiles ({storedProfiles.length})
              </h3>
              <div className="border rounded-md p-2 space-y-1 max-h-60 overflow-y-auto">
                {storedProfiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
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
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
