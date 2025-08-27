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
import { FileText, CheckCircle, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Backend base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface UploadedFile {
  name: string;
  content: string;
}

export default function UploadPage() {
  const [jobDescriptionFiles, setJobDescriptionFiles] = useState<File[]>([]);
  const [storedJds, setStoredJds] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const jdInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchJds();

    fetch(`${API_BASE}/health`)
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const fetchJds = async () => {
    try {
      const res = await fetch("/api/upload/job-description");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStoredJds(
        Array.isArray(data)
          ? data.map((d: any) => ({
              name: d.title,
              content: d.content,
            }))
          : []
      );
    } catch (err) {
      console.error("JD Fetch Error:", err);
      toast({ variant: "destructive", title: "Error fetching JDs" });
      setStoredJds([]);
    }
  };

  const uploadToProcessingServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/process-upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Processing failed for ${file.name}`);
    return res.json();
  };

  const uploadJd = async (file: File) => {
    let processedContent = "";

    if (backendStatus === "online") {
      try {
        const processed = await uploadToProcessingServer(file);
        processedContent = processed.content || "";
      } catch (err) {
        console.warn(`Processing server failed for ${file.name}`, err);
        processedContent = await file.text();
      }
    } else {
      processedContent = await file.text();
    }

    const binary = new Uint8Array(await file.arrayBuffer());
    const base64Data = Buffer.from(binary).toString("base64");

    const payload = {
      title: file.name,
      content: processedContent,
      pdfFile: { data: base64Data, mimeType: file.type, size: file.size },
    };

    const res = await fetch("/api/upload/job-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Upload failed for ${file.name}`);

    return { name: file.name, content: processedContent };
  };

  const handleUpload = async (redirectToCompare = false) => {
    if (jobDescriptionFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select JD files to upload.",
      });
      return;
    }

    setIsUploading(true);
    try {
      await Promise.all(jobDescriptionFiles.map((file) => uploadJd(file)));

      toast({
        title: "Upload Successful",
        description: "Job descriptions uploaded and processed.",
        action: <CheckCircle className="text-green-500" />,
      });

      await fetchJds();
      setJobDescriptionFiles([]);
      if (jdInputRef.current) jdInputRef.current.value = "";

      if (redirectToCompare) router.push("/ar-dashboard/compare");
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

  const handleRemoveJd = async (fileName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileName}"?`
    );
    if (!confirmDelete) return;

    try {
      await fetch("/api/upload/job-description", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fileName }),
      });
      toast({ title: "File Removed", description: `${fileName} removed.` });
      await fetchJds();
    } catch {
      toast({ variant: "destructive", title: "Failed to remove file" });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Job Descriptions</CardTitle>
            <CardDescription>
              Select job descriptions to upload and process.
            </CardDescription>
            <div className="flex items-center gap-2 text-sm">
              <span>Processing Server:</span>
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
                  ? "Online (Enhanced extraction)"
                  : "Offline (Basic upload)"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jd-upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Job Descriptions
              </Label>
              <Input
                id="jd-upload"
                type="file"
                multiple
                accept=".txt,.pdf,.docx"
                ref={jdInputRef}
                onChange={(e) =>
                  setJobDescriptionFiles(Array.from(e.target.files || []))
                }
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleUpload(false)}
                disabled={isUploading || jobDescriptionFiles.length === 0}
              >
                {isUploading ? "Uploading..." : "Save JDs"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUpload(true)}
                disabled={isUploading || jobDescriptionFiles.length === 0}
              >
                Go to Compare
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Uploaded JDs</CardTitle>
            <CardDescription>
              Review and remove uploaded job descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">Job Descriptions ({storedJds.length})</h3>
              <div className="border rounded-md p-2 space-y-1 max-h-60 overflow-y-auto">
                {storedJds.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">
                    No JDs uploaded yet.
                  </div>
                ) : (
                  storedJds.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveJd(file.name)}
                      >
                        <XIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
