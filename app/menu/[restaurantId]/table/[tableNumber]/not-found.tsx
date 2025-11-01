export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
        <p className="mb-8 text-gray-600">Menu not found</p>
        <a
          href="/"
          className="rounded-full bg-primary-dark px-6 py-3 text-white hover:bg-opacity-90 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

