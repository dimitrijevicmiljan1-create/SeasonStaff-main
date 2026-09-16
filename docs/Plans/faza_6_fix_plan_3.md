# Faza 6 — Fix Plan 3

## Critical (security)
1. markAllNotificationsRead missing organization_id filter
   - Fajl: src/lib/notifications/actions.ts:74
   - Fix: dodati organization_id filter isto kao u markNotificationRead

2. user_select_own_notifications RLS policy nije org-scoped
   - Nova migracija: supabase/migrations/20260604150000_faza_6_fix_notifications_select_rls.sql
   - Fix: redefinisati SELECT policy da uz user_id = auth.uid() proverava i organization_id

## High
3. deleteShift vraća success: true kada shift nije pronađen
   - Fajl: src/lib/shifts/actions.ts:204
   - Fix: ako deleted === null, vratiti { error: "Shift not found." } umesto { success: true }

## Medium
4. checkedInToday broji shift instances umesto unique employees
   - Fajl: src/components/dashboard/dashboard-page.tsx:57
   - Fix: koristiti Set od employee_id-eva da deduplikuje pre brojanja