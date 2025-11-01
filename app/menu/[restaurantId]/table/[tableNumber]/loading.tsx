export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-dark border-t-transparent mx-auto"></div>
        <p className="text-gray-600">Loading menu...</p>
      </div>
    </div>
  );
}

