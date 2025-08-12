"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Top3 = { profileId: string; name: string; similarityScore: number };
type Row = {
  _id: string;
  title: string;
  createdAt: string;
  progress: number; // 0 or 100
  matched: boolean;
  top3: Top3[];
};

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ar-status", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load AR status");
        const data = await res.json();
        setRows(data);
      } catch (e: any) {
        setError(e.message || "Failed to load");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AR Status</CardTitle>
            <CardDescription>
              Last 10 job descriptions and their matching status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-red-600 mb-2">{error}</div>
            )}

            {!rows ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No JDs yet.</div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b">
                    <tr className="text-muted-foreground">
                      <th className="py-2 pr-4">Title</th>
                      <th className="py-2 pr-4">Created</th>
                      <th className="py-2 pr-4">State</th>
                      <th className="py-2 pr-4">Progress</th>
                      <th className="py-2 pr-4">Top-3 Preview</th>
                      <th className="py-2 pr-0 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const created = new Date(row.createdAt);
                      const state = row.progress === 100 ? "Completed" : "Pending";
                      return (
                        <tr key={row._id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{row.title}</td>
                          <td className="py-3 pr-4">
                            {isNaN(created.getTime())
                              ? "-"
                              : created.toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={row.matched ? "default" : "secondary"}>
                              {row.matched ? "Matched" : "No-Match"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="w-32">
                              <div className="h-2 bg-muted rounded">
                                <div
                                  className="h-2 bg-primary rounded"
                                  style={{ width: `${row.progress}%` }}
                                />
                              </div>
                              <div className="text-xs mt-1 text-muted-foreground">
                                {row.progress}%
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            {row.top3?.length ? (
                              <div className="space-y-1">
                                {row.top3.map((t, i) => (
                                  <div key={i} className="truncate">
                                    {i + 1}. {t.name} · {Math.round((t.similarityScore ?? 0) * 100)}%
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-0 text-right">
                            <Button asChild size="sm" variant="outline">
                              {/* Option A: existing reporting page */}
                              {/* <Link href={`/recruiter-admin/reporting?jdId=${row._id}`}>
                                View Results
                              </Link> */}

                              {/* Option B (alternative): */}
                              <Link href={`/ar-dashboard/matches/${row._id}`}>
                                View Results
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
