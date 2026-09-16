import { NextResponse } from "next/server";
import { getPostAuthRedirect } from "@/lib/auth/constants";
import { getProfileForUser } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const profile = await getProfileForUser(user.id);
  if (!profile) {
    return NextResponse.redirect(`${origin}/setup`);
  }

  const redirectPath = getPostAuthRedirect(profile.role);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : redirectPath;
  return NextResponse.redirect(`${origin}${safeNext}`);
}