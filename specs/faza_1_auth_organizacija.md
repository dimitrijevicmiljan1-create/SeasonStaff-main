SeasonStaff
Faza 1 — Auth i organizacija

Registracija, autentifikacija i organizacijski sistem

Cilj faze

Implementirati kompletan auth i organization sistem koji predstavlja osnovu za:

Admin Platform
Employee App

i omogućava siguran pristup podacima kroz role-based pristup i RLS zaštitu.

Auth flow
Owner signup
Owner kreira account
Kreira business profile
Automatski postaje owner organizacije
Kreira organization zapis
Kreira profile zapis
Redirect na dashboard
Owner login
Email
Password
Validacija
Redirect na dashboard
Employee onboarding
Owner ili manager kreira zaposlenog
Sistem šalje invite email
Employee preuzima Employee App
Employee postavlja password
Kreira se auth veza sa profilom
Employee login
Redirect na Employee App Home
Employee login

Employee koristi login ekran unutar Employee App.

Nakon uspešne prijave:

pristup svom rasporedu
pristup attendance-u
pristup requestovima
pristup worked hours pregledu
Role sistem
Role	Može
Owner	Full access
Manager	Employees + Shifts + Requests
Employee	Own data only
Owner permissions

Owner može:

upravljati organizacijom
upravljati zaposlenima
upravljati smenama
upravljati requestovima
pregledati attendance
upravljati settings sekcijom
Manager permissions

Manager može:

upravljati zaposlenima
upravljati smenama
approve/reject requestove
pregledati attendance

Manager ne može:

menjati ownership
upravljati billing-om
Employee permissions

Employee može:

videti svoje smene
videti svoj raspored
koristiti attendance
slati requestove
videti svoje notifikacije
videti svoje worked hours

Employee ne može:

menjati raspored direktno
upravljati drugim zaposlenima
pristupati settings sekciji
Organization model
Critical Rule

1 owner = 1 organization

Employee pripada samo jednoj organizaciji.

Manager pripada samo jednoj organizaciji.

Multi-organization support NIJE deo MVP-a.

Password reset
Admin Platform
Supabase reset flow
Email link
Set new password
Redirect na login
Employee App
Forgot password
Email reset link
Set new password
Login u Employee App
Protected access
Public
login
forgot-password
reset-password
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
Auth tabele
organizations

Osnovni business entitet.

profiles

Auth povezani korisnički profil.

employees

Operativni zapis zaposlenog.

Employee može postojati:

pre aktivacije naloga
pre prihvatanja pozivnice
Invite sistem
Employee invite flow
Kreiranje zaposlenog
Generisanje pozivnice
Slanje email-a
Aktivacija naloga
Povezivanje auth user-a i employee zapisa
Supabase RLS
Organization isolation

Svaki user vidi samo svoju organizaciju.

Owner access

Owner ima puni pristup organizaciji.

Manager access

Manager ima pristup svim podacima svoje organizacije osim owner-only funkcija.

Employee access

Employee vidi samo:

svoje smene
svoje attendance logove
svoje requestove
svoje notifikacije
svoje worked hours podatke
Employee restrictions

Employee NE vidi:

druge zaposlene
druge smene
druge requestove
druge attendance logove
organization settings
Auth Architecture Lock

SeasonStaff koristi:

jedan Supabase Auth sistem
jedan user pool
jedan role sistem

za:

Admin Platform
Owner
Manager

i

Employee App
Employee

Ne graditi poseban auth sistem za Employee App.

Faza 1 — Checklist
 Owner signup flow radi
 Owner login radi
 Employee invite flow radi
 Employee onboarding radi
 Employee App login radi
 Password reset radi
 Role sistem radi
 Protected access radi
 Organization isolation radi
 RLS radi
 Employee restrictions rade
 Employee App pristup radi
 Profile linking radi
 Invite activation radi
 Auth architecture zaključana i testirana