"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyPasswordResetOtp } from "@/lib/auth/actions";

export function VerifyOtpForm({ email }: { email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);

    const code = String(formData.get("code") ?? "").trim();
    const result = await verifyPasswordResetOtp(email, code);

    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/reset-password?mode=reset");
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error ? <AuthMessage variant="error">{error}</AuthMessage> : null}

      <p className="text-sm text-text-secondary">
        Code sent to <span className="font-medium text-text-primary">{email}</span>
      </p>

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          pattern="[0-9]{6,8}"
          placeholder="12345678"
          required
          autoFocus
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifying…" : "Verify code"}
      </Button>
    </form>
  );
}
