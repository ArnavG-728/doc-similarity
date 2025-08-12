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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const profiles = db.collection("consultantprofiles");

    const _id = new ObjectId(params.id);
    const doc = await profiles.findOne({ _id });

    if (!doc || !doc.pdfFile?.data) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const buf = Buffer.from(doc.pdfFile.data, "base64");
    const filename = `${(doc.name || "resume").replace(/\s+/g, "_")}.pdf`;

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
