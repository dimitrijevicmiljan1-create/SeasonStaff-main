import type { SubscriptionPlan, SubscriptionStatus } from "@/types/billing";

/**
 * API contracts za buduću Landing Page integraciju.
 * Stripe Edge Functions (faza post-0.5) koristit će ove tipove.
 */

/** Future Landing Page → Stripe Checkout */
export interface CreateCheckoutSessionPayload {
  organization_id: string;
  plan: SubscriptionPlan;
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

/** Future Landing Page → billing overview */
export interface BillingStatusResponse {
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
  employee_limit: number | null;
  monthly_price: number | null;
  implementation_fee: number;
  implementation_paid: boolean;
}

export interface SubscriptionStatusResponse {
  status: SubscriptionStatus;
  organization_id: string;
}

export interface SubscriptionPlanResponse {
  plan: SubscriptionPlan;
  monthly_price: number;
  employee_limit: number;
}

export interface EmployeeLimitResponse {
  employee_limit: number;
  plan: SubscriptionPlan;
  is_unlimited: boolean;
}
