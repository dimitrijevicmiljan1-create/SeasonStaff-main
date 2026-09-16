import type { SubscriptionPlan } from "@/types/billing";

export const DEFAULT_IMPLEMENTATION_FEE = 300;
export const UNLIMITED_EMPLOYEE_LIMIT = -1;

export interface PlanDefinition {
  plan: SubscriptionPlan;
  monthly_price: number;
  employee_limit: number;
  label: string;
}

export const PLAN_DEFINITIONS: Record<SubscriptionPlan, PlanDefinition> = {
  starter: {
    plan: "starter",
    monthly_price: 49.99,
    employee_limit: 5,
    label: "Starter",
  },
  pro: {
    plan: "pro",
    monthly_price: 99.99,
    employee_limit: 10,
    label: "Pro",
  },
  enterprise: {
    plan: "enterprise",
    monthly_price: 0,
    employee_limit: UNLIMITED_EMPLOYEE_LIMIT,
    label: "Enterprise",
  },
};

export function getPlanDefinition(plan: SubscriptionPlan): PlanDefinition {
  return PLAN_DEFINITIONS[plan];
}

export function isUnlimitedEmployeeLimit(employee_limit: number): boolean {
  return employee_limit === UNLIMITED_EMPLOYEE_LIMIT;
}
