SeasonStaff
FRONTEND MASTER — v3

THIS DOCUMENT IS THE SINGLE SOURCE OF TRUTH FOR:

Frontend architecture
UI/UX behavior
Application structure
Route structure
Layout system
Navigation system
Responsive behavior
Component behavior
Empty states
Loading states
Shift Board interactions
Frontend implementation rules
Frontend/backend UX contracts
1. PRODUCT CONTEXT

SeasonStaff je mobile-first SaaS platforma za organizaciju smena u sezonskim biznisima.

Primarni korisnici:

restorani
beach barovi
seasonal hospitality teams
fast-paced operational businesses

Platforma NIJE:

enterprise HR suite
payroll sistem
analytics-heavy platforma
complex workforce management tool

Platforma JESTE:

ultra brz shift organization sistem
mobile-first operational tool
minimalistički SaaS proizvod
Arhitektura proizvoda

SeasonStaff se sastoji od dva korisnička kanala.

Admin Platform

Koriste:

Owner
Manager

Dostupno preko:

Web
Mobile Web

Služi za:

Employee Management
Weekly Shift Board
Requests
Attendance pregled
Settings
Employee App

Koriste:

Employee

Dostupno preko:

FlutterFlow mobilne aplikacije

Služi za:

pregled rasporeda
pregled smena
attendance
worked hours
requests
notifikacije
Važan princip

Employee App NIJE poseban sistem.

Employee App koristi isti backend kao Admin Platform.

CORE UX GOAL

Vlasnik restorana mora moći:

organizovati zaposlene
napraviti raspored
poslati smene
rešiti requestove

za nekoliko minuta preko telefona.

Employee UX Goal

Zaposleni mora moći:

videti kada radi
videti sledeću smenu
poslati zahtev
uraditi check-in
uraditi check-out
videti koliko je radio

bez dodatne komunikacije sa menadžerom.

2. FRONTEND PHILOSOPHY

Frontend development mora biti:

mobile-first
ultra praktičan
brz
minimalistički
fluidan
bez komplikacija
PRIORITETI
Prioritet	Važnost
Mobile UX	Kritično
Shift Board fluidnost	Kritično
Fast interactions	Kritično
Minimal friction	Veoma visoko
Visual cleanliness	Visoko
Fancy architecture	Nebitno
Admin Platform prioritet

Najvažnije:

brz raspored
brzo upravljanje zaposlenima
brzo rešavanje zahteva
Employee App prioritet

Najvažnije:

pregled smena
pregled sati
attendance
requests
3. OFFICIAL FRONTEND STACK
Admin Platform
Layer	Technology
Framework	Next.js App Router
Language	TypeScript
Styling	Tailwind CSS
UI	shadcn/ui
State	Zustand
Server State	TanStack Query
Forms	React Hook Form + Zod
Drag & Drop	dnd-kit
Animation	Framer Motion
Icons	Lucide React
Employee App
Layer	Technology
Mobile App	FlutterFlow
FORBIDDEN

NE koristiti:

Redux
Bootstrap
Material UI
Chakra UI
MobX
CSS Modules
Styled Components
complex state machines
enterprise frontend architecture
overengineered abstractions
4. PROJECT STRUCTURE

/app
/components
/features
/hooks
/lib
/providers
/services
/store
/styles
/types

FEATURE STRUCTURE

Svaki feature mora imati:

/features/[feature]

/components
/hooks
/services
/types
/schemas

5. ROUTE STRUCTURE
Public routes

/login

/forgot-password

/reset-password

Owner/Manager routes

/dashboard

/employees

/shifts

/requests

/settings

Employee routes

Employee NE koristi Next.js rute.

Employee koristi zasebnu mobilnu aplikaciju.

Navigacija Employee App definiše se unutar FlutterFlow aplikacije.

6. GLOBAL LAYOUT SYSTEM
Admin Platform Desktop Layout

Desktop koristi:

fixed left sidebar
top header
scrollable content area
Desktop structure
Section	Purpose
Sidebar	Main navigation
Header	Context + actions
Content	Main page content
Admin Platform Mobile Layout

Mobile koristi:

sticky bottom navigation
mobile top header
stacked content sections

Desktop sidebar NE postoji na telefonu.

Employee App Layout

Employee App koristi:

mobile header
bottom navigation
stacked mobile sections

Aplikacija se dizajnira isključivo za mobilno iskustvo.

7. SIDEBAR SYSTEM
Owner/Manager Sidebar

Sidebar MUST contain:

Dashboard
Employees
Shift Board
Requests
Settings
Sidebar rules

Desktop:

fixed position
visible always
clean icons
minimal visual noise

Mobile:

NO left sidebar
bottom navigation ONLY
Employee App

Employee App NEMA sidebar.

Navigacija se vrši isključivo kroz bottom navigation.

Cilj:

jednostavnost
brzo snalaženje
one-hand usability
8. TOP HEADER
Admin Platform Header

Header MUST contain:

Current page title
Notification bell
User avatar
Mobile menu trigger
Header behavior

Desktop:

sticky optional
clean layout

Mobile:

compact height
thumb accessible actions
Employee App Header

Employee App koristi pojednostavljen header.

MUST contain:

Screen title
Notification access
User profile access

Employee App ne sme imati kompleksne akcije u header-u.

9. MOBILE NAVIGATION
KRITIČNO

SeasonStaff je mobile-first proizvod.

Admin Platform Mobile Navigation
Tab	Purpose
Home	Dashboard
Shifts	Shift Board
Employees	Employee list
Requests	Requests
Settings	Settings
Mobile Navigation Rules
Large tap targets
Sticky navigation
Thumb-friendly spacing
Clear active state
No tiny icons
Employee App Navigation
Bottom Navigation Structure
Tab	Purpose
Home	Pregled naredne smene
Schedule	Raspored
Requests	Zahtevi
Attendance	Check-in / Check-out
Profile	Profil i sati
Employee Navigation Rules
Maksimalno 5 tabova
Nema skrivenih funkcija
Sve ključne akcije dostupne u 1-2 dodira
One-hand usability
Minimal cognitive load
10. LOGIN PAGE
Purpose

Premium ali jednostavan auth experience.

Login Page MUST contain
Logo
Welcome title
Email input
Password input
Login button
Forgot password link
Visual Direction

Login screen mora delovati:

premium
minimalistički
clean
modern

NE koristiti:

old admin dashboard aesthetics
enterprise login styling
Mobile Rules
Full-width inputs
Comfortable spacing
No overflow
Easy thumb usage
Employee App Login

Employee koristi poseban login ekran unutar Employee App.

Mora biti:

jednostavan
brz
bez nepotrebnih koraka
Employee Onboarding Flow
Employee prima pozivnicu
Otvara Employee App
Postavlja password
Prijavljuje se
Dolazi na Home Screen
11. DASHBOARD PAGE
Purpose

Brz pregled dnevnih operacija.

Dashboard NE SME postati analytics page.

Dashboard Structure
Section 1 — Quick Stats

Cards:

Today's shifts
Active employees
Pending requests
Checked-in employees
Section 2 — Quick Actions

Buttons:

Add Employee
Create Shift
Copy Previous Week
View Requests
Section 3 — Today's Schedule

Prikazuje:

today's shifts
assigned employees
shift times
Section 4 — Pending Requests

Compact request cards.

Prikazuje:

swap requests
time off requests
Dashboard Mobile Rules
Cards stacked vertically
No dense tables
Minimal scrolling
Quick actions thumb accessible
Dashboard Philosophy

Dashboard služi za:

brz pregled
brze akcije

Dashboard NE služi za:

detaljnu analitiku
reporting
enterprise KPI-jeve
12. EMPLOYEE MANAGEMENT PAGE
Purpose

Brzo upravljanje zaposlenima.

Desktop Layout

Desktop koristi:

searchable table
filters
action buttons
Mobile Layout

Mobile koristi:

employee cards
stacked information
large action buttons
Employee Card MUST contain
Employee name
Position
Status badge
Phone
Quick actions
Employee Actions

Manager može:

Edit employee
Change status
Assign position
View shifts
View employee overview
Employee Overview

Pregled zaposlenog mora prikazivati:

Predstojeće smene
Ukupne odrađene sate
Attendance istoriju
Request istoriju
Add Employee Modal

MUST contain:

First name
Last name
Phone
Email
Position
Status
Employee Invite Flow

Nakon kreiranja zaposlenog:

Sistem šalje pozivnicu
Employee instalira aplikaciju
Employee aktivira nalog
Employee dobija pristup rasporedu
Employee Page UX Rules
Fast search
Instant filtering
Smooth modal interactions
Optimistic updates
No page reload feeling

13. WEEKLY SHIFT BOARD
NAJVAŽNIJI EKRAN SISTEMA

Najviše frontend energije mora biti investirano ovde.

Ako Shift Board nije odličan:

MVP nema tržišnu vrednost.

Shift Board Layout
Desktop
Axis	Content
Rows	Employees
Columns	Week days
Cells	Shift assignments
Shift Board MUST contain
Weekly navigation
Employee rows
Day columns
Shift cards
Drag & drop
Copy previous week
Inline editing
Fast interactions
Weekly Navigation

Controls:

Previous week
Current week
Next week
Current week label
Shift Card Structure

MUST contain:

Employee name
Start time
End time
Position optional
Status indicator
Drag & Drop

Koristiti:

dnd-kit ONLY

Requirements:

Smooth interactions
No lag
Instant feeling
Touch-friendly
Optimistic updates
Shift Creation Flow
Click empty cell
Open shift modal
Select employee
Select time
Save shift
Optimistic update
Copy Previous Week Flow
Click button
Confirmation modal
Copy shifts
Instant refresh
Mobile Shift Board
KRITIČNO

Mobile UX definiše kvalitet proizvoda.

Mobile Behavior
Horizontal week scrolling
Sticky employee column
Swipe-friendly interactions
Large touch targets
Minimal accidental drags
Shift Board Performance Rules

MORA:

Delovati instant
Imati minimal rerenders
Koristiti lightweight components
Imati smooth scrolling
14. REQUESTS PAGE
Purpose

Jedinstveno mesto za upravljanje svim employee zahtevima.

Request Types

Sistem podržava:

Shift Swap Request
Time Off Request
Request List

Request lista mora prikazivati:

Employee info
Request type
Request details
Current status
Created date
Request Card MUST contain
Employee name
Request type badge
Request summary
Request status
Approve action
Reject action
Request Statuses
Status	Visual
Pending	Yellow
Approved	Green
Rejected	Red
Manager Workflow
Employee šalje zahtev
Request ulazi u pending listu
Manager pregledava zahtev
Manager approve/reject
Employee dobija notifikaciju
Time Off Request Card

Prikazuje:

Employee
Requested date
Optional note
Status
Swap Request Card

Prikazuje:

Employee
Original shift
Requested swap
Status
Mobile Rules
Large action buttons
Stacked cards
Thumb-friendly layout
Quick approve/reject workflow
15. EMPLOYEE APP
Purpose

Employee App predstavlja kompletno employee iskustvo.

Employee Portal više ne postoji.

Sve employee funkcionalnosti nalaze se u mobilnoj aplikaciji.

Employee App Structure
Home

Prikazuje:

Sledeću smenu
Današnji status
Važne notifikacije
Schedule

Prikazuje:

Weekly schedule
Predstojeće smene
Detalje smene
Requests

Omogućava:

Slanje swap request-a
Slanje time off request-a
Pregled istorije zahteva
Pregled statusa zahteva
Attendance

Prikazuje:

Trenutni status
Check-in dugme
Check-out dugme
Poslednju aktivnost
Worked Hours

Prikazuje:

Ukupne sate za tekući mesec
Istoriju odrađenih sati
Attendance pregled
Profile

Prikazuje:

Osnovne informacije
Poziciju
Kontakt podatke
Logout
Employee App Rules
Employee vidi samo svoje podatke
Nema pristup drugim zaposlenima
Nema pristup rasporedu drugih zaposlenih
Nema kompleksnih workflow-a
Sve ključne akcije moraju biti dostupne u nekoliko dodira
Employee UX Principles

Aplikacija mora biti:

jednostavna
jasna
brza
intuitivna

Employee ne sme imati potrebu za dodatnim objašnjenjem kako koristi aplikaciju.

16. ATTENDANCE SYSTEM
Purpose

Minimal attendance tracking.

Attendance Flow
Employee otvara aplikaciju
Klik na check-in
Timestamp se snima
Klik na check-out
Timestamp se snima
Attendance UI MUST contain
Current status
Last action timestamp
Check-in button
Check-out button
Attendance Rules

NE uključivati:

GPS
QR scanning
Geofencing
Live presence tracking
Mobile Attendance Rules
Jedan klik za check-in
Jedan klik za check-out
Jasna potvrda uspešne akcije
Minimalan broj koraka
17. SETTINGS PAGE
Purpose

Minimal business configuration.

Settings Sections
Business Info

Fields:

Business name
Phone
Email
Address
Positions

Manager može:

Add position
Edit position
Delete unused position
Shift Defaults

Manager može definisati:

Default start time
Default end time
Default positions
Settings Rules

Settings NE SME postati enterprise admin panel.

18. NOTIFICATION SYSTEM
In-app Notifications

Notification bell u header-u.

Notification Dropdown

Prikazuje:

Recent notifications
Unread count
Notification type
Timestamp
Notification Types
New shift
Shift updated
Shift cancelled
Swap request approved
Swap request rejected
Time off approved
Time off rejected
Attendance reminder
Notification Rules
Važne informacije moraju biti odmah vidljive
Ne koristiti agresivne popup-ove
Fokus na operativno važne događaje
Minimal noise

19. EMPTY STATES
KRITIČNO

Sve stranice MORAJU imati empty states.

Empty State Examples
No employees

"No employees yet"

CTA:

"Add Employee"

No shifts

"No shifts scheduled"

CTA:

"Create Shift"

No requests

"No pending requests"

No notifications

"No notifications"

No worked hours

"No worked hours recorded yet"

Empty State Rules
Friendly tone
Clear CTA
Minimal clutter
Helpful guidance
Nikada ne prikazivati prazan ekran
20. LOADING STATES
OBAVEZNO

Svaka stranica mora imati:

Skeleton loaders
Loading indicators
Smooth transitions
No layout shifts
Loading Philosophy

UI mora delovati:

brzo
responsive
stabilno
Admin Platform Loading Rules
Dashboard skeletons
Employee list skeletons
Shift Board skeletons
Request list skeletons
Employee App Loading Rules
Schedule skeletons
Requests skeletons
Attendance loading states
Worked hours loading states
Zabranjeno
White screen loading
Layout jumping
Spinner-only experience
21. RESPONSIVE RULES
Mobile first always

Prioritet:

iPhone
Android
Tablet
Desktop
Responsive Rules
No broken layouts
No hidden critical actions
No tiny buttons
No unusable tables
One-hand usability where possible
Admin Platform Rules

Desktop i mobile web moraju podržavati:

Dashboard
Employees
Shift Board
Requests
Settings

bez funkcionalnih ograničenja.

Employee App Rules

Employee App se dizajnira isključivo za mobilne uređaje.

Ne optimizovati za desktop.

Ne graditi tablet-specifične tokove bez potrebe.

22. STATE MANAGEMENT RULES
Zustand

Koristiti SAMO za:

UI state
Modal state
Navigation state
Temporary filters

NE koristiti Zustand za server data.

TanStack Query

Koristiti za:

Server queries
Cache
Mutations
Optimistic updates
Loading states
State Philosophy

Frontend mora imati:

minimal state complexity
predvidivo ponašanje
jednostavan debugging
23. DESIGN SYSTEM
Visual Direction

Inspiracija:

Linear
Stripe
Modern SaaS dashboards
Admin Platform UI mora biti
Premium
Minimalistički
Clean
Fast feeling
Modern
Employee App UI mora biti
Jednostavan
Jasan
Intuitivan
Fokusiran na akcije
Lako razumljiv
Design Rules
Soft shadows
Rounded corners
Consistent spacing
Minimal borders
Clear hierarchy
Typography Rules
Jasna hijerarhija
Dovoljno veliki fontovi
Dobra čitljivost na telefonu
24. PERFORMANCE RULES

Frontend mora biti:

Fluidan
Brz
Bez lag-a
Optimizovan za sporiji internet
OBAVEZNO
Lazy loading
Code splitting
Rerender optimization
Optimistic updates
Shift Board Performance
KRITIČNO

Weekly Shift Board mora:

Delovati trenutno
Imati minimal rerenders
Imati smooth scrolling
Imati lag-free drag & drop
Employee App Performance

Mora:

Brzo otvoriti raspored
Brzo otvoriti requests
Brzo prikazati sate
Brzo izvršiti attendance akcije
25. FRONTEND/BACKEND CONTRACT NOTES
KRITIČNO ZA BACKEND

Frontend UX DIREKTNO definiše backend arhitekturu.

Shift Board zahteva

Backend mora podržavati:

Fast queries
Lightweight payloads
Fast mutations
Minimal latency
Employee Management zahteva

Backend mora podržavati:

Fast search
Lightweight payloads
Filtering
Unified Request System zahteva

Backend mora podržavati:

Swap requests
Time off requests
Fast status updates
Notification triggers
Jednostavan approval flow
Employee App zahteva

Backend mora podržavati:

Schedule retrieval
Worked hours retrieval
Attendance actions
Request submission
Notification delivery
Employee Overview zahteva

Backend mora podržavati:

Upcoming shifts
Worked hours aggregation
Attendance history
Request history
26. ŠTA NE GRADITI

NE graditi:

Payroll UI
Complex analytics
AI assistants
Chat systems
Enterprise permissions
Realtime collaboration
Advanced reporting
Complex admin tools
GPS attendance
Geofencing
Live activity feeds
Employee desktop portal
Realtime pravilo

NE graditi:

WebSocket architecture
Realtime collaboration
Live synchronization layer
Live activity feed

Koristiti:

Refresh on app open
Refresh on screen focus
Pull-to-refresh
Standard query refresh

Ako feature deluje kompleksno:

verovatno NE pripada MVP-u.

27. FINAL PRODUCT PHILOSOPHY

SeasonStaff NIJE enterprise workforce platform.

SeasonStaff JE:

"Ultra simple mobile-first shift organization system za sezonske biznise koji omogućava menadžerima da brzo organizuju zaposlene, a zaposlenima da kroz namensku mobilnu aplikaciju uvek znaju kada rade, koliko su radili i šta se od njih očekuje."

Sve frontend odluke moraju služiti toj rečenici.

FINAL REMINDER

Najveći rizici projekta:

Scope creep
Overengineering
Inconsistent UX
Architecture drift
Nepotrebna kompleksnost
Mešanje admin i employee iskustava
Frontend mora ostati
brz
čist
minimalistički
ultra praktičan
mobile-first
Admin Platform mora ostati

alat za organizaciju.

Employee App mora ostati

alat za informisanje i jednostavnu komunikaciju.

Završni architecture lock

SeasonStaff frontend se sastoji od:

Admin Platform
Next.js
Web
Mobile Web
Owner
Manager

i

Employee App
FlutterFlow
Mobile Only
Employee

Oba sistema koriste isti backend i moraju ostati jednostavna, brza i fokusirana na operativnu efikasnost.