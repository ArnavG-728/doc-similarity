// 'use client';

// import { useRouter } from 'next/navigation';
// import LoginForm from '@/components/auth/LoginForm';

// export default function LoginPage() {
//   const router = useRouter();

//   const handleLogin = async (data: { email: string; password: string }) => {
//     const res = await fetch('/api/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     });

//     const result = await res.json();
//     if (!res.ok) throw new Error(result.error || 'Login failed');

//     if (result.role === 'AR Requestor') router.push('/ar-dashboard');
//     else if (result.role === 'Recruiter Admin') router.push('/recruiter-admin');
//     else throw new Error('Invalid role');
//   };

//   return (
//     <main className="min-h-screen flex items-center justify-center p-4">
//       <LoginForm onLogin={handleLogin} />
//     </main>
//   );
// }


// 'use client';

// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import LoginForm from '@/components/auth/LoginForm';

// export default function LoginPage() {
//   const router = useRouter();
//   const [error, setError] = useState('');

//   const handleLogin = async (data: { email: string; password: string }) => {
//     setError('');
//     try {
//       const res = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//       });

//       const result = await res.json();
//       if (!res.ok) throw new Error(result.error || 'Login failed');

//       if (result.role === 'AR Requestor') router.push('/ar-dashboard');
//       else if (result.role === 'Recruiter Admin') router.push('/recruiter-admin');
//       else throw new Error('Invalid role');
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center p-4">
//       <LoginForm onLogin={handleLogin} error={error} />
//     </main>
//   );
// }


'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/use-auth'; // ✅ import here

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { signIn } = useAuth(); // ✅ get from context

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login failed');

      // ✅ set user in context (optional)
      await signIn({
        id: result._id,
        email: data.email,
        role: result.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // ✅ redirect based on role
      if (result.role === 'AR Requestor') router.push('/ar-dashboard');
      else if (result.role === 'Recruiter Admin') router.push('/recruiter-admin');
      else throw new Error('Invalid role');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <LoginForm onLogin={handleLogin} />
    </main>
  );
}
