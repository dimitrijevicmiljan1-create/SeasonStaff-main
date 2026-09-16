export type SubscriptionPlan = "starter" | "pro" | "enterprise";

export type SubscriptionStatus = "active" | "past_due" | "cancelled";

export interface Subscription {
  id: string;
  organization_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  employee_limit: number;
  monthly_price: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationBilling {
  id: string;
  organization_id: string;
  implementation_fee: number;
  implementation_paid: boolean;
  created_at: string;
}

export interface OrganizationSubscriptionData {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  employee_limit: number;
  monthly_price: number;
}

export interface OwnerBillingStatus {
  subscription: OrganizationSubscriptionData | null;
  implementation_fee: number;
  implementation_paid: boolean;
}
