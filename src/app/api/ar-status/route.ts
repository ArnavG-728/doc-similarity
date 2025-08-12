
// app/api/ar-status/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get("createdBy");

    const db = await getDb();
    const jdFilter: any = {};
    if (createdBy && ObjectId.isValid(createdBy)) {
      jdFilter.createdBy = new ObjectId(createdBy);
    }

    // last 10 JDs by this user (or all if no filter)
    const jds = await db
      .collection("jobdescriptions")
      .find(jdFilter, { projection: { title: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // fetch latest ComparisonResult per JD + join names
    const results = [];
    for (const jd of jds) {
      const cmp = await db
        .collection("ComparisonResult")
        .find({ jobIds: jd._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      const latest = cmp[0];
      const progress = latest ? 100 : 0;
      const topProfiles = (latest?.topProfiles || []).slice(0, 3);

      // collect ids to resolve names
      const ids = topProfiles
        .map((tp: any) => tp.profileId)
        .filter(Boolean)
        .map((id: any) => (ObjectId.isValid(id) ? new ObjectId(id) : null))
        .filter(Boolean) as ObjectId[];

      let nameMap = new Map<string, string>();
      if (ids.length) {
        const docs = await db
          .collection("consultantprofiles")
          .find({ _id: { $in: ids } }, { projection: { name: 1 } })
          .toArray();
        nameMap = new Map(docs.map((d: any) => [d._id.toString(), d.name as string]));
      }

      const top3 = topProfiles.map((tp: any) => ({
        profileId: (tp.profileId || "").toString(),
        similarityScore: Number(tp.similarityScore ?? 0),
        name: nameMap.get(tp.profileId?.toString?.() || "") || "Unknown",
      }));

      results.push({
        _id: jd._id.toString(),
        title: jd.title,
        createdAt: jd.createdAt || null,
        progress,
        matched: (latest?.topProfiles?.length || 0) > 0,
        top3,
      });
    }

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
