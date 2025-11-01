import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary-dark">
          Sign In
        </h1>
        <SignInForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-primary-dark hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}

