SeasonStaff
Faza 4 — Unified Request System

Zahtevi zaposlenih i approval workflow

Cilj faze

Implementirati jedinstveni sistem zahteva koji omogućava zaposlenima da komuniciraju izmene rasporeda bez direktnog menjanja smena.

Ova faza povezuje:

Weekly Shift Board
Employee App
Notification System
Request System

SeasonStaff koristi jedan request sistem.

Podržani tipovi zahteva:

Shift Swap Request
Time Off Request
Osnovni princip

Employee nikada ne menja raspored direktno.

Sve izmene prolaze kroz approval workflow.

Shift Swap Request
Purpose

Employee traži zamenu postojeće smene.

Flow
Korak	Akcija
1	Employee kreira swap request
2	Request dobija status pending
3	Manager pregleda zahtev
4	Manager approve/reject
5	Employee dobija notifikaciju
Employee može
poslati swap request
videti status zahteva
videti istoriju zahteva
Employee ne može
menjati raspored direktno
menjati status zahteva
odobravati zahteve
Time Off Request
Purpose

Employee traži slobodan dan.

Primeri
godišnji odmor
privatne obaveze
slobodan dan
bolest
Flow
Korak	Akcija
1	Employee kreira time off request
2	Request dobija status pending
3	Manager pregleda zahtev
4	Manager approve/reject
5	Employee dobija notifikaciju
Request Status
Status	Opis
pending	Čeka odgovor
approved	Odobreno
rejected	Odbijeno
Request Types
Type	Opis
swap	Zamena smene
time_off	Slobodan dan
Admin Platform Request Page

Prikazuje:

Pending requests
Approved requests
Rejected requests
Request Card

Prikazuje:

employee info
request type
request details
status
created date
Manager Actions

Manager može:

Approve request
Reject request
Employee App Requests

Employee vidi:

Sve svoje zahteve
Status svakog zahteva
Datum kreiranja
Istoriju zahteva
Employee Request Creation

Employee može kreirati:

Swap Request

Polja:

shift
optional note
Time Off Request

Polja:

date
optional note
Notifications
Triggeri
new_request
request_approved
request_rejected
swap_request_approved
swap_request_rejected
time_off_approved
time_off_rejected
Recipients
Manager

Dobija:

new request
Employee

Dobija:

approved request
rejected request
Mobile UX

Actions moraju biti:

velike
jasne
brzo dostupne

Mobile Rules

Employee mora moći:

Kreirati zahtev za nekoliko sekundi
Videti status bez dodatnih klikova
Razumeti stanje zahteva bez obuke
Backend Requirements

Sistem koristi:

requests table

Podržava:

swap requests
time off requests
Required Fields
id
employee_id
organization_id
type
status
metadata
created_at
Security Rules

Employee vidi samo:

svoje requestove

Manager vidi:

requestove svoje organizacije

Owner vidi:

requestove svoje organizacije
Zabranjeno

Ne uvoditi:

Complex approval chains
Multi-level approvals
Enterprise workflow engine
Realtime request synchronization
Architecture Lock

Request sistem predstavlja jedini dozvoljeni način da employee traži izmenu rasporeda.

Employee nikada ne menja raspored direktno.

Sve promene prolaze kroz request sistem i approval workflow.

Faza 4 — Checklist
 Swap request radi
 Time off request radi
 Request creation radi
 Request history radi
 Request status sistem radi
 Manager approve radi
 Manager reject radi
 Employee App request ekran radi
 Notifications rade
 Mobile UX radi
 RLS pravila rade
 Unified request sistem zaključen
 Architecture lock potvrđen