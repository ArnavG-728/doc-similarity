import { Types } from "mongoose";
import Header from "@/components/Header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/database";
import JobDescription from "@/models/JobDescription";
import ComparisonResult from "@/models/ComparisonResult";
import ConsultantProfile from "@/models/ConsultantProfile";

type TopProfile = {
  profileId: string;
  similarityScore: number;
  name?: string;
};
type ResultRow = {
  profileId: string;
  similarityScore: number;
  name?: string;
};
// Lean type for JobDescription subset used on this page
type JDLean = {
  _id: Types.ObjectId;
  title?: string;
  createdAt?: Date;
};

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();

  // 1) Load JD
  const jd = await JobDescription
    .findById(id, { title: 1, createdAt: 1 })
    .lean<JDLean | null>();

  // 2) Latest ComparisonResult for this JD
  const comparison = await ComparisonResult.findOne({
    jobIds: { $in: [new Types.ObjectId(id), id] },
  })
    .sort({ createdAt: -1 })
    .lean();

  // Derive progress/state
  const hasResult = Boolean(comparison);
  const progress = hasResult ? 100 : 0;

  const rawResults = (comparison as any)?.results || (comparison as any)?.comparisons || [];
  const pickName = (o: any): string | undefined =>
    o?.name ?? o?.candidateName ?? o?.candidate_name ?? o?.profileName ?? o?.profile_name ?? undefined;

  // Map results using index to profileIds array since profileId refs are broken
  const profileIdsArray = (comparison as any)?.profileIds || [];
  let allResults: ResultRow[] = Array.isArray(rawResults)
    ? rawResults.map((r: any, index: number) => {
        const score = r.similarityScore ?? r.similarity_score ?? r.score ?? 0;
        const embeddedName = pickName(r);
        // Use the index to map to the correct profileId from the profileIds array
        const actualProfileId = profileIdsArray[index];
        return {
          profileId: actualProfileId?.toString?.() ?? String(actualProfileId ?? ""),
          similarityScore: Number(score),
          name: embeddedName,
        } as ResultRow;
      })
    : [];

  const rawTop = (comparison as any)?.topProfiles || [];
  let topProfiles: TopProfile[] = Array.isArray(rawTop)
    ? rawTop.map((tp: any, index: number) => {
        const score = tp.similarityScore ?? tp.similarity_score ?? tp.score ?? 0;
        const embeddedName = pickName(tp);
        // Use the index to map to the correct profileId from the profileIds array
        const actualProfileId = profileIdsArray[index];
        return {
          profileId: actualProfileId?.toString?.() ?? String(actualProfileId ?? ""),
          similarityScore: Number(score),
          name: embeddedName,
        } as TopProfile;
      })
    : [];

  if (!topProfiles.length && allResults.length) {
    topProfiles = allResults
      .slice()
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3);
  }

  // 3) Join names for top-3 + table
  const normalizeId = (v: any): string => {
    const raw = typeof v === "object" && v?._id ? v._id : v;
    return (raw?.toString?.() ?? String(raw ?? "")).trim();
  };

  // Use the profileIds array directly since that's where the actual profile references are
  const profileIds = profileIdsArray
    .filter((p: any) => p && Types.ObjectId.isValid(p.toString()))
    .map((p: any) => new Types.ObjectId(p.toString()));

  let profilesById = new Map<string, string>();
  let profilesByName = new Map<string, { _id: string; name: string }>();
  
  if (profileIds.length) {
    const docs = await ConsultantProfile.find(
      { _id: { $in: profileIds } },
      { name: 1 }
    ).lean();

    profilesById = new Map(
      docs.map((d: any) => [d._id.toString(), d.name as string])
    );

    // If some IDs didn't resolve, try a fallback on a possible custom 'id' field
    const resolvedIds = new Set(Array.from(profilesById.keys()));
    const missing = profileIds.filter((oid: any) => !resolvedIds.has(oid.toString()));
    
    if (missing.length) {
      const more = await ConsultantProfile.find(
        { id: { $in: missing } } as any,
        { name: 1, id: 1 }
      ).lean();

      for (const d of more as any[]) {
        const key = (d._id || d.id)?.toString?.() ?? "";
        if (key) profilesById.set(key, d.name as string);
      }
    }
    

  }
  
  // Only use fallback profiles if we have absolutely no data from agent workflow
  let fallbackProfiles: any[] = [];
  const hasAgentResults = topProfiles.length > 0 || allResults.length > 0;
  if (!hasAgentResults && profileIds.length === 0) {
    fallbackProfiles = await ConsultantProfile.find({}, { name: 1 }).limit(8).lean();
  }

  // Also try to resolve by candidate names present in results/topProfiles
  const candidateNames = Array.from(
    new Set([
      ...topProfiles.map((t) => (pickName(t) || t.name || "").trim()).filter(Boolean),
      ...allResults.map((r) => (pickName(r) || r.name || "").trim()).filter(Boolean),
    ])
  );
  if (candidateNames.length) {
    const namedDocs = await ConsultantProfile.find(
      { name: { $in: candidateNames } },
      { name: 1 }
    ).lean();
    for (const d of namedDocs as any[]) {
      profilesByName.set((d.name as string) || "", {
        _id: d._id.toString(),
        name: d.name as string,
      });
    }
  }

  const top3Display = topProfiles.slice(0, 3).map((t, idx) => {
    const idNorm = normalizeId(t.profileId);
    let foundName = profilesById.get(idNorm);
    let docId = idNorm;
    
    // Prioritize the name from agent workflow results first
    const agentWorkflowName = t.name || pickName(t);
    
    // Only use fallback profiles if we have no agent results AND no database match
    if (!agentWorkflowName && !foundName && fallbackProfiles.length > idx) {
      foundName = fallbackProfiles[idx].name;
      docId = fallbackProfiles[idx]._id.toString();
    }
    
    // Priority: agent workflow name > database name > fallback name > unknown
    const displayName = agentWorkflowName || foundName || idNorm || "Unknown";
    
    // Use valid ObjectId for PDF link if we have a valid docId
    const finalDocId = Types.ObjectId.isValid(docId) ? docId : "";
    return { ...t, name: displayName, profileId: finalDocId };
  });

  const resultsDisplay = allResults
    .slice()
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .map((r, idx) => {
      const idNorm = normalizeId(r.profileId);
      let foundName = profilesById.get(idNorm);
      let docId = idNorm;
      
      // Prioritize the name from agent workflow results first
      const agentWorkflowName = r.name || pickName(r);
      
      // Only use fallback profiles if we have no agent results AND no database match
      if (!agentWorkflowName && !foundName && fallbackProfiles.length > idx) {
        foundName = fallbackProfiles[idx].name;
        docId = fallbackProfiles[idx]._id.toString();
      }
      
      // Priority: agent workflow name > database name > fallback name > unknown
      const displayName = agentWorkflowName || foundName || idNorm || "Unknown";
      const finalDocId = Types.ObjectId.isValid(docId) ? docId : "";
      return { ...r, name: displayName, profileId: finalDocId };
    });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Matches for JD: {jd?.title ?? id}
          </h1>
          <div className="text-sm text-muted-foreground">
            Created:{" "}
            {jd?.createdAt
              ? new Date(jd.createdAt).toLocaleString()
              : "—"}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Progress and result summary for this job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="w-64">
                  <div className="h-2 bg-muted rounded">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">
                    {progress}%
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">State</div>
                <Badge variant={hasResult ? "default" : "secondary"}>
                  {hasResult ? "Completed" : "Pending"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Top-3</div>
                <div>
                  <Badge variant={top3Display.length ? "default" : "secondary"}>
                    {top3Display.length ? "Matched" : "No-Match"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 3 Matches</CardTitle>
              <CardDescription>
                Highest ranked profiles and quick downloads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {top3Display.length === 0 ? (
                <div className="text-sm text-muted-foreground">No matches yet.</div>
              ) : (
                <div className="space-y-3">
                  {top3Display.map((t, idx) => (
                    <div
                      key={`${normalizeId(t.profileId)}-${idx}`}
                      className="flex items-center justify-between border rounded p-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {idx + 1}. {t.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Score: {Math.round((t.similarityScore ?? 0) * 100)}%
                        </div>
                      </div>
                      {t.profileId && t.profileId !== "" ? (
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={`/api/profile-pdf/${t.profileId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download PDF
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          No PDF
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Results</CardTitle>
              <CardDescription>
                Full list of compared profiles for this JD.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resultsDisplay.length === 0 ? (
                <div className="text-sm text-muted-foreground">No results.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left border-b">
                      <tr className="text-muted-foreground">
                        <th className="py-2 pr-4">Profile</th>
                        <th className="py-2 pr-4">Score</th>
                        <th className="py-2 pr-0 text-right">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsDisplay.map((r, idx) => (
                        <tr key={`${normalizeId(r.profileId)}-${idx}`} className="border-b last:border-0">
                          <td className="py-3 pr-4">{r.name}</td>
                          <td className="py-3 pr-4">
                            {Math.round((r.similarityScore ?? 0) * 100)}%
                          </td>
                          <td className="py-3 pr-0 text-right">
                            {r.profileId && r.profileId !== "" ? (
                              <Button asChild size="sm" variant="ghost">
                                <a
                                  href={`/api/profile-pdf/${r.profileId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download
                                </a>
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" disabled>
                                No PDF
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
