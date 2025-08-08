// 'use client';
// import { useRouter } from 'next/navigation';
// import { Hexagon, User, UserCog } from 'lucide-react';
// import SignupForm from '@/components/auth/SignupForm';

// export default function SignupPage() {
//   const router = useRouter();

//   const handleSignup = async (data: any) => {
//     const res = await fetch('/api/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     });

//     const result = await res.json();
//     if (!res.ok) throw new Error(result.message);

//     // redirect after successful signup
//     if (data.role === 'AR Requestor') router.push('/ar-dashboard');
//     else router.push('/recruiter-admin');
//   };

//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center p-4">
//       <div className="flex items-center space-x-2 mb-8">
//         <Hexagon className="h-8 w-8 text-primary" />
//         <span className="text-2xl font-bold font-headline">Profile Ranker</span>
//       </div>
//       <SignupForm
//         role="AR Requestor" // or dynamically passed
//         icon={<User className="h-6 w-6 text-primary" />}
//         onSignup={handleSignup}
//         onBack={() => router.push('/')}
//       />
//     </main>
//   );
// }



// 'use client';

// import { useRouter } from 'next/navigation';
// import { Hexagon, User, UserCog } from 'lucide-react';
// import SignupForm from '@/components/auth/SignupForm';
// import { useState } from 'react';
// import type { Role } from '@/hooks/use-auth';

// export default function SignupPage() {
//   const router = useRouter();
//   const [role, setRole] = useState<Role>('AR Requestor');

// //   const handleSignup = async (data: any) => {
// //     const res = await fetch('/api/signup', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(data)
// //     });

// //     const result = await res.json();
// //     if (!res.ok) throw new Error(result.message || 'Signup failed');

// //     if (data.role === 'AR Requestor') {
// //       router.push('/ar-dashboard');
// //     } else {
// //       router.push('/recruiter-admin');
// //     }
// //   };

// const handleSignup = async (data: any) => {
//   const res = await fetch('/api/signup', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   });

//   const result = await res.json();

//   if (!res.ok) throw new Error(result.error || 'Signup failed');
  
//   if (data.role === 'AR Requestor') router.push('/ar-dashboard');
//   else router.push('/recruiter-admin');
// };


//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center p-4">
//       <div className="flex items-center space-x-2 mb-8">
//         <Hexagon className="h-8 w-8 text-primary" />
//         <span className="text-2xl font-bold font-headline">Profile Ranker</span>
//       </div>

//       <SignupForm
//         role={role}
//         icon={role === 'AR Requestor' ? <User className="h-6 w-6 text-primary" /> : <UserCog className="h-6 w-6 text-primary" />}
//         onSignup={handleSignup}
//         onBack={() => router.push('/')}
//       />
//     </main>
//   );
// }




// // app/signup/page.tsx
// 'use client';

// import { useRouter } from 'next/navigation';
// import { Hexagon, User, UserCog } from 'lucide-react';
// import SignupForm from '@/components/auth/SignupForm';
// import { useState } from 'react';
// import { useAuth } from '@/hooks/use-auth';
// import type { Role } from '@/hooks/use-auth';

// export default function SignupPage() {
//   const router = useRouter();
//   const [role, setRole] = useState<Role>('AR Requestor');
//   const { signIn } = useAuth(); // ✅ context method

//   const handleSignup = async (data: any) => {
//     const res = await fetch('/api/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     });

//     const result = await res.json();
//     if (!res.ok) throw new Error(result.error || 'Signup failed');

//     // ✅ log the user in after signup
//     await signIn({ email: data.email, role: data.role });

//     // ✅ redirect based on role
//     if (data.role === 'AR Requestor') router.push('/ar-dashboard');
//     else router.push('/recruiter-admin');
//   };

//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center p-4">
//       <div className="flex items-center space-x-2 mb-8">
//         <Hexagon className="h-8 w-8 text-primary" />
//         <span className="text-2xl font-bold font-headline">Profile Ranker</span>
//       </div>

//       <SignupForm
//         role={role}
//         icon={
//           role === 'AR Requestor' ? (
//             <User className="h-6 w-6 text-primary" />
//           ) : (
//             <UserCog className="h-6 w-6 text-primary" />
//           )
//         }
//         onSignup={handleSignup}
//         onBack={() => router.push('/')}
//       />
//     </main>
//   );
// }




'use client';

import { useRouter } from 'next/navigation';
import { Hexagon, User, UserCog } from 'lucide-react';
import SignupForm from '@/components/auth/SignupForm';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/hooks/use-auth';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('AR Requestor');
  const { signIn } = useAuth(); // ✅ context method

  const handleSignup = async (data: any) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Signup failed');

    // ✅ log the user in after signup
    await signIn({ email: data.email, role: data.role });

    // ✅ redirect based on role
    if (data.role === 'AR Requestor') router.push('/ar-dashboard');
    else router.push('/recruiter-admin');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center space-x-2 mb-8">
        <Hexagon className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold font-headline">Profile Ranker</span>
      </div>

      <SignupForm
        defaultRole={role} // ✅ updated prop name
        icon={
          role === 'AR Requestor' ? (
            <User className="h-6 w-6 text-primary" />
          ) : (
            <UserCog className="h-6 w-6 text-primary" />
          )
        }
        onSignup={handleSignup}
        onBack={() => router.push('/')}
      />
    </main>
  );
}
