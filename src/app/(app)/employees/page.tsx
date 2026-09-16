import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { EmployeesPage } from "@/components/employees/employees-page";
import { getSessionUser, getProfileForUser } from "@/lib/auth/queries";
import { employeesQueryKey } from "@/lib/employees/queries";
import { fetchEmployeesServer } from "@/lib/employees/queries.server";

export default async function EmployeesRoute() {
  // Use individual cached functions instead of getAuthContext() so that
  // fetchEmployeesServer runs in parallel with the layout's getOrganizationForProfile()
  // call rather than waiting for it to finish first.
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profile = await getProfileForUser(user.id);
  if (!profile) redirect("/setup");

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: employeesQueryKey(profile.organization_id),
    queryFn: () => fetchEmployeesServer(profile.organization_id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EmployeesPage organizationId={profile.organization_id} />
    </HydrationBoundary>
  );
}
