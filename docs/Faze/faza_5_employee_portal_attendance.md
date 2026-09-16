SeasonStaff
Faza 5 — Employee App i Attendance

Mobilna aplikacija za zaposlene i evidencija prisutnosti

Cilj faze

Implementirati kompletnu Employee App aplikaciju.

Ova faza predstavlja glavni employee experience unutar sistema.

Employee App omogućava zaposlenima da:

vide kada rade
vide sledeće smene
vide koliko su radili
šalju zahteve
koriste attendance
primaju notifikacije

bez potrebe za pozivima i porukama.

Employee App

Employee App koristi:

FlutterFlow
Supabase Auth
Supabase Database
isti backend kao Admin Platform

Employee App NIJE poseban sistem.

Employee App Navigation

Bottom navigation sadrži:

Home
Schedule
Requests
Attendance
Profile
Home Screen
Purpose

Brz pregled najvažnijih informacija.

Home prikazuje
Sledeću smenu
Današnji status
Važne notifikacije
Next Shift Card

Prikazuje:

datum
vreme
poziciju
status
Today's Status

Prikazuje:

checked in
checked out
not checked in
Schedule Screen
Purpose

Pregled rasporeda.

Schedule prikazuje
Weekly schedule
Upcoming shifts
Shift details
Shift Card

Prikazuje:

datum
start time
end time
poziciju
status
Employee može
pregledati raspored
Employee ne može
menjati raspored
kreirati smene
uređivati smene
Requests Screen
Purpose

Komunikacija promena rasporeda.

Employee može kreirati
Swap Request

Polja:

shift
optional note
Time Off Request

Polja:

date
optional note
Request History

Prikazuje:

tip zahteva
status
datum kreiranja
Request Status
Status	Opis
pending	Čeka odgovor
approved	Odobreno
rejected	Odbijeno
Attendance Screen
Purpose

Jednostavna evidencija prisutnosti.

Check-in

Employee klikne:

Check In

Sistem snima:

timestamp
Check-out

Employee klikne:

Check Out

Sistem snima:

timestamp
Attendance Screen prikazuje
Current status
Last action
Check In dugme
Check Out dugme
Attendance Rules
GPS tracking NE postoji
QR sistem NE postoji
Attendance je manual
Owner može editovati logove
Manager može pregledati logove
Attendance Logs
Polje	Opis
employee	Zaposleni
timestamp	Vreme
type	check_in / check_out
notes	Opcionalno
Worked Hours Screen
Purpose

Pregled odrađenih sati.

Employee vidi
Ukupan broj sati za tekući mesec
Istoriju odrađenih sati
Attendance pregled
Primer prikaza

Maj 2026

138h

Istorija:

03 Maj - 8h
04 Maj - 6h
05 Maj - 10h
Employee može videti
samo svoje sate
Employee ne može videti
sate drugih zaposlenih
payroll podatke
salary podatke
Profile Screen
Prikazuje
Ime i prezime
Poziciju
Email
Telefon
Akcije
Logout
Change password
Notifications

Employee vidi:

shift assigned
shift updated
shift cancelled
request approved
request rejected
time off approved
time off rejected
attendance confirmations
Employee App Security

Employee vidi samo:

svoje smene
svoje zahteve
svoje notifikacije
svoje attendance logove
svoje worked hours

Employee NE vidi:

druge zaposlene
druge rasporede
organizacione podatke
settings
Mobile-First UX

Employee App mora raditi:

perfektno na telefonu
bez horizontal scrolla
brzo
jednostavno
one-hand friendly
Employee UX Pravila
Maksimalno 5 tabova
Sve ključne akcije dostupne u 1-2 dodira
Nema kompleksnih workflow-a
Minimalan broj formi
Minimalan broj klikova
Backend Requirements

Employee App koristi:

shifts
requests
attendance_logs
notifications

i iste RLS politike kao Admin Platform.

Zabranjeno

Ne uvoditi:

Employee desktop portal
Payroll
Salary calculations
Chat sistem
GPS attendance
Geofencing
Realtime collaboration
Architecture Lock

Employee Portal više ne postoji.

Employee koristi isključivo Employee App.

Employee App predstavlja zvanični employee kanal sistema i deo je MVP-a od prvog dana.

Faza 5 — Checklist
 Employee App navigation radi
 Home Screen radi
 Schedule Screen radi
 Requests Screen radi
 Swap Request radi
 Time Off Request radi
 Request History radi
 Check In radi
 Check Out radi
 Attendance Logs rade
 Worked Hours ekran radi
 Monthly Hours prikaz radi
 Worked Hours istorija radi
 Notifications rade
 Profile Screen radi
 Employee security pravila rade
 Mobile UX radi
 RLS pravila rade
 Employee Portal uklonjen
 Employee App architecture lock potvrđen