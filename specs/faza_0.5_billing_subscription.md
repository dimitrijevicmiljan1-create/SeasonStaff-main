SeasonStaff
Faza 0.5 — Billing & Subscription Layer

Priprema SaaS billing i onboarding infrastrukture

Cilj faze

Pripremiti SeasonStaff za SaaS billing i onboarding.

Ova faza mora biti integrisana sa postojećom arhitekturom i NE SME menjati:

postojeći RLS model
role sistem
organization isolation model

RLS ostaje nepromenjen.

Napomena

Employee Limit Guard NIJE deo ove faze.

Guard se implementira u Fazi 3 — nakon što employees tabela postoji i Employee Management sistem radi.

1. Novi Enumi

Kreirati:

subscription_plan
starter
pro
enterprise

subscription_status
active
past_due
cancelled

2. Nova tabela: subscriptions

Purpose:

Čuvanje aktivne organizacijske pretplate.

Required Fields
Polje	Tip
id	uuid primary key
organization_id	uuid references organizations(id)
plan	subscription_plan not null
status	subscription_status not null default 'active'
employee_limit	integer not null
monthly_price	numeric not null
stripe_customer_id	text nullable
stripe_subscription_id	text nullable
starts_at	timestamptz
expires_at	timestamptz
created_at	timestamptz default now()

3. Nova tabela: organization_billing

Purpose:

Praćenje onboarding i implementation plaćanja.

Required Fields
Polje	Tip
id	uuid primary key
organization_id	uuid references organizations(id)
implementation_fee	numeric default 300
implementation_paid	boolean default false
created_at	timestamptz default now()

4. Plan Definitions

STARTER
49.99€/mesečno
employee_limit = 5

PRO
99.99€/mesečno
employee_limit = 10

ENTERPRISE
Custom pricing
employee_limit = unlimited

5. Subscription Helper

Kreirati reusable backend helper:

get_organization_subscription()

Vraća:
plan
status
employee_limit
monthly_price

6. Stripe Preparation

Pripremiti database polja i backend strukturu za:

Stripe Checkout
Stripe Customer
Stripe Subscription
Stripe Webhooks

Stripe UI implementacija NIJE potrebna u ovoj fazi.

Samo backend priprema.

7. Owner Billing Access

Owner mora moći da pročita:

Current plan
Employee limit
Subscription status
Implementation status

Manager i Employee NE mogu pristupiti billing informacijama.

8. RLS

NE MENJATI postojeći RLS model.

Zadržati:

organization isolation
owner permissions
manager permissions
employee permissions

tačno onako kako je definisano u BACKEND_MASTER.

Subscription limiti se enforceuju kroz business logiku, ne kroz RLS.

9. Future Integration Readiness

Pripremiti API contracts za buduću Landing Page integraciju:

create_checkout_session
billing_status
subscription_status
subscription_plan
employee_limit

Landing Page će se kasnije konektovati kroz Supabase i Stripe, ali Landing integracija NIJE potrebna u ovoj fazi.

Faza 0.5 — Checklist
 subscription_plan enum kreiran
 subscription_status enum kreiran
 subscriptions tabela kreirana
 organization_billing tabela kreirana
 Plan definitions definisane (Starter / Pro / Enterprise)
 get_organization_subscription() helper kreiran
 Stripe polja pripremljena u bazi
 Owner billing access radi
 Manager i Employee ne vide billing
 RLS model nepromenjen
 API contracts pripremljeni za Landing Page
 Employee Limit Guard NIJE implementiran (ide u Fazu 3)
