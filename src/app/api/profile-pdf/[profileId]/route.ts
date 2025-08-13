import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/database";
import ConsultantProfile from "@/models/ConsultantProfile";

export async function GET(
  _req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params;
    const raw = decodeURIComponent((profileId || "").trim());

    await dbConnect();

    let doc: any = null;
    if (Types.ObjectId.isValid(raw)) {
      doc = await ConsultantProfile.findById(raw).lean();
    } else {
      // Try resolving by name (support underscores-to-spaces fallback)
      doc = await ConsultantProfile.findOne({ name: raw }).lean();
      if (!doc && raw.includes("_")) {
        const spaced = raw.replace(/_/g, " ");
        doc = await ConsultantProfile.findOne({ name: spaced }).lean();
      }
    }
    if (!doc) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (!doc || !(doc as any).pdfFile?.data) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const buf = Buffer.from((doc as any).pdfFile.data, "base64");
    const filename = `${(((doc as any).name || "resume") as string).replace(/\s+/g, "_")}.pdf`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("profile-pdf error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
