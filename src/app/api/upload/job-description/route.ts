// src/app/api/upload/job-description/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import JobDescription from '@/models/JobDescription';
import User from '@/models/User';
import pdf from 'pdf-parse';

// POST – Upload JD with text extraction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, pdfFile } = body;

    if (!title || !pdfFile?.data || !pdfFile?.mimeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (pdfFile.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 2MB limit' }, { status: 413 });
    }

    await dbConnect();

    const userId = req.cookies.get('token')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Decode PDF and extract text
    let content = '';
    try {
      const fileBuffer = Buffer.from(pdfFile.data, 'base64');
      const parsed = await pdf(fileBuffer);
      content = parsed.text.trim();
      console.log("✅ JD PDF text extracted:", content.slice(0, 200));
    } catch (err) {
      console.error("❌ JD PDF parsing failed:", err);
      return NextResponse.json({ error: 'Unreadable PDF file' }, { status: 400 });
    }

    const jd = await JobDescription.create({
      title,
      content,
      pdfFile: {
        data: pdfFile.data,
        mimeType: pdfFile.mimeType,
        size: pdfFile.size,
      },
      uploadedBy: user._id,
    });

    return NextResponse.json(jd, { status: 201 });
  } catch (error) {
    console.error('JD Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET – Fetch all JDs
export async function GET() {
  try {
    await dbConnect();
    const jds = await JobDescription.find().sort({ createdAt: -1 });
    return NextResponse.json(jds, { status: 200 });
  } catch (error) {
    console.error('JD Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE – Remove JD by title
export async function DELETE(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await JobDescription.findOneAndDelete({ title: name });

    if (!deleted) {
      return NextResponse.json({ error: 'JD not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('JD Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
