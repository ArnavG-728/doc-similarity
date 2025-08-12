import { MongoClient, ObjectId } from "mongodb";
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

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME!;

let client: MongoClient | null = null;
async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName);
}

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

export default async function MatchesPage({
  params,
}: {
  params: { id: string };
}) {
  const db = await getDb();

  // 1) Load JD
  const jd = await db
    .collection("jobdescriptions")
    .findOne({ _id: new ObjectId(params.id) }, { projection: { title: 1, createdAt: 1 } });

  // 2) Latest ComparisonResult for this JD
  const cmp = await db
    .collection("ComparisonResult")
    .find({ jobIds: new ObjectId(params.id) })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  const comparison = cmp[0];

  // Derive progress/state
  const hasResult = Boolean(comparison);
  const progress = hasResult ? 100 : 0;
  const topProfiles: TopProfile[] =
    (comparison?.topProfiles || []).map((tp: any) => ({
      profileId: tp.profileId?.toString?.() ?? tp.profileId,
      similarityScore: tp.similarityScore,
    })) ?? [];

  const allResults: ResultRow[] =
    (comparison?.results || []).map((r: any) => ({
      profileId: r.profileId?.toString?.() ?? r.profileId,
      similarityScore: r.similarityScore,
    })) ?? [];

  // 3) Join names for top-3 + table
  const profileIds = Array.from(
    new Set([
      ...topProfiles.map((t) => t.profileId).filter(Boolean),
      ...allResults.map((r) => r.profileId).filter(Boolean),
    ])
  ).map((id) => new ObjectId(id));

  let profilesById = new Map<string, string>();
  if (profileIds.length) {
    const docs = await db
      .collection("consultantprofiles")
      .find({ _id: { $in: profileIds } }, { projection: { name: 1 } })
      .toArray();
    profilesById = new Map(
      docs.map((d: any) => [d._id.toString(), d.name as string])
    );
  }

  const top3Display = topProfiles.slice(0, 3).map((t) => ({
    ...t,
    name: profilesById.get(t.profileId) || "Unknown",
  }));

  const resultsDisplay = allResults
    .slice()
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .map((r) => ({
      ...r,
      name: profilesById.get(r.profileId) || "Unknown",
    }));

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Matches for JD: {jd?.title ?? params.id}
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
                      key={t.profileId + idx}
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
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={`/api/profile-pdf/${t.profileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download PDF
                        </a>
                      </Button>
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
                      {resultsDisplay.map((r) => (
                        <tr key={r.profileId} className="border-b last:border-0">
                          <td className="py-3 pr-4">{r.name}</td>
                          <td className="py-3 pr-4">
                            {Math.round((r.similarityScore ?? 0) * 100)}%
                          </td>
                          <td className="py-3 pr-0 text-right">
                            <Button asChild size="sm" variant="ghost">
                              <a
                                href={`/api/profile-pdf/${r.profileId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Download
                              </a>
                            </Button>
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
