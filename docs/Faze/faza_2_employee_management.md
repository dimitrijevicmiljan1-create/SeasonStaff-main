SeasonStaff
Faza 2 — Employee Management

Upravljanje zaposlenima

Cilj faze

Implementirati kompletan Employee Management sistem koji omogućava:

kreiranje zaposlenih
uređivanje zaposlenih
organizaciju zaposlenih po pozicijama
Employee onboarding flow
Employee App aktivaciju

Ova faza predstavlja osnovu za:

Weekly Shift Board
Request sistem
Attendance sistem
Employee App
Employee Management

Owner i manager mogu:

Dodati zaposlenog
Editovati zaposlenog
Menjati status
Dodeliti poziciju
Pretraživati zaposlene
Poslati pozivnicu zaposlenom
Otvoriti Employee Overview
Employee polja
Polje	Opis
first_name	Ime
last_name	Prezime
phone	Telefon
email	Email
position	Pozicija
status	active/inactive/suspended
notes	Interna napomena
Employee status
Status	Opis
active	Aktivan
inactive	Trenutno ne radi
suspended	Privremeno suspendovan
Employee page
Desktop

Prikazuje:

tabelu zaposlenih
pretragu
filtere
status badge
quick actions
Mobile

Prikazuje:

employee cards
sticky actions
large tap targets
mobile optimized layout
Employee Card

Prikazuje:

Ime i prezime
Poziciju
Status
Telefon
Quick actions
Quick Actions

Owner i manager mogu:

Edit employee
Change status
View shifts
Open Employee Overview
Resend invitation
Add Employee Modal

Forma sadrži:

ime
prezime
telefon
email
pozicija
status
Employee Creation Flow
Owner/manager kreira zaposlenog
Kreira se employee zapis
Kreira se profile zapis ako je potrebno
Sistem šalje pozivnicu
Employee aktivira nalog
Employee dobija pristup Employee App
Employee Overview
Purpose

Brz pregled zaposlenog.

Employee Overview prikazuje
Osnovne informacije
Poziciju
Status
Predstojeće smene
Ukupne sate za tekući mesec
Attendance pregled
Istoriju zahteva
Employee Overview ne prikazuje
Payroll podatke
Salary podatke
Advanced analytics
Position sistem

Owner i manager mogu:

Kreirati pozicije
Editovati pozicije
Obrisati nekorišćene pozicije
Primeri pozicija
waiter
bartender
chef
cleaning
host
security
Search sistem

Pretraga mora podržavati:

first_name
last_name
email
phone

Pretraga mora biti:

brza
trenutna
mobile-friendly
Filter sistem

Podržani filteri:

Status
active
inactive
suspended
Position
sve pozicije
pojedinačna pozicija
Employee Invite System
Invite Flow
Employee kreiran
Pozivnica poslata
Employee instalira Employee App
Employee postavlja password
Employee aktivira nalog
Resend Invite

Owner i manager mogu:

ponovo poslati pozivnicu
Mobile UX Pravila

Employee Management mora:

Raditi bez problema na telefonu
Koristiti velike touch targete
Imati jednostavne forme
Izbegavati kompleksne tabele na mobilnom uređaju
Backend zahtjevi za naredne faze

Ova faza mora pripremiti podatke za:

Shift Board
employee list
positions
Request System
employee reference
request ownership
Employee App
employee profile
employee authentication
employee permissions
Architecture Lock

Employee zapis predstavlja centralnu referencu za:

smene
attendance
requestove
worked hours
notifikacije

Ne uvoditi paralelne employee modele.

Faza 2 — Checklist
 Employee CRUD radi
 Position sistem radi
 Search radi
 Filteri rade
 Mobile cards rade
 Add Employee modal radi
 Status update radi
 Employee Overview radi
 Employee invite flow radi
 Resend invite radi
 Employee App onboarding radi
 Position filtering radi
 Mobile UX testiran
 Employee model zaključan za naredne faze