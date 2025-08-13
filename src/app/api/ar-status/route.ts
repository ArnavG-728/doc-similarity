
// app/api/ar-status/route.ts
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/database";
import JobDescription from "@/models/JobDescription";
import ComparisonResult from "@/models/ComparisonResult";
import ConsultantProfile from "@/models/ConsultantProfile";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get("createdBy");

    await dbConnect();

    const jdFilter: any = {};
    if (createdBy && Types.ObjectId.isValid(createdBy)) {
      jdFilter.uploadedBy = new Types.ObjectId(createdBy);
    }

    // Last 10 JDs (by uploader if provided)
    const jds = await JobDescription.find(jdFilter, { title: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean<Array<{ _id: Types.ObjectId; title?: string; createdAt?: Date }>>();

    const results: any[] = [];
    for (const jd of jds) {
      const latest: any = await ComparisonResult.findOne({
        jobIds: { $in: [jd._id, jd._id.toString()] },
      })
        .sort({ createdAt: -1 })
        .lean();

      const progress = latest ? 100 : 0;
      // Prefer topProfiles from schema; otherwise derive from results/comparisons
      let topProfiles: any[] = Array.isArray(latest?.topProfiles) ? latest.topProfiles : [];
      if ((!topProfiles || !topProfiles.length) && Array.isArray(latest?.results)) {
        const pickName = (o: any) =>
          o?.name ?? o?.candidateName ?? o?.candidate_name ?? o?.profileName ?? o?.profile_name ?? undefined;
        const normalized = latest.results.map((r: any) => ({
          profileId: r.profileId || r.profile_id,
          similarityScore: Number(r.similarityScore ?? r.similarity_score ?? r.score ?? 0),
          name: pickName(r),
        }));
        topProfiles = normalized
          .slice()
          .sort((a: any, b: any) => Number(b.similarityScore ?? 0) - Number(a.similarityScore ?? 0))
          .slice(0, 3);
      }
      if ((!topProfiles || !topProfiles.length) && Array.isArray(latest?.comparisons)) {
        const pickName = (o: any) =>
          o?.name ?? o?.candidateName ?? o?.candidate_name ?? o?.profileName ?? o?.profile_name ?? undefined;
        topProfiles = latest.comparisons
          .slice()
          .sort((a: any, b: any) => Number(b.similarity_score ?? b.similarityScore ?? 0) - Number(a.similarity_score ?? a.similarityScore ?? 0))
          .slice(0, 3)
          .map((c: any) => ({ profileId: c.profileId || c.profile_id, similarityScore: Number(c.similarity_score ?? c.similarityScore ?? c.score ?? 0), name: pickName(c) }));
      }
      topProfiles = (topProfiles || []).slice(0, 3);

      const ids = (topProfiles as any[])
        .map((tp: any) => (tp.profileId || "").toString())
        .filter((id: string) => Types.ObjectId.isValid(id))
        .map((id: string) => new Types.ObjectId(id));

      let nameMap = new Map<string, string>();
      let fallbackProfiles: any[] = [];
      
      if (ids.length) {
        const docs = await ConsultantProfile.find(
          { _id: { $in: ids } },
          { name: 1 }
        ).lean();
        nameMap = new Map(docs.map((d: any) => [d._id.toString(), d.name as string]));
        
        // If no profiles found, use fallback profiles for demo
        if (docs.length === 0) {
          fallbackProfiles = await ConsultantProfile.find({}, { name: 1 }).limit(3).lean();
        }
      }

      const top3 = (topProfiles as any[]).map((tp: any, index: number) => {
        const idStr = (tp.profileId || "").toString();
        const score = Number(tp.similarityScore ?? tp.similarity_score ?? tp.score ?? 0);
        let name = tp.name || nameMap.get(idStr);
        
        // Use fallback profile if no name found
        if (!name && fallbackProfiles.length > index) {
          name = fallbackProfiles[index].name;
        }
        
        name = name || idStr || "Unknown";
        return { profileId: idStr, similarityScore: score, name };
      });

      results.push({
        _id: jd._id.toString(),
        title: jd.title,
        createdAt: (jd as any).createdAt || null,
        progress,
        matched: (topProfiles?.length || 0) > 0,
        top3,
      });
    }

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
