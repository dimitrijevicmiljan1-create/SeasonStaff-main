"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganizationAndProfile } from "@/lib/auth/actions";

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);

    const result = await createOrganizationAndProfile({
      business_name: String(formData.get("business_name") ?? ""),
      org_phone: String(formData.get("org_phone") ?? "") || undefined,
      org_email: String(formData.get("org_email") ?? "") || undefined,
      address: String(formData.get("address") ?? "") || undefined,
      first_name: String(formData.get("first_name") ?? "") || undefined,
      last_name: String(formData.get("last_name") ?? "") || undefined,
      profile_phone: String(formData.get("profile_phone") ?? "") || undefined,
    });

    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push(result.redirectTo ?? "/dashboard");
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error ? <AuthMessage variant="error">{error}</AuthMessage> : null}

      <div className="space-y-2">
        <Label htmlFor="business_name">Business name *</Label>
        <Input
          id="business_name"
          name="business_name"
          required
          placeholder="Beach Bar Sunset"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Your first name</Label>
          <Input id="first_name" name="first_name" autoComplete="given-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Your last name</Label>
          <Input id="last_name" name="last_name" autoComplete="family-name" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="org_email">Business email</Label>
        <Input
          id="org_email"
          name="org_email"
          type="email"
          placeholder="contact@business.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="org_phone">Business phone</Label>
        <Input id="org_phone" name="org_phone" type="tel" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" placeholder="Street, city" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile_phone">Your phone</Label>
        <Input id="profile_phone" name="profile_phone" type="tel" />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating organization…" : "Complete setup"}
      </Button>
    </form>
  );
}
