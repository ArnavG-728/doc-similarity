
"use client";

import { useState, useMemo, useEffect } from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
    name: string;
    content: string;
}

export default function JdManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jds, setJds] = useState<UploadedFile[]>([]);
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
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredJds.length > 0 ? filteredJds.map((jd) => (
                        <TableRow key={jd.name}>
                        <TableCell className="font-medium">{jd.name}</TableCell>
                        <TableCell>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                {jd.content}
                            </p>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
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
