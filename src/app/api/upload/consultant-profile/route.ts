import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import ConsultantProfile from '@/models/ConsultantProfile';
import User from '@/models/User';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, pdfFile } = body;

    // Validate required fields
    if (!name || !pdfFile?.data || !pdfFile?.mimeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (pdfFile.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 2MB limit' }, { status: 413 });
    }

    await dbConnect();

    const userId = req.cookies.get('token')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert base64 PDF to buffer
    const fileBuffer = Buffer.from(pdfFile.data, 'base64');

    // Attempt to extract readable text
    let resumeText = '';
    try {
      const pdfData = await pdf(fileBuffer);
      resumeText = pdfData.text.trim();
      console.log("✅ PDF text extracted:", resumeText.slice(0, 200));
    } catch (err) {
      console.error("❌ PDF parsing failed:", err);
      return NextResponse.json({ error: 'Unreadable PDF file' }, { status: 400 });
    }

    // Save full PDF (as base64) + extracted text
    const profile = await ConsultantProfile.create({
      name,
      resumeText,
      uploadedBy: user._id,
      pdfFile: {
        data: pdfFile.data,
        mimeType: pdfFile.mimeType,
        size: pdfFile.size,
      },
    });

    return NextResponse.json(profile, { status: 201 });

  } catch (error) {
    console.error('Profile Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const profiles = await ConsultantProfile.find().sort({ createdAt: -1 });
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { name } = await req.json();
    await dbConnect();

    const deleted = await ConsultantProfile.findOneAndDelete({ name });
    if (!deleted) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
