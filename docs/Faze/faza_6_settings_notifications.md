SeasonStaff
Faza 6 — Settings i Notifications

Podešavanja sistema i notifikacioni centar

Cilj faze

Implementirati završne administrativne funkcionalnosti sistema:

Business Settings
Position Management
Shift Defaults
Notification System

Ova faza povezuje:

Admin Platform
Employee App
Request System
Attendance System
Settings Page

Settings predstavlja centralno mesto za konfiguraciju organizacije.

Settings mora ostati:

jednostavan
pregledan
bez enterprise kompleksnosti

Settings Sections
Business Info
Positions
Shift Defaults
Account Settings
Business Info
Purpose

Osnovni podaci o biznisu.

Polja
Polje	Opis
business_name	Naziv
phone	Telefon
email	Email
address	Adresa

Business Rules

Owner može:

menjati sve podatke

Manager može:

menjati operativne podatke
Positions
Purpose

Upravljanje radnim pozicijama.

Supported Actions
Create position
Edit position
Delete unused position
Primeri
waiter
bartender
chef
host
cleaning
security
Position Rules

Pozicije se koriste u:

Employee Management
Weekly Shift Board
Employee Overview
Shift Defaults
Purpose

Ubrzavanje kreiranja smena.

Manager može definisati
default shift start
default shift end
default positions

Shift Default Rules

Koriste se samo kao pomoć pri kreiranju smena.

Ne predstavljaju obavezna pravila.

Account Settings
Owner

Može:

promeniti podatke naloga
promeniti lozinku
Manager

Može:

promeniti podatke naloga
promeniti lozinku
Notification System
Purpose

Pravovremeno informisanje korisnika.

Notification Channels
In-App Notifications

Prikazuju se unutar aplikacije.

Email Notifications

Koriste se za:

invite employee
request updates
shift reminders

Admin Platform Notifications
Header Bell

Sadrži:

bell icon
unread counter
dropdown lista

Notification Dropdown

Prikazuje:

Notification title
Short description
Timestamp
Read status
Employee App Notifications

Employee App prikazuje:

Shift updates
Request updates
Attendance confirmations
Reminders
Notification Triggers
Shift Events
Trigger	Prima
Shift assigned	Employee
Shift updated	Employee
Shift cancelled	Employee
Request Events
Trigger	Prima
New request	Manager
Swap approved	Employee
Swap rejected	Employee
Time off approved	Employee
Time off rejected	Employee
Attendance Events
Trigger	Prima
Attendance reminder	Employee
Attendance confirmation	Employee
Notification Payload

MUST sadržati:

title
message
type
created_at
read
Notification Rules

Notifikacije moraju biti:

jasne
kratke
operativno korisne

Ne koristiti:

marketing notifikacije
spam
nepotrebne događaje
Read Status

Podržati:

Mark as read
Mark all as read
Unread counter
Mobile UX
Admin Platform

Notification dropdown mora biti:

pregledan
touch-friendly
brz
Employee App

Notifikacije moraju biti:

lako dostupne
jednostavne za razumevanje
vidljive bez dodatnih koraka
Backend Requirements

Notification sistem koristi:

notifications tabelu
organization isolation
profile ownership
Security Rules

Korisnik vidi samo:

svoje notifikacije

Ne vidi:

notifikacije drugih korisnika
Settings Philosophy

Settings moraju biti:

minimalne
jednostavne
bez enterprise complexity

Zabranjeno

Ne uvoditi:

Enterprise permissions
Complex notification workflows
Multi-level settings
Marketing automation
Notification rule engines
Architecture Lock

Settings ostaju mali administrativni modul.

Notification System služi operativnim događajima.

Employee App koristi isti notification backend kao Admin Platform.

Ne graditi poseban notification sistem za Employee App.

Faza 6 — Checklist
 Settings page radi
 Business Info radi
 Positions management radi
 Shift Defaults rade
 Account Settings rade
 Notification Bell radi
 Unread Counter radi
 Notification Dropdown radi
 Email Notifications rade
 Employee App Notifications rade
 Shift notification triggeri rade
 Request notification triggeri rade
 Attendance notification triggeri rade
 Mark as Read radi
 Mark All as Read radi
 RLS pravila rade
 Settings ostaju jednostavne
 Notification architecture lock potvrđen