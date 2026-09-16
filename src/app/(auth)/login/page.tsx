import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string }>;
}) {
  const params = await searchParams;
  const showResetSuccess = params.reset === "success";
  const callbackError = params.error === "auth_callback";

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your SeasonStaff admin account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
            Create one
          </Link>
        </>
      }
    >
      {showResetSuccess ? (
        <p className="mb-4 rounded-md bg-status-approved-bg px-3 py-2 text-sm text-status-approved">
          Password updated. You can sign in now.
        </p>
      ) : null}
      {callbackError ? (
        <p className="mb-4 rounded-md bg-status-rejected-bg px-3 py-2 text-sm text-status-rejected">
          Sign-in link expired or invalid. Try again.
        </p>
      ) : null}
      <LoginForm />
    </AuthCard>
  );
}
