export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
] as const;

export const SETUP_ROUTE = "/setup";

export const PROTECTED_APP_ROUTES = [
  "/dashboard",
  "/employees",
  "/shifts",
  "/requests",
  "/settings",
  "/attendance",
] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isProtectedAppRoute(pathname: string): boolean {
  return PROTECTED_APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function getPostAuthRedirect(_role?: string): string {
  return "/dashboard";
}
