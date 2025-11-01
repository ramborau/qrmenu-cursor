import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary-dark">
          Create Account
        </h1>
        <SignUpForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-primary-dark hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}

