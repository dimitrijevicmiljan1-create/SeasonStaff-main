# Faza 7 — Polish, Performance i Deploy

## Korak 1 — Production Cleanup
- Ukloniti sve console.log iz koda (osim intentionalnih error logova)
- Ukloniti dead code i unused imports
- Ukloniti unused komponente
- Ukloniti test podatke iz koda (ne iz baze)
- Verifikovati TypeScript — nema any, nema ts-ignore bez komentara

## Korak 2 — Performance
- Proveriti Shift Board na unnecessary rerenders
- Dodati skeleton loadere gde nedostaju (Dashboard, Employee list, Requests)
- Verifikovati da optimistic updates rade na Shift CRUD
- Proveriti payload size na glavnim queryima — ukloniti overfetching

## Korak 3 — Empty States
- Verifikovati empty state za: No employees, No shifts, No requests, No notifications

## Korak 4 — Security Verification
- Verifikovati organization isolation — user ne može videti tuđe podatke
- Verifikovati RLS na svim tabelama
- Verifikovati employee restrictions
- Verifikovati da realtime nije implementiran (nema WebSocket, nema live sync)

## Korak 5 — Mock Data Cleanup
- Pronaći i ukloniti sve preostale mock podatke iz komponenti
- Sve što koristi mock — ili konektovati na Supabase ili ukloniti

## Korak 6 — Final Build
- npm run build mora proći bez grešaka i bez warnings
- Verifikovati TypeScript strict mode

## Korak 7 — Vercel Deploy (ručno — Ivan)
- Production env vars u Vercel dashboardu
- Domain setup
- SSL
- Final build verification na produkciji

## Napomena
Employee App (FlutterFlow) nije deo ovog deploya.
PM se bavi Employee App integracijom samostalno.