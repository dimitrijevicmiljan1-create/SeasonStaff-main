# SeasonStaff

Mobile-first platforma za organizaciju smena i zaposlenih — Seasonal Workforce Management SaaS.

---

> **Note**
>
> Update — 2026-06-06 — Faza 7: Polish, Performance i Deploy
>
> - Mock data kompletno uklonjen: `src/lib/mock-data.ts` (385 linija) i `src/lib/employees-mock.ts` (204 linije) obrisani
> - `TodayShift` tip premešten iz mock-data u `src/types/shifts.ts`
> - `pageTitles` premešten inline u `app-shell.tsx` kao `PAGE_TITLES` konstanta; dodat `/attendance` u `PROTECTED_APP_ROUTES`
> - `ShiftBoardGrid` wrapped u `React.memo` za eliminaciju unnecessary rerenders pri otvaranju modala
> - `handleDragEnd` useCallback dep promenjen na `updateMutation.mutate` (stabilan) umesto celog `updateMutation` objekta
> - Skeleton loaderi dodati: `dashboard/loading.tsx` i `requests/loading.tsx`
> - Empty state za requests dodat: `ClipboardList` ikona + hint za employee rolu
> - `middleware.ts` → `proxy.ts` (Next.js 16 deprecation fix); funkcija preimenovana
> - Turbopack root konfigurisan u `next.config.ts` — eliminisani build warnings
> - Dashboard Approve/Reject dugmići konektovani na prave server actions (`approveRequest`/`rejectRequest`)
> - `inFlight` ref guard dodat u `pending-requests.tsx` i `requests-page.tsx` — double-click race eliminisan
> - `setActionId` promenjen u `Map<string, type>` — concurrent akcije na različitim karticama ne interferiše
> - `try/catch/finally` pattern: `result.error` prosleđen u `showError`, `console.error(e)` u svakom catch bloku
> - `onCountChange` poziva se sinhrono sa `next.length` unutar `setRequests` funkcionalnog updatera
> - GRANT permissije dodate: `service_role` na profiles i notifications za notification flow
> - `npm run build` prolazi čisto bez grešaka i bez warninga
> - Sve 11 tabela potvrđene u Supabase: organizations, profiles, employees, employee_invites, positions, shifts, requests, attendance_logs, notifications, subscriptions, organization_billing
> - Admin Platform backend i frontend potpuno povezani — nema mock podataka u produkciji
> - Employee App integracija: PM odgovoran za FlutterFlow konekciju
> - Vercel deploy: sledeći korak

> **Note**
>
> Update — 2026-06-04 — Faza 6: Settings & Notifications
>
> - Settings stranica: Business Info, Shift Defaults, Positions, Account Settings
> - Shift Defaults: default start/end vreme se automatski popunjava pri kreiranju smene
> - Manager ne može menjati business name — role check implementiran
> - Notification bell: unread counter, mark as read, mark all as read
> - Notifikacije se kreiraju automatski kada employee pošalje request (time off, swap)
> - `notify_attendance_check_in` trigger: exception handling dodat — notification failure ne blokira check-in
> - `markNotificationRead` i `markAllNotificationsRead`: organization_id filter dodat za cross-org sigurnost
> - `user_select_own_notifications` RLS SELECT policy: org-scoped (sprečava čitanje notifikacija iz prethodnih organizacija)
> - `deleteShift`: atomic delete — vraća error umesto silent success kada shift nije pronađen
> - Dashboard: fetchDashboardPendingRequests preskočen za employee rolu — employee ne vidi tuđe requestove
> - Dashboard stats: active employees fetchovan iz DB, checkedInToday deduplikovan po employee_id
> - Dashboard "View Requests" badge: prikazuje stvarni broj pending requestova iz DB
> - BottomNav pending count: useEffect cleanup dodat — sprečava stale response race condition
> - Employee ne vidi Approve/Reject dugmiće na dashboardu
> - GRANT permissije dodate: `service_role` na profiles, notifications; `authenticated` na organizations, notifications
> - 2 Low nalaza ostavljeni za Fazu 7: markNotificationRead dvostruki DB round-trip i RLS IN→scalar optimizacija
> - `npm run build` prolazi uspešno; kod spreman za commit

> **Note**
>
> Update — 2026-06-03 — Faza 5: Employee App i Attendance
>
> - Employee App navigacija: Home, Schedule, Requests, Attendance, Profile
> - Home Screen: sledeća smena, današnji status, notifikacije
> - Schedule Screen: weekly schedule, predstojeće smene, detalji smene
> - Requests Screen: kreiranje swap i time off zahteva, istorija, status
> - Attendance: manual check-in / check-out sa timestamp logging
> - Worked Hours: ukupni sati za tekući mesec, istorija po danima
> - `toDateKeyFromTimestamp` ispravljen na UTC za konzistentno grupiranje po danu
> - `requireOrgOwner` premešten u `guards.ts`, importuje se iz `actions.ts`
> - 4 paralelna upita u `Promise.all` sa stabilnim IDs (`id: day.date`)
> - `LIMIT 500` dodat na server i client attendance queries
> - `check_out` badge promenjen u `variant="neutral"`
> - Napomena (Low): `getMonthRange` koristi lokalno vreme za granice meseca — na Vercelu (UTC) nema efekta, ali postoji mala nekonzistentnost sa UTC grupiranjem; ostaviti za buduću lokalizaciju
> - `npm run build` prolazi uspešno; kod spreman za commit

> **Note**
>
> Update — 2026-06-03 — Faza 4: Unified Request System
>
> - Swap request: employee bira smenu, dodaje opcionu napomenu, submituje zahtev
> - Time Off request: employee bira datum sa validacijom — nije moguće poslati zahtev za prošli datum
> - Request status sistem: pending / approved / rejected sa badge prikazom
> - Manager approve/reject flow: oba dugmeta imaju loading state ("Saving…" / "Rejecting…")
> - `actionId` tip promenjen u `{ id: string; type: "approve" | "reject" } | null` za precizno praćenje in-flight akcija
> - Error handling u modalu: greška pri učitavanju smena se prikazuje umesto misleading "No upcoming shifts"
> - Auth flow refaktoring: server actions vraćaju `redirectTo` kao vrednost umesto server-side `redirect()`
> - `redirectWithCookies` u middlewareu čuva session cookies pri redirectu
> - RLS: `current_user_is_org_staff()` i `current_user_organization_id()` kao SECURITY DEFINER funkcije za rešavanje RLS rekurzije
> - Notifications INSERT isključivo kroz admin/service role klijenta
> - Static import za `formatTimeFromDb` — dynamic import uklonjen
> - `SupabaseClient` iz `@supabase/supabase-js` kao zajednički tip za server/client klijente
> - 3 Low nalaza ostaju kao code quality napomene, nisu funkcionalni problemi
> - `npm run build` prolazi uspešno; kod spreman za commit

> **Note**
>
> Update — 2026-06-03 — Faza 3: Weekly Shift Board
>
> - Weekly grid implementiran: rows = zaposleni, columns = dani u nedelji
> - Shift CRUD: kreiranje, editovanje, brisanje, otkazivanje smena
> - Drag & drop (dnd-kit): smooth interakcije, optimistic updates, rollback support
> - Copy previous week: kopira employee assignments, shift times i pozicije
> - Shift status: scheduled / completed / cancelled sa mobilnim status indikatorima
> - `SHIFT_SELECT` query string deduplikovan u `utils.ts`, importovan na svim mestima
> - `shiftMap` sa `useMemo` za O(1) lookup performanse
> - Position matching po ID (`positionId`) kroz `toBoardEmployees` helper
> - `formatWeeklyHoursLabel`: Math.floor + Xh Ym format
> - RLS: `employee_id` provera u USING i WITH CHECK; organizaciona izolacija ispravna
> - Mobile UX: sticky employee kolona, horizontal scroll, large touch targets (44px)
> - Employee Limit Guard NIJE implementiran u ovoj fazi — dolazi nakon migracija
> - `npm run build` prolazi uspešno; kod spreman za commit

> **Note**
>
> Update — 2026-06-03 — Faza 2: Employee Management
>
> - Employee CRUD: kreiranje, editovanje, promena statusa, brisanje
> - Position sistem: kreiranje, editovanje, brisanje nekorišćenih pozicija
> - Employee invite flow: expire → email → insert redosled; resendInvite implementiran
> - Employee Overview: osnovne informacije, pozicija, status; smene/sati/attendance prazni do Faze 3/5
> - Search i filter sistem: po imenu, emailu, telefonu; filter po statusu i poziciji
> - RLS: `org_member_read_positions` SELECT policy ispravna — svi org memberi čitaju pozicije
> - Shared guard (`guards.ts`): `OrgStaffContext` tip eksplicitan, `isNotFoundError` helper reusable
> - `.select("id").single()` + `isNotFoundError` pattern konzistentno na update i delete operacijama
> - Arhitektura: guard → actions → queries → components konzistentna i čista
> - `npm run build` prolazi uspešno

> **Note**
>
> Update — 2026-06-03 — Faza 1: Auth i organizacija
>
> - Owner signup flow: kreiranje naloga, organizacije i profila; redirect na dashboard
> - Owner login flow: email/password autentifikacija sa redirect na dashboard ili `/setup`
> - Employee invite sistem: kreiranje zaposlenog, generisanje pozivnice, slanje emaila, aktivacija naloga — UI dolazi u Fazi 2
> - Employee App login: autentifikacija kroz isti Supabase Auth sistem
> - Password reset flow: email link → `/auth/callback` → `/reset-password`
> - Role sistem: owner / manager / employee sa RLS zaštitom na svim tabelama
> - Organizaciona izolacija konzistentna na svim tabelama
> - `auth/callback/route.ts`: PKCE code exchange sa open redirect zaštitom
> - Server Actions: signup, login, logout, reset, createOrganization
> - Middleware: session refresh i route protection
> - Auth context (`useAuth()`): vraća user, profile, organization, isLoading
> - `get_employee_invite_by_token` kao RPC — anon korisnici ne diraju tabelu direktno
> - SECURITY DEFINER + SET search_path = public na svim SQL funkcijama
> - `formatAuthError` ne curi interne Supabase poruke prema korisniku
> - `npm run build` prolazi uspešno; kod spreman za commit

> **Note**
>
> Update — 2026-06-02 — Faza 0: Setup i infrastruktura
>
> - GitHub repository kreiran, branch strategija: `main` (stabilan) i `develop` (aktivni razvoj)
> - Next.js App Router inicijalizovan sa TypeScript strict mode, Tailwind CSS i ESLint
> - shadcn/ui inicijalizovan sa base komponentama i theme varijablama
> - Folder struktura zaključana: `/app`, `/components`, `/features`, `/lib`, `/hooks`, `/store`, `/services`, `/providers`, `/types`, `/styles`
> - Supabase projekat kreiran; environment varijable konfigurisane (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
> - Supabase MCP povezan u Cursoru
> - Frontend tim radi samostalno sa mock data — Supabase konekcija dolazi kasnije
> - FlutterFlow projekat kreiran (Employee App) — Supabase konekcija u toku
> - Claude Code instaliran (v2.1.159), GStack aktivan (`/review` komanda dostupna)
> - `npm run build` prolazi uspešno

> **Note**
>
> Update — 2026-06-02 — Faza 0.5: Billing & Subscription Layer
>
> - Nova enuma: `subscription_plan` (starter / pro / enterprise) i `subscription_status` (active / past_due / cancelled)
> - Nova tabela `subscriptions`: čuva aktivnu pretplatu organizacije sa poljima za plan, status, employee_limit, monthly_price i Stripe integraciju (stripe_customer_id, stripe_subscription_id)
> - Nova tabela `organization_billing`: prati onboarding i implementation fee (default 300€, implementation_paid flag)
> - Plan definicije: Starter 49.99€/mj (limit 5), Pro 99.99€/mj (limit 10), Enterprise custom (unlimited)
> - Helper funkcija `get_organization_subscription()`: vraća plan, status, employee_limit, monthly_price
> - Stripe polja pripremljena u bazi za buduću integraciju (Checkout, Customer, Subscription, Webhooks) — bez Stripe UI implementacije
> - Owner može čitati billing informacije; Manager i Employee nemaju pristup
> - RLS model ostaje nepromenjen — subscription limiti se enforceuju kroz business logiku, ne kroz RLS
> - API contracts pripremljeni za buduću Landing Page integraciju (create_checkout_session, billing_status, subscription_plan, employee_limit)
> - Employee Limit Guard NIJE implementiran u ovoj fazi — implementira se u Fazi 3 kada employees tabela postoji

---

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000) u browseru.

## Tech Stack

| Sloj | Tehnologija |
|------|-------------|
| Frontend | Next.js App Router |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Security | Supabase RLS |
| Employee App | FlutterFlow |
| Hosting | Vercel |

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Documentation

Projektna dokumentacija se nalazi u `docs/` folderu.
