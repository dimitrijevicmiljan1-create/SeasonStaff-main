Kritično (security):

fetchDashboardPendingRequests se poziva za sve role uključujući employee — employee ne sme da vidi tuđe requestove. Fix: dodati role check pre fetcha, employee dobija prazan array.
markNotificationRead nema organization_id filter — dodati filter na organization_id i u kodu i u RLS policy.

High:
3. BottomNav useEffect nema cleanup — dodati let cancelled = false pattern i return () => { cancelled = true } da sprečimo stale response.
4. deleteShift šalje duplikat notifikacije pri concurrent delete — koristiti .delete().eq().select() i proveriti da li je row zaista obrisan pre slanja notifikacije.
Medium:
5. Dashboard stats — activeEmployees i checkedInEmployees su hardkodirani mock — fetchovati stvarne vrednosti iz DB.
Low (ostaviti za Fazu 7):

attendance_reminder href promena
resolveDefaultPositionId optimizacija