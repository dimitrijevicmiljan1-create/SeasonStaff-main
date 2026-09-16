# Faza 7 — Fix Plan 3

## High
1. removeRequest koristi stale closure — concurrent approve vraća prvi zahtev natrag u listu
   Fajl: src/components/dashboard/pending-requests.tsx
   Fix: koristiti functional updater setRequests(prev => prev.filter(r => r.id !== id))
   i pokrenuti onCountChange iz useEffect koji prati requests.length

## Medium
2. catch blokovi gutaju exceptions bez logiranja — runtime greške nevidljive u produkciji
   Fajlovi: pending-requests.tsx i requests-page.tsx (4 catch bloka)
   Fix: dodati console.error(e) unutar svakog catch bloka pre showError

3. onCountChange se zove sa stale count — badge u parentu driftuje pri concurrent akcijama
   Fajl: src/components/dashboard/pending-requests.tsx
   Fix: pokrenuti onCountChange iz useEffect(()=>{ onCountChange?.(requests.length) }, [requests.length])

## Low — ostaviti
- handleSave/handleDelete useCallback dep-ovi na punim mutation objektima
- handleApprove/handleReject pattern dupliciran na 4 mesta