// src/app/ar-dashboard/layout.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ARDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute role="AR Requestor">{children}</ProtectedRoute>;
}
