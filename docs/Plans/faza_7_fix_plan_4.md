# Faza 7 — Fix Plan 4

## High
1. useEffect je pogrešan alat za onCountChange — badge driftuje jedan frame
   Fajl: src/components/dashboard/pending-requests.tsx
   Fix: 
   - Ukloniti useEffect
   - U removeRequest: zadržati setRequests(prev => prev.filter(...)) ali dodati
     onCountChange?.(requests.length - 1) sinhrono ispod setRequests poziva

## Medium
2. onCountChange nije u dep arrayu useEffect — eslint warn
   Fajl: src/components/dashboard/pending-requests.tsx
   Fix: riješeno uklanjanjem useEffect iz stavke #1 — nema potrebe za zasebnim fixom

## Low — ostaviti
- useEffect mount fire — harmless, ali novo ponašanje
- handleApprove/handleReject duplicirani na 4 mesta