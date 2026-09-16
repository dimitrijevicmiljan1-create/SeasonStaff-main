# Faza 6 — Fix Plan

## Critical
1. notify_attendance_check_in trigger — dodati exception handling da notification failure ne blokira check-in:
   - Fajl: supabase/migrations (nova migracija)
   - Fix: dodati EXCEPTION WHEN OTHERS THEN RETURN NEW; u trigger

## High
2. updateOrganizationSettings dvaput fetchuje profile — src/lib/settings/actions.ts
   - Fix: requireOrgStaff da vrati i role, ili koristiti requireOrgOwner

## Medium
3. bottom-nav.tsx koristi mock dashboardStats.pendingRequests — src/components/layout/bottom-nav.tsx:22
   - Fix: fetchovati stvarni pending count ili primiti kao prop

4. Employee vidi approve/reject dugmiće na dashboardu — src/app/(app)/dashboard/page.tsx
   - Fix: role check u DashboardRoute, ne prikazivati dugmiće za employee rolu

## Low — ostaviti za Fazu 7
- Timezone bug u fetchDashboardTodayShifts
- TodayShift tip iz mock-data
- Notifications staleTime bez invalidacije
- PendingRequestsSection dugmići ne pozivaju server actions