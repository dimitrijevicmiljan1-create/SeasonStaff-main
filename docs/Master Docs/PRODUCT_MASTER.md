SeasonStaff
Dokumentacija proizvoda — v2.0

Mobile-first platforma za organizaciju smena i zaposlenih
Seasonal Workforce Management SaaS

1. Korisnici

Platforma ima 3 osnovne role:

Rola	Opis	Pristup
Owner	Vlasnik biznisa	Admin Platform
Manager	Menadžer zaposlenih i smena	Admin Platform
Employee	Zaposleni	Employee App
Arhitektura proizvoda

SeasonStaff se sastoji od dva korisnička kanala povezana na isti backend sistem.

Admin Platform

Koriste:

Owner
Manager

Dostupno preko:

Web aplikacije
Mobile Web aplikacije

Služi za:

upravljanje zaposlenima
organizaciju smena
Weekly Shift Board
odobravanje zahteva
attendance pregled
podešavanja sistema
Employee App

Koriste:

Employee

Dostupno preko:

FlutterFlow mobilne aplikacije

Služi za:

pregled rasporeda
pregled smena
attendance
slanje zahteva
pregled odrađenih sati
notifikacije
Važan princip

Employee App NIJE poseban sistem.

Employee App je samo drugi ulaz u isti sistem.

Svi koriste:

isti backend
istu bazu
ista pravila pristupa
iste poslovne procese
Owner

Owner upravlja celim sistemom.

Može:

Kreirati organizaciju
Dodavati zaposlene
Kreirati menadžere
Organizovati smene
Upravljati attendance logovima
Upravljati settings sekcijom
Pregledati sve requestove i notifikacije

Owner ima full access.

Manager

Manager upravlja operativnim delom sistema.

Može:

Organizovati smene
Dodavati i editovati zaposlene
Upravljati requestovima
Pregledati attendance logove
Upravljati dnevnim rasporedom

Manager NE može:

Brisati organizaciju
Upravljati owner accountom
Menjati billing i ownership
Employee

Employee koristi Employee App.

Može:

Pregledati svoje smene
Videti weekly schedule
Check-in / check-out
Slati swap request
Slati time off request
Pregledati notifikacije
Videti svoje odrađene sate
Editovati osnovne profile informacije

Employee NE može:

Kreirati smene
Menjati raspored direktno
Upravljati drugim zaposlenima
Pristupati settings sekciji
Odobravati requestove
2. Organizacija i zaposleni
Organization model

1 owner = 1 organization

Employee pripada samo jednoj organizaciji.

Manager pripada samo jednoj organizaciji.

Multi-organization support nije deo MVP-a.

Employee management

Owner i manager mogu:

Dodati zaposlenog
Editovati zaposlenog
Menjati status zaposlenog
Dodeliti poziciju
Dodati internu napomenu
Employee onboarding
Owner ili manager kreira zaposlenog
Zaposleni dobija pozivnicu
Preuzima Employee App
Postavlja lozinku
Prijavljuje se u aplikaciju
Dobija pristup svom rasporedu
Employee status
Status	Opis
Active	Aktivan zaposlen
Inactive	Trenutno ne radi
Suspended	Privremeno suspendovan
Pozicije

Biznis može definisati vlastite pozicije.

Primeri:

Waiter
Bartender
Chef
Host
Cleaning
Security

Pozicije služe:

organizaciji smena
lakšem filtriranju
preglednijem rasporedu

3. Weekly Shift Board
Najvažniji deo sistema

Weekly Shift Board je centralni ekran aplikacije.

Ceo proizvod je optimizovan oko:

brzog organizovanja smena
minimalnog broja klikova
mobile-first workflow-a

I dalje predstavlja najvažniji ekran za owner-a i manager-a.

Weekly grid
Element	Opis
Rows	Zaposleni
Columns	Dani u nedelji
Shift cards	Smene zaposlenih
Sticky column	Employee name
Horizontal scroll	Mobile week navigation
Shift management

Manager može:

Kreirati smenu
Editovati smenu
Obrisati smenu
Dodeliti zaposlenog
Drag & drop smene
Kopirati prethodnu nedelju
Shift status
Status	Opis
Scheduled	Zakazana
Completed	Završena
Cancelled	Otkazana
Copy previous week
Manager klikne “Copy Previous Week”
Sistem kopira:
employee assignments
shift times
positions
Kreira se nova nedelja
Mobile UX

Weekly Shift Board mora:

Raditi fluidno na telefonu
Imati smooth horizontal scroll
Imati velike touch targete
Imati minimal lag
Podržavati swipe-friendly workflow
4. Request System
Jedinstveni sistem zahteva

Employee NE menja raspored direktno.

Sve izmene prolaze kroz approval flow.

Tipovi zahteva
Shift Swap Request

Zaposleni traži zamenu smene.

Manager pregledava zahtev i odlučuje:

approve
reject
Time Off Request

Zaposleni traži slobodan dan.

Primeri:

godišnji odmor
slobodan dan
privatne obaveze
bolest

Manager pregledava zahtev i odlučuje:

approve
reject
Request flow
Korak	Akcija
1	Employee šalje zahtev
2	Manager pregleda zahtev
3	Manager approve/reject
4	Employee dobija notifikaciju
Request status
Status	Opis
Pending	Čeka odgovor
Approved	Odobreno
Rejected	Odbijeno
Notifications

Triggeri:

Novi request
Approved request
Rejected request
Time off approved
Time off rejected

Notifikacije:

in-app
email
5. Attendance
Minimal attendance sistem

Attendance ostaje ultra jednostavan.

Cilj:

evidencija prisutnosti
minimal friction workflow
Attendance flow
Korak	Akcija
1	Employee otvara aplikaciju
2	Klik na check-in
3	Timestamp se snima
4	Klik na check-out
5	Timestamp se snima
Attendance log
Polje	Opis
Employee	Zaposleni
Type	Check-in / Check-out
Timestamp	Vreme akcije
Notes	Opcionalna napomena
Attendance pravila

ULAZI:

Manual check-in
Manual check-out
Timestamp logging
Owner attendance editing
Manager attendance review

NE ULAZI:

GPS tracking
QR check-in
Biometric systems
Geofencing
Live presence tracking
6. Employee App
Employee experience

Employee App je primarni alat za zaposlene.

Aplikacija mora biti:

ultra jednostavna
mobile-first
brza
bez komplikacija
Home Screen

Employee vidi:

Sledeću smenu
Današnji status
Važne notifikacije
Schedule

Employee vidi:

Weekly schedule
Predstojeće smene
Detalje smene
Requests

Employee može:

Poslati swap request
Poslati time off request
Videti istoriju zahteva
Videti status zahteva
Attendance

Employee može:

Check-in
Check-out
Videti poslednju attendance aktivnost
Worked Hours

Employee može videti samo svoje podatke.

Prikazuje:

Ukupan broj sati za tekući mesec
Istoriju odrađenih sati po danima
Attendance pregled

Primer:

Maj 2026 - 138h

Istorija:

03 Maj - 8h
04 Maj - 6h
05 Maj - 10h
Notifications

Employee dobija:

Shift reminders
Schedule changes
Shift cancellation
Request updates
Attendance confirmations
Employee App filozofija

Aplikacija mora omogućiti zaposlenom da bez poziva, poruka i dodatne komunikacije zna:

kada radi
koliko je radio
da li mu je zahtev odobren
da li je check-in uspešno evidentiran
7. Dashboard i pregled
Owner dashboard

Dashboard služi za brz pregled operacija.

Prikazuje:

Današnje smene
Broj zaposlenih
Pending requestove
Attendance pregled
Quick actions
Quick actions
Akcija	Opis
Add employee	Dodavanje zaposlenog
Create shift	Kreiranje smene
Copy week	Kopiranje prethodne nedelje
View requests	Pregled requestova
Employee overview

Owner i manager mogu otvoriti pregled zaposlenog.

Prikazuje:

Predstojeće smene
Ukupne odrađene sate
Istoriju zahteva
Attendance pregled
8. Settings
Minimal settings sistem

Settings mora ostati:

jednostavan
pregledan
bez enterprise complexity-ja
Business settings
Polje	Opis
Business name	Naziv biznisa
Phone	Telefon
Email	Email
Address	Adresa
Shift defaults

Manager može definisati:

Default shift start
Default shift end
Default positions
9. Notifikacije
Notification sistem

Platforma koristi:

In-app notifications
Email notifications
Notification triggeri
Trigger	Prima
New shift	Employee
Shift updated	Employee
Shift cancelled	Employee
Swap request approved	Employee
Swap request rejected	Employee
Time off approved	Employee
Time off rejected	Employee
Attendance reminder	Employee

10. Mobile-first filozofija
Primarni uređaji

Platforma je optimizovana prvenstveno za:

iPhone
Android
Desktop sekundarno
Mobile UX pravila
Admin Platform

Owner i manager često rade u pokretu.

Zbog toga:

Weekly Shift Board mora raditi na telefonu
Sve ključne akcije moraju biti dostupne sa mobilnog uređaja
Kritične funkcije ne smeju biti sakrivene samo na desktop-u
Employee App

Employee App je mobile-only iskustvo.

Pravila:

Large tap targets
Thumb-friendly navigacija
Minimal form friction
Fast loading
No hover dependency
Jednoručno korišćenje gde god je moguće
11. Design sistem
Vizuelni pravac

Inspiracija:

Linear
Stripe
Modern SaaS dashboards
Admin Platform

UI mora biti:

premium
minimalan
čist
brz
moderan
Employee App

UI mora biti:

jednostavan
jasan
pregledan
brz
lako razumljiv

Employee ne sme da uči sistem.

Sistem mora biti intuitivan odmah nakon prvog logovanja.

Frontend stack
Admin Platform
Layer	Tehnologija	Napomena
Frontend	Next.js App Router	Core framework
Styling	Tailwind CSS	Mobile-first UI
UI Components	shadcn/ui	Reusable UI
State	Zustand	UI state only
Server State	TanStack Query	Cache i queries
Forms	React Hook Form + Zod	Forms i validation
Drag & Drop	dnd-kit	Shift Board
Animation	Framer Motion	Minimal animations
Employee App
Layer	Tehnologija	Napomena
Mobile App	FlutterFlow	Employee experience
Backend stack
Layer	Tehnologija	Napomena
Backend	Supabase	Backend platform
Database	PostgreSQL	Managed DB
Auth	Supabase Auth	Authentication
Security	Supabase RLS	Organization isolation
Storage	Supabase Storage	Files i avatars
Hosting	Vercel	Production hosting
12. Performance
Prioriteti

Najvažnije:

Mobile performance
Shift Board fluidnost
Fast loading
Minimal rerenders
Employee App responsiveness
Required optimizations
Lazy loading
Skeleton loaders
Optimistic updates
Code splitting
Responsive optimization
Admin Platform prioritet

Najvažnije:

Weekly Shift Board mora delovati trenutno
Employee App prioritet

Najvažnije:

raspored mora biti odmah dostupan
attendance mora biti brz
request workflow mora biti jednostavan
13. Šta NIJE deo MVP-a

Platforma NE uključuje:

Payroll
Salary calculations
AI assistant
Voice AI
Chat systems
GPS tracking
Geofencing
Complex analytics
Enterprise permissions
Multi-location management
Multi-organization support
Advanced reporting
Realtime collaboration
Live activity feeds
WebSocket systems
AI scheduling
Realtime odluka
Zaključana MVP odluka

Realtime nije deo MVP-a.

Platforma mora ostati jednostavna.

Dozvoljeno
Refresh pri otvaranju aplikacije
Refresh pri povratku aplikacije iz background-a
Pull-to-refresh
Standard query refresh
Nije dozvoljeno
Live collaboration
Realtime sync layer
Live activity feed
Google Docs stil sinhronizacije
WebSocket kompleksnost
Zašto

Korisnicima je važnije:

da dobiju notifikaciju
da vide ažurne podatke kada otvore aplikaciju

nego da sistem bude realtime.

14. Product filozofija

SeasonStaff NIJE workforce enterprise suite.

SeasonStaff JE:

"Ultra simple mobile-first shift organization system za sezonske biznise, koji omogućava menadžerima da organizuju smene i zaposlenima da kroz namensku mobilnu aplikaciju uvek znaju kada rade, koliko su radili i šta se od njih očekuje."

Sve product i development odluke moraju služiti toj rečenici.

MVP success kriterijum

MVP je uspešan ako:

vlasnik restorana, beach bara ili sezonskog biznisa može:

Organizovati zaposlene
Napraviti raspored
Upravljati smenama
Odobravati zahteve
Upravljati attendance logovima

za nekoliko minuta preko telefona bez frustracije.

Employee success kriterijum

Employee App je uspešna ako zaposleni može:

Videti kada radi
Videti sledeću smenu
Videti koliko je radio
Poslati swap request
Poslati time off request
Uraditi check-in
Uraditi check-out

bez poziva, poruka i dodatne komunikacije sa menadžerom.

Sljedeći koraci
#	Tema	Status
1	Admin Platform UI	U toku
2	Employee App UI	U toku
3	Shift Board implementation	Prioritet
4	Supabase schema	Definisano
5	Mobile optimization	Planned
6	Production deployment	Planned
Final napomena

Najveći rizik projekta nije tehnologija.

Najveći rizik je:

scope creep
overengineering
komplikovanje UX-a
dodavanje nepotrebnih feature-a
mešanje admin i employee iskustava

Platforma mora ostati:

ultra jednostavna
brza
mobile-first
praktična
laka za korišćenje
fokusirana na operativnu brzinu

Admin Platform mora biti alat za organizaciju.

Employee App mora biti alat za informisanje i jednostavnu komunikaciju.

Oba sistema moraju ostati jednostavna i povezana kroz jedan zajednički backend.