import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyOtpPage({ searchParams }: Props) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/forgot-password");
  }

  return (
    <AuthCard
      title="Check your email"
      description="Enter the code we sent to your email"
      footer={
        <Link href="/forgot-password" className="font-medium text-accent hover:text-accent-hover">
          Resend code
        </Link>
      }
    >
      <VerifyOtpForm email={email} />
    </AuthCard>
  );
}
