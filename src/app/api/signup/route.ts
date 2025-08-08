// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import dbConnect from '@/lib/database';
// import User from '@/models/User';

// export async function POST(req: NextRequest) {
//   try {
//     const { firstName, lastName, email, password, role } = await req.json();

//     if (!firstName || !lastName || !email || !password || !role) {
//       return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
//     }

//     await dbConnect();

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json({ error: 'User already exists' }, { status: 409 });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role
//     });

//     return NextResponse.json({ success: true }, { status: 201 });
//   } catch (error) {
//     console.error('Signup error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }





// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/database';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, role } = await req.json();

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
