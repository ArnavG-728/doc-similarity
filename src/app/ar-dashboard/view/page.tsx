
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { User, FileText as FileTextIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  name: string;
  content: string;
}

function DetailsCard({ item }: { item: UploadedFile | null }) {
  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Select an item from the dropdown to see its details.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No item selected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>File Content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="font-code text-sm whitespace-pre-wrap p-4 bg-background rounded-md overflow-x-auto border">
            {item.content}
        </pre>
      </CardContent>
    </Card>
  );
}


export default function ViewPage() {
  const [view, setView] = useState<'profiles' | 'jds'>('profiles');
  const [selectedItem, setSelectedItem] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    try {
        const storedFiles = localStorage.getItem(view);
        if (storedFiles) {
            setFiles(JSON.parse(storedFiles));
        } else {
            setFiles([]);
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Could not load files",
            description: `There was an error reading ${view} from local storage.`
        })
        setFiles([]);
    }
  }, [view, toast]);

  const handleViewChange = (value: 'profiles' | 'jds') => {
    setView(value);
    setSelectedItem('');
  };
  
  const selectedObject = useMemo(() => {
    if (!selectedItem) return null;
    return files.find(option => option.name === selectedItem) || null;
  }, [selectedItem, files]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>View Documents</CardTitle>
            <CardDescription>Select a profile or job description to see its details.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 items-center">
             <RadioGroup value={view} onValueChange={handleViewChange} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="profiles" id="r1" />
                  <Label htmlFor="r1" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4"/>
                    Profiles
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jds" id="r2" />
                  <Label htmlFor="r2" className="flex items-center gap-2 cursor-pointer">
                    <FileTextIcon className="h-4 w-4" />
                    Job Descriptions
                  </Label>
                </div>
              </RadioGroup>

            <Select value={selectedItem} onValueChange={setSelectedItem} disabled={files.length === 0}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder={`Select a ${view === 'profiles' ? 'profile' : 'JD'}...`} />
              </SelectTrigger>
              <SelectContent>
                {files.length > 0 ? files.map((option, index) => (
                  <SelectItem key={`${option.name}-${index}`} value={option.name}>
                     {option.name}
                  </SelectItem>
                )) : (
                    <SelectItem value="no-files" disabled>No files uploaded yet.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedObject && (
          <DetailsCard item={selectedObject} />
        )}
      </main>
    </div>
  );
}
