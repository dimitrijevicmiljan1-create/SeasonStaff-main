# Faza 7 — Fix Plan 2

## High
1. result.error se odbacuje — 4 callsita u pending-requests.tsx i requests-page.tsx
   Fix: showError(result.error ?? 'Failed to approve/reject request')

2. Nema catch bloka — exceptions bubblaju do error boundary umesto toasta
   Fix: dodati catch(e) blok koji poziva showError u handleApprove/handleReject
   u oba fajla

3. memo() na ShiftBoardGrid nikad ne fires jer handleDragEnd zavisi o
   celom useMutation objektu
   Fix: useCallback da zavisi o updateMutation.mutate umesto updateMutation

## Medium
4. onCountChange se poziva unutar setState updater — dvostruko puca u React Strict Mode
   Fix: izvući removeRequest da poziva onCountChange van setState updatera

5. Skeleton dugme u loading.tsx prikazuje se svim rolama → CLS za managere/ownere
   Fix: ukloniti skeleton dugme ili prikazivati ga samo za employee rolu

## Low — ostaviti, nisu blokeri
- getRequestLabel duplicira getRequestTypeShortLabel
- PAGE_TITLES duplicira navItems labelove