import { DEFAULT_IMPLEMENTATION_FEE } from "@/lib/billing/plan-definitions";
import { createClient } from "@/lib/supabase/server";
import type {
  OrganizationBilling,
  OrganizationSubscriptionData,
  OwnerBillingStatus,
} from "@/types/billing";

export async function getOrganizationSubscription(
  organizationId: string
): Promise<OrganizationSubscriptionData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_organization_subscription", {
    org_id: organizationId,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return null;
  }

  return {
    plan: row.plan,
    status: row.status,
    employee_limit: row.employee_limit,
    monthly_price: Number(row.monthly_price),
  };
}

export async function getOrganizationBilling(
  organizationId: string
): Promise<OrganizationBilling | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_billing")
    .select(
      "id, organization_id, implementation_fee, implementation_paid, created_at"
    )
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    implementation_fee: Number(data.implementation_fee),
  };
}

export async function getOwnerBillingStatus(
  organizationId: string
): Promise<OwnerBillingStatus> {
  const [subscription, billing] = await Promise.all([
    getOrganizationSubscription(organizationId),
    getOrganizationBilling(organizationId),
  ]);

  return {
    subscription,
    implementation_fee:
      billing?.implementation_fee ?? DEFAULT_IMPLEMENTATION_FEE,
    implementation_paid: billing?.implementation_paid ?? false,
  };
}
