// 'use client';

// import { useState } from 'react';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Loader2 } from 'lucide-react';

// export default function SignupForm({
//   role,
//   icon,
//   onBack,
//   onSignup
// }: {
//   role: 'AR Requestor' | 'Recruiter Admin';
//   icon: React.ReactNode;
//   onBack: () => void;
//   onSignup: (data: any) => Promise<void>;
// }) {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await onSignup({
//         name: `${firstName} ${lastName}`,
//         email,
//         password,
//         role
//       });
//     } catch (err) {
//       setError('Signup failed. Try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-sm">
//       <Card>
//         <CardHeader className="text-center">
//           <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">{icon}</div>
//           <CardTitle className="text-2xl">{role} Signup</CardTitle>
//           <CardDescription>Create your account to get started.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="grid gap-4">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <Label>First Name</Label>
//                 <Input
//                   required
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Last Name</Label>
//                 <Input
//                   required
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="grid gap-2">
//               <Label>Email</Label>
//               <Input
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label>Password</Label>
//               <Input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label>Confirm Password</Label>
//               <Input
//                 type="password"
//                 required
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>
//             {error && <p className="text-sm text-red-500 text-center">{error}</p>}
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 animate-spin" /> Signing Up...
//                 </>
//               ) : (
//                 'Sign Up'
//               )}
//             </Button>
//             <Button type="button" variant="outline" className="w-full" onClick={onBack}>
//               Back
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// 'use client';

// import { useState } from 'react';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Loader2 } from 'lucide-react';
// import Link from 'next/link';

// export default function SignupForm({
//   icon,
//   onBack,
//   onSignup
// }: {
//   icon: React.ReactNode;
//   onBack: () => void;
//   onSignup: (data: any) => Promise<void>;
// }) {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [role, setRole] = useState<'AR Requestor' | 'Recruiter Admin' | ''>('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!role) {
//       setError("Please select a role.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await onSignup({
//         name: `${firstName} ${lastName}`,
//         email,
//         password,
//         role
//       });
//     } catch (err) {
//       setError('Signup failed. Try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-sm">
//       <Card>
//         <CardHeader className="text-center">
//           <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">{icon}</div>
//           <CardTitle className="text-2xl">Sign Up</CardTitle>
//           <CardDescription>Create your account to get started.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="grid gap-4">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <Label>First Name</Label>
//                 <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
//               </div>
//               <div>
//                 <Label>Last Name</Label>
//                 <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} />
//               </div>
//             </div>

//             <div className="grid gap-2">
//               <Label>Email</Label>
//               <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
//             </div>

//             <div className="grid gap-2">
//               <Label>Role</Label>
//               <Select value={role} onValueChange={(value) => setRole(value as any)} required>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select your role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="AR Requestor">AR Requestor</SelectItem>
//                   <SelectItem value="Recruiter Admin">Recruiter Admin</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid gap-2">
//               <Label>Password</Label>
//               <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
//             </div>

//             <div className="grid gap-2">
//               <Label>Confirm Password</Label>
//               <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
//             </div>

//             {error && <p className="text-sm text-red-500 text-center">{error}</p>}

//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 animate-spin" /> Signing Up...
//                 </>
//               ) : (
//                 'Sign Up'
//               )}
//             </Button>

//             <Button type="button" variant="outline" className="w-full" onClick={onBack}>
//               Back
//             </Button>

//             <p className="text-sm text-center text-muted-foreground">
//               Already have an account?{' '}
//               <Link href="/" className="text-primary hover:underline">
//                 Log In
//               </Link>
//             </p>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }






// "use client";

// import { useState } from "react";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Loader2, CheckCircle, XCircle } from "lucide-react";
// import Link from "next/link";

// export default function SignupForm({
//   icon,
//   onBack,
//   onSignup,
// }: {
//   icon: React.ReactNode;
//   onBack: () => void;
//   onSignup: (data: any) => Promise<void>;
// }) {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState<"AR Requestor" | "Recruiter Admin" | "">("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [emailExists, setEmailExists] = useState(false);

//   const passwordsMatch =
//     confirmPassword.length > 0 && password === confirmPassword;

//   const checkEmailExists = async (email: string) => {
//     const res = await fetch("/api/check-email", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email }),
//     });

//     const result = await res.json();
//     setEmailExists(result.exists);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!role) {
//       setError("Please select a role.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await onSignup({
//         firstName,
//         lastName,
//         email,
//         password,
//         role,
//       });
//     } catch (err: any) {
//       setError(err.message || "Signup failed. Try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-sm">
//       <Card>
//         <CardHeader className="text-center">
//           <div className="flex justify-center">
//             <div className="bg-primary/10 px-1.5 py-1.5 rounded-full w-fit">
//               {icon}
//             </div>
//             <CardTitle className="text-xl text-center m-2">Sign Up</CardTitle>
//           </div>
//           <CardDescription>Create your account to get started.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="grid gap-4">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <Label>First Name</Label>
//                 <Input
//                   required
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Last Name</Label>
//                 <Input
//                   required
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="grid gap-2">
//               <Label>Email</Label>
// <Input
//   type="email"
//   required
//   value={email}
//   onChange={(e) => setEmail(e.target.value)}
//   onBlur={() => checkEmailExists(email)}
// />
// {emailExists && (
//   <p className="text-sm text-red-500">This email is already registered.</p>
// )}

//             </div>

//             <div className="grid gap-2">
//               <Label>Role</Label>
//               <Select
//                 value={role}
//                 onValueChange={(value) => setRole(value as any)}
//                 required
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select your role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="AR Requestor">AR Requestor</SelectItem>
//                   <SelectItem value="Recruiter Admin">
//                     Recruiter Admin
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid gap-2">
//               <Label>Password</Label>
//               <Input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <div className="grid gap-2">
//               <Label>Confirm Password</Label>
//               <Input
//                 type="password"
//                 required
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//               {confirmPassword.length > 0 && (
//                 <p
//                   className={`text-sm flex items-center gap-1 ${
//                     passwordsMatch ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {passwordsMatch ? (
//                     <>
//                       <CheckCircle className="h-4 w-4" /> Passwords match
//                     </>
//                   ) : (
//                     <>
//                       <XCircle className="h-4 w-4" /> Passwords do not match
//                     </>
//                   )}
//                 </p>
//               )}
//             </div>

//             {error && (
//               <p className="text-sm text-red-500 text-center">{error}</p>
//             )}

//             <div className="flex justify-between gap-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-1/2"
//                 onClick={onBack}
//                 disabled={isLoading}
//               >
//                 Back
//               </Button>
//               <Button type="submit" className="w-1/2" disabled={isLoading || emailExists}>
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 animate-spin" /> Signing Up...
//                   </>
//                 ) : (
//                   "Sign Up"
//                 )}
//               </Button>
//             </div>

//             <p className="text-sm text-center text-muted-foreground">
//               Already have an account?{" "}
//               <Link href="/" className="text-primary hover:underline">
//                 Log In
//               </Link>
//             </p>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import type { Role } from "@/hooks/use-auth";

export default function SignupForm({
  icon,
  onBack,
  onSignup,
  defaultRole,
}: {
  icon: React.ReactNode;
  onBack: () => void;
  onSignup: (data: any) => Promise<void>;
  defaultRole?: Role;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const checkEmailExists = async (email: string) => {
    const res = await fetch("/api/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();
    setEmailExists(result.exists);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await onSignup({
        firstName,
        lastName,
        email,
        password,
        role,
      });
    } catch (err: any) {
      setError(err.message || "Signup failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 px-1.5 py-1.5 rounded-full w-fit">
              {icon}
            </div>
            <CardTitle className="text-xl text-center m-2">Sign Up</CardTitle>
          </div>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>First Name</Label>
                <Input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => checkEmailExists(email)}
              />
              {emailExists && (
                <p className="text-sm text-red-500">
                  This email is already registered.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AR Requestor">AR Requestor</SelectItem>
                  <SelectItem value="Recruiter Admin">Recruiter Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword.length > 0 && (
                <p
                  className={`text-sm flex items-center gap-1 ${
                    passwordsMatch ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="h-4 w-4" /> Passwords match
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={onBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" className="w-1/2" disabled={isLoading || emailExists}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Signing Up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="text-primary hover:underline">
                Log In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
