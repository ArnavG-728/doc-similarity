// // app/api/check-email/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/database';
// import User from '@/models/User';

// export async function POST(req: NextRequest) {
//   const { email } = await req.json();

//   if (!email) {
//     return NextResponse.json({ exists: false }, { status: 400 });
//   }

//   await dbConnect();
//   const user = await User.findOne({ email });

//   return NextResponse.json({ exists: !!user });
// }



// app/api/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    await dbConnect();
    const user = await User.findOne({ email });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json({ exists: false });
  }
}

