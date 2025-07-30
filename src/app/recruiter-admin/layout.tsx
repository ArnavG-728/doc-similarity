// src/app/recruiter-admin/layout.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RecruiterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute role="Recruiter Admin">{children}</ProtectedRoute>;
}
