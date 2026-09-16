SeasonStaff
BACKEND MASTER — v3

THIS DOCUMENT IS THE SINGLE SOURCE OF TRUTH FOR:

Database architecture
Supabase architecture
Auth flow
RLS rules
Query structure
Mutation structure
Payload contracts
Backend/frontend data contracts
Performance strategy
Realtime strategy
Validation rules
Backend implementation rules
1. BACKEND CONTEXT

Backend mora biti optimizovan za:

mobile-first UX
ultra brz Shift Board
minimal friction interactions
optimistic updates
lightweight payloads

Backend mora podržavati dva korisnička kanala:

Admin Platform
Employee App
Admin Platform

Koriste:

owner
manager

Služi za:

employee management
shift management
request approvals
attendance review
settings
Employee App

Koriste:

employee

Služi za:

schedule viewing
attendance
worked hours
requests
notifications
Važan princip

Employee App NIJE poseban sistem.

Employee App koristi:

isti Supabase projekat
iste tabele
isti auth sistem
isti RLS sistem
ista poslovna pravila

Backend NIJE:

enterprise microservice architecture
CQRS system
event-driven architecture
analytics-heavy platform

Backend JESTE:

lightweight operational backend
Supabase-first architecture
UX-optimized data layer
fast mutation system
2. OFFICIAL BACKEND STACK
Layer	Technology
Backend	Supabase
Database	PostgreSQL
Auth	Supabase Auth
Security	Supabase RLS
Storage	Supabase Storage
Hosting	Vercel
FORBIDDEN

NE koristiti:

Prisma
NestJS
Express backend
Redis
microservices
CQRS
repository pattern overengineering
complex service abstractions
unnecessary Edge Functions
3. DATABASE PHILOSOPHY

Database mora biti:

jednostavna
predvidiva
relational-first
optimized za UX
optimized za mobile payloads
CORE PRINCIPLES
Simple queries
Lightweight payloads
Minimal nesting
Fast updates
Optimistic-update-friendly responses
No enterprise abstractions
4. ORGANIZATION MODEL
CRITICAL RULE

1 owner = 1 organization

Employee pripada SAMO jednoj organizaciji.

Manager pripada SAMO jednoj organizaciji.

Multi-organization support NIJE deo MVP-a.

Organization Isolation

SVAKI query mora biti organization-scoped.

Nijedan user NE SME videti:

druge organizacije
tuđe zaposlene
tuđe smene
tuđe requestove
5. ROLE SYSTEM
Roles
Role	Purpose
owner	Full organization access
manager	Operational management
employee	Own data only
Employee permissions

Employee može:

videti svoje smene
videti svoje attendance logove
videti svoje worked hours
videti svoje requestove
videti svoje notifications

Employee NE može:

menjati raspored direktno
upravljati zaposlenima
pristupati settings sekciji
videti podatke drugih zaposlenih
6. AUTH FLOW
Owner Signup
User signup
Create organization
Create profile
Assign owner role
Redirect dashboard
Employee Invite Flow
Owner/manager kreira employee
Invite email sent
Employee preuzima Employee App
Employee postavlja password
Profile linked
Login enabled
Protected Access
Admin Platform
dashboard
employees
shifts
requests
settings
Employee App
home
schedule
requests
attendance
worked_hours
profile
7. CORE TABLES
organizations

Purpose:

Business entity.

Required Fields
Field	Type
id	uuid
business_name	text
phone	text
email	text
address	text
created_at	timestamptz
profiles

Purpose:

Auth-linked user profile.

Required Fields
Field	Type
id	uuid
organization_id	uuid
role	app_role
first_name	text
last_name	text
phone	text
created_at	timestamptz
positions

Purpose:

Custom business positions.

Required Fields
Field	Type
id	uuid
organization_id	uuid
name	text
created_at	timestamptz
employees

Purpose:

Operational employee records.

Required Fields
Field	Type
id	uuid
organization_id	uuid
profile_id	uuid nullable
first_name	text
last_name	text
email	text
phone	text
position_id	uuid
status	employee_status
notes	text nullable
created_at	timestamptz
shifts
NAJVAŽNIJA TABELA SISTEMA

Purpose:

Weekly Shift Board.

Required Fields
Field	Type
id	uuid
organization_id	uuid
employee_id	uuid
shift_date	date
start_time	time
end_time	time
position_id	uuid nullable
status	shift_status
notes	text nullable
created_at	timestamptz
requests

Purpose:

Jedinstveni sistem employee zahteva.

Podržava:

shift swap requests
time off requests
Required Fields
Field	Type
id	uuid
organization_id	uuid
employee_id	uuid
type	request_type
status	request_status
metadata	jsonb
created_at	timestamptz
attendance_logs

Purpose:

Attendance tracking.

Required Fields
Field	Type
id	uuid
organization_id	uuid
employee_id	uuid
type	attendance_type
timestamp	timestamptz
notes	text nullable
notifications

Purpose:

In-app notifications.

Required Fields
Field	Type
id	uuid
organization_id	uuid
profile_id	uuid
type	text
title	text
message	text
read	boolean
created_at	timestamptz

8. ENUMS
app_role
owner
manager
employee
employee_status
active
inactive
suspended
shift_status
scheduled
completed
cancelled
request_status
pending
approved
rejected
request_type
swap
time_off
attendance_type
check_in
check_out
9. RLS STRATEGY
CRITICAL

RLS je OBAVEZAN na svim tabelama.

Organization Isolation

Svaki query mora:

proveravati organization_id
vraćati samo organization-scoped data
Employee Restrictions

Employee vidi SAMO:

own shifts
own attendance
own worked hours
own notifications
own requests

Employee NE SME videti:

druge zaposlene
druge rasporede
druge attendance logove
druge zahteve
Manager Permissions

Manager vidi:

zaposlene svoje organizacije
smene svoje organizacije
attendance svoje organizacije
requestove svoje organizacije
Owner Permissions

Owner ima full organization access.

Requests RLS

Employee može:

kreirati svoj request
videti svoje requestove

Employee NE može:

approve request
reject request
menjati tuđe requestove
Notifications RLS

Svaki korisnik vidi samo svoje notifikacije.

10. QUERY STRATEGY
KRITIČNO ZA FRONTEND

Queries moraju biti:

lightweight
predvidive
mobile-friendly
fast
Dashboard Queries

Frontend očekuje:

today's shifts
active employees count
pending requests count
checked-in employees count
Dashboard Payload Rules

Payload MUST biti:

mali
aggregate-focused
lightweight

NE vraćati:

huge nested objects
unnecessary joins
Employee Page Queries

Frontend očekuje:

employee list
employee filters
positions
Employee Payload Rules

Employee payload MUST sadržati:

id
first_name
last_name
phone
status
position_name

NE vraćati:

unnecessary nested data
Employee Overview Query

Frontend očekuje:

upcoming shifts
worked hours summary
attendance history
request history
Employee Overview Payload

MUST sadržati:

employee info
next shifts
monthly worked hours
recent attendance
recent requests

Payload mora ostati lightweight.

Shift Board Queries
NAJVAŽNIJI QUERY FLOW

Frontend očekuje:

weekly shifts
employee list
positions
Shift Board Payload Rules

Payload MUST biti:

ultra lightweight
optimized za rerender speed
optimized za optimistic updates
Shift Payload MUST contain
id
employee_id
shift_date
start_time
end_time
position_id
status
NE vraćati
large nested employee objects
heavy relational payloads
unnecessary metadata
Requests Queries

Frontend očekuje:

pending requests
approved requests
rejected requests
employee info
request details
Request Payload Rules

MUST sadržati:

id
type
status
employee_id
metadata
created_at
Employee App Queries
Home Screen

Frontend očekuje:

next shift
latest notifications
Schedule

Frontend očekuje:

weekly schedule
upcoming shifts
Requests

Frontend očekuje:

request history
request statuses
Attendance

Frontend očekuje:

current attendance status
latest attendance action
Worked Hours

Frontend očekuje:

monthly total hours
worked hours history
Worked Hours Aggregation

Worked hours se računaju iz:

attendance_logs
shifts

Ne uvoditi payroll sistem.

Ne uvoditi salary calculations.

Worked Hours Payload

MUST sadržati:

current_month_hours
worked_days
worked_shift_count
Notification Queries

Frontend očekuje:

latest notifications
unread count

Payload mora biti minimalan.

Notification Types
shift_assigned
shift_updated
shift_cancelled
swap_request_approved
swap_request_rejected
time_off_approved
time_off_rejected
attendance_reminder
Query Philosophy

Backend mora vraćati:

najmanji mogući payload
najbrži mogući odgovor

Frontend ne sme da filtrira ogromne skupove podataka koje backend može filtrirati unapred.

11. MUTATION STRATEGY
KRITIČNO ZA UX

Mutations moraju podržavati:

optimistic updates
instant feeling
minimal latency
Shift Board Mutations
Required Mutations
create_shift
update_shift
move_shift
delete_shift
copy_previous_week
Mutation Rules

Mutations MUST:

vraćati lightweight payload
biti fast
podržavati rollback behavior
Employee Mutations
create_employee
update_employee
change_employee_status
invite_employee
Request Mutations
Admin Platform
approve_request
reject_request
Employee App
create_swap_request
create_time_off_request
Attendance Mutations
check_in
check_out
Notification Mutations
mark_notification_read
mark_all_notifications_read
Mutation Response Rules

Response mora sadržati samo:

podatke potrebne za UI update

NE vraćati:

velike relacione objekte
nepotrebne agregacije
nepotrebne join rezultate
Optimistic Update Compatibility

Backend mora omogućiti:

instant frontend update
rollback u slučaju greške
predvidive response strukture
12. REALTIME STRATEGY
ZAKLJUČANA MVP ODLUKA

Realtime NIJE deo MVP-a.

Dozvoljeno
Refresh on app open
Refresh on screen focus
Pull-to-refresh
Standard query refresh
Notification polling ako bude potrebno
Nije dozvoljeno
WebSocket architecture
Realtime collaboration
Live synchronization layer
Live activity feed
Google Docs style sync
Realtime Shift Board
Razlog

Korisnicima je važnije:

da vide ažurne podatke kada otvore aplikaciju
da dobiju notifikaciju

nego da sistem bude realtime.

Backend Pravilo

Ne uvoditi realtime kompleksnost bez validacije od stvarnih korisnika.

13. PERFORMANCE STRATEGY
KRITIČNO

Shift Board performance definiše kvalitet proizvoda.

Required Indexes

OBAVEZNO:

organization_id
employee_id
shift_date
status
Additional Indexes

OBAVEZNO:

request status
request type
attendance timestamp
notification profile_id
Query Rules
Avoid heavy joins
Avoid overfetching
Keep payloads minimal
Use filtering aggressively
Shift Board Prioritet

Najveći prioritet backend-a.

Sve vezano za:

weekly shifts
employee assignments
drag & drop

mora biti optimizovano.

Employee App Prioritet

Backend mora brzo podržati:

schedule retrieval
worked hours retrieval
attendance actions
request creation
Worked Hours Strategy

Worked hours moraju biti:

brzi za učitavanje
laki za računanje
optimizovani za mobilni prikaz

Ne graditi payroll logiku.

Ne graditi salary logiku.

Mobile Performance Rules

Backend mora:

minimizovati payload size
minimizovati latency
podržavati instant feeling UX
14. STORAGE STRATEGY

Supabase Storage koristiti SAMO za:

avatars optional
lightweight assets
Dozvoljeno
employee avatar
organization avatar/logo
Ne koristiti za
heavy media systems
document management
file sharing systems
Storage Philosophy

Storage mora ostati jednostavan.

15. ERROR STRATEGY
KRITIČNO ZA FRONTEND UX

Backend errors moraju biti:

predvidivi
konzistentni
lightweight
Mutation Errors

Frontend očekuje:

clean validation messages
rollback support
optimistic update compatibility
Validation Rules

Validation mora postojati:

database level
API level
frontend level
Error Format

Sve greške moraju koristiti konzistentnu strukturu.

Frontend ne sme da pogađa format greške.

User-Friendly Errors

Prikazivati:

jasne poruke
razumljive poruke

Ne prikazivati:

database stack traces
SQL greške
tehničke detalje korisniku
16. FRONTEND/BACKEND CONTRACT RULES
KRITIČNO

Frontend i backend MORAJU koristiti:

identične field names
identične enums
identične payload strukture
Naming Convention

Koristiti snake_case everywhere.

ISPRAVNO:

employee_id
organization_id
shift_date

POGREŠNO:

employeeId
organizationId
shiftDate
Admin Platform Contracts

Backend mora podržati:

Dashboard payload
Employee payload
Shift Board payload
Request payload
Notification payload
Employee App Contracts

Backend mora podržati:

Home
next_shift
notifications
Schedule
weekly_schedule
upcoming_shifts
Requests
request_history
request_status
Attendance
attendance_status
attendance_history
Worked Hours
monthly_hours
worked_hours_history
Contract Philosophy

Payload mora biti:

stabilan
predvidiv
minimalan
17. EDGE FUNCTIONS STRATEGY
IMPORTANT

NE koristiti Edge Functions osim ako su stvarno potrebne.

DOZVOLJENO
invite email workflow
password setup workflow
scheduled reminders
notification dispatch workflow
NE koristiti
business logic explosion
unnecessary orchestration
backend complexity
Edge Function Philosophy

Poslovna logika treba ostati što bliže bazi i aplikaciji.

18. BACKEND DEVELOPMENT RULES
Backend služi UX-u
Simple > clever
Fast > theoretically scalable
Lightweight > overabstracted
Mobile-first performance always
Additional Rules
Jedan backend za oba klijenta
Employee App ne dobija poseban backend
Employee App koristi iste RLS politike
Employee App koristi iste tabele
19. ŠTA NE GRADITI

NE graditi:

payroll systems
AI scheduling
enterprise permissions
advanced analytics
complex reporting
realtime collaboration
chat systems
multi-organization architecture
websocket infrastructure
live activity feeds
employee-specific backend

Ako nešto deluje enterprise-level:

verovatno NE pripada MVP-u.

20. FINAL BACKEND PHILOSOPHY

Backend mora biti:

ultra jednostavan
brz
predvidiv
UX-optimized
mobile-first
maintainable
Backend Architecture Lock

SeasonStaff koristi:

jedan Supabase projekat
jednu bazu
jedan auth sistem
jedan RLS sistem

za:

Admin Platform
Owner
Manager

i

Employee App
Employee
Cilj backend-a NIJE

"savršena enterprise arhitektura"

Cilj backend-a JE

"podržati ultra brz i fluidan mobile-first operational UX za menadžere i jednostavno mobilno iskustvo za zaposlene."

Final Reminder

Najveći backend rizici:

Scope creep
Overengineering
Realtime complexity
Heavy payloads
Architecture drift

Backend mora ostati:

jednostavan
brz
fokusiran na UX
fokusiran na Shift Board
fokusiran na Employee App iskustvo
optimizovan za MVP isporuku.