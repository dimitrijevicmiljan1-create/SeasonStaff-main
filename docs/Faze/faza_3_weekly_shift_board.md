SeasonStaff
Faza 3 — Weekly Shift Board

Centralni sistem organizacije smena

Cilj faze

Implementirati najvažniji ekran celog sistema.

Weekly Shift Board predstavlja centralni operativni alat za:

Owner
Manager

Sve ostale funkcionalnosti sistema direktno zavise od kvaliteta ovog ekrana.

Najvažniji ekran sistema

Weekly Shift Board je core feature proizvoda.

Ako ovaj ekran radi:

brzo
fluidno
mobile-friendly

proizvod ima tržišnu vrednost.

Svrha Weekly Shift Board-a

Owner i manager moraju moći:

Organizovati zaposlene
Planirati nedeljne smene
Brzo menjati raspored
Kopirati rasporede
Upravljati dnevnim operacijama

uz minimalan broj klikova.

Weekly Grid
Rows

Zaposleni

Columns

Dani u nedelji

Shift Card

Prikazuje:

employee
start_time
end_time
position
status
Shift Management

Manager može:

Kreirati smenu
Editovati smenu
Obrisati smenu
Dodeliti zaposlenog
Drag & drop shift
Promeniti vreme smene
Otkazati smenu
Shift Creation Flow
Klik na praznu ćeliju
Otvara se modal
Odabir zaposlenog
Odabir vremena
Save
Optimistic update
Shift Edit Flow
Klik na postojeću smenu
Otvara se modal
Izmena podataka
Save
Instant UI update
Drag & Drop

Koristiti:

dnd-kit ONLY

Requirements:

smooth interactions
no lag
mobile compatible
optimistic updates
touch-friendly

Drag & Drop Rules

MORA:

Raditi na desktop-u
Raditi na mobilnom uređaju
Imati rollback support
Delovati trenutno
Copy Previous Week
Purpose

Najveća ušteda vremena za menadžera.

Flow
Manager klikne Copy Previous Week
Otvara se potvrda
Sistem kopira:
employee assignments
shift times
positions
Kreira se nova nedelja
Copy Week Rules

NE kopirati:

attendance
requests
notifications

Kopirati samo raspored.

Mobile UX
Horizontal Navigation

Week scroll horizontalno.

Sticky Employee Column

Employee name ostaje vidljiv.

Large Touch Targets

Minimum 44px.

Mobile Rules
Smooth horizontal scroll
Thumb-friendly interactions
Minimal accidental drags
Jasni touch feedback
Shift Status
Status	Opis
scheduled	Zakazana
completed	Završena
cancelled	Otkazana

Employee Integration

Weekly Shift Board predstavlja izvor podataka za:

Employee App Schedule

Employee App prikazuje:

weekly schedule
upcoming shifts
shift details

Podaci dolaze direktno iz Shift Board-a.

Employee App Notifications

Promene smena mogu generisati:

shift assigned
shift updated
shift cancelled

notifikacije.

Backend Requirements

Backend mora podržati:

Weekly shifts query
Shift CRUD
Drag & drop updates
Copy week workflow
Shift Payload

MUST sadržati:

id
employee_id
shift_date
start_time
end_time
position_id
status
Performance

OBAVEZNO:

minimal rerenders
optimistic updates
lightweight components

Shift Board Performance Lock
KRITIČNO

Ovo je najvažniji performance zahtev u celom projektu.

Board mora:

Delovati trenutno
Imati smooth scrolling
Imati lag-free drag & drop
Imati minimalne payload-e
Imati minimalne rerender-e
Zabranjeno

Ne uvoditi:

Complex calendar systems
Realtime collaboration
Multi-user editing
Heavy analytics
Enterprise scheduling features
Architecture Lock

Weekly Shift Board ostaje:

centralni ekran sistema
najvažniji feature MVP-a
primarni alat za owner-a i manager-a

Employee App koristi podatke iz njega, ali ga ne menja direktno.

Employee nikada ne uređuje raspored direktno.

Sve izmene prolaze kroz Request sistem.

---

Employee Limit Guard

Napomena

Employee Limit Guard je deo Billing & Subscription sistema (Faza 0.5).

Implementira se u ovoj fazi jer employees tabela sada postoji i Employee Management sistem radi.

Kada se aktivira

Pre svake create_employee mutacije.

Logika
Prebrojati aktivne zaposlene u organizaciji
Pročitati trenutnu pretplatu iz subscriptions tabele
Uporediti broj zaposlenih sa employee_limit

Ako je limit dostignut:

Vratiti validation error.

Primer poruke:

"Dostigli ste maksimalan broj zaposlenih za trenutni paket."

Pravila

Ovo je application/business logika.

NE implementirati kroz RLS.

RLS model ostaje nepromenjen.

Limiti po planu
Plan	employee_limit
Starter	5
Pro	10
Enterprise	unlimited

---

Faza 3 — Checklist
 Weekly grid radi
 Shift creation radi
 Shift editing radi
 Shift deletion radi
 Drag & drop radi
 Mobile scrolling radi
 Copy previous week radi
 Optimistic updates rade
 Employee App schedule koristi Shift Board podatke
 Shift notification triggeri rade
 Board nema lag
 Performance testiran
 Architecture lock potvrđen
 Employee Limit Guard implementiran
 Guard ne prolazi kroz RLS
 Validation error poruka radi
