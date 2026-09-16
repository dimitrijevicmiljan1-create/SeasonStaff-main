# Faza 7 — Fix Plan

## High
1. pending-requests.tsx:54 — setActionId(null) premestiti u finally blok
   da dugmad ne ostanu trajno disabled ako server action baci exception

2. pending-requests.tsx:57 + requests-page.tsx — dodati error toast kada
   approveRequest/rejectRequest vrati { error } — greška se trenutno tiho ignoriše

## Medium
3. pending-requests.tsx:53 — actionId promeniti iz jednog objekta u Map<string, type>
   da concurrent klikovi na različite kartice ne kvare loading state

4. requests/loading.tsx:7 — dodati "New request" dugme skeleton da se eliminiše
   layout shift (CLS)

## Low — ostaviti, nisu blokeri za deploy
- getRequestLabel duplikat
- TodayShift u pogrešnom modulu
- handleApprove/handleReject duplikacija
- PAGE_TITLES ručni registar