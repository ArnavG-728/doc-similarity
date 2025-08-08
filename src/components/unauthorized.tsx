export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Unauthorized Access</h1>
        <p className="text-gray-500">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
