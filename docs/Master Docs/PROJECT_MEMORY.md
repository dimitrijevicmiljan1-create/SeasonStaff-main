SeasonStaff
PROJECT MEMORY

THIS DOCUMENT IS THE SINGLE SOURCE OF TRUTH FOR:

Critical reminders
Architecture locks
Important project decisions
Important Reminder

Weekly Shift Board je najvažniji deo sistema.

Product Architecture Lock

SeasonStaff se sastoji od dva korisnička kanala:

Admin Platform

Koriste:

Owner
Manager

Platforme:

Web
Mobile Web
Employee App

Koristi:

Employee

Platforma:

FlutterFlow Mobile App

Employee App NIJE poseban sistem.

Employee App koristi isti backend kao Admin Platform.

Mobile-First Lock

Mobile UX ima prioritet nad desktop UX.

Employee Experience Lock

Employee Portal više ne postoji.

Employee koristi isključivo Employee App.

Employee App je deo MVP-a od prvog dana.

Request System Lock

Koristiti jedinstveni request sistem.

Podržani tipovi:

Shift Swap Request
Time Off Request

Ne uvoditi zasebne request sisteme.

Realtime Lock

Realtime NIJE deo MVP-a.

Dozvoljeno:

refresh on open
refresh on focus
pull-to-refresh

Ne koristiti:

WebSocket architecture
realtime collaboration
live activity feeds
realtime sync layer
Backend Lock

Jedan backend za oba klijenta.

Ne praviti:

poseban employee backend
poseban mobile backend

Koristiti:

jedan Supabase projekat
jednu bazu
jedan auth sistem
jedan RLS sistem
Worked Hours Lock

Employee vidi:

ukupne sate za tekući mesec
istoriju odrađenih sati

Ne graditi:

payroll
salary calculations
overtime engine
Anti-Overengineering

NE uvoditi:

enterprise patterns
unnecessary abstractions
feature creep
MVP Philosophy

Simple > clever

Working > scalable

Fast UX > feature count

Mobile UX > desktop UX

Operational speed > feature quantity