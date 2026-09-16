# Faza 7 — Fix Plan 5

## Medium
1. Double-click race na Approve/Reject dugmetu
   Fajl: src/components/dashboard/pending-requests.tsx
   Problem: oba klika prolaze guard jer actionId.has(id) čita stale closure
   Fix: dodati ref koji prati in-flight request IDs i proveriti ga pre setActionId
   
   Konkretno:
   - Dodati const inFlight = useRef(new Set<string>())
   - Na početku handleApprove/handleReject: if (inFlight.current.has(id)) return;
   - Odmah nakon: inFlight.current.add(id)
   - U finally: inFlight.current.delete(id)

## Low — ostaviti, nisu blokeri
- onCountChange unutar setState updater (harmless sa setPendingCount)
- getRequestLabel duplicira getRequestTypeShortLabel
- handleApprove/handleReject duplicirani na 4 mesta