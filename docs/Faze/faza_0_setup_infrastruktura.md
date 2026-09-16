SeasonStaff
Faza 0 — Setup i infrastruktura

Temeljna infrastruktura projekta

Tech Stack
Sloj	Tehnologija	Status	Napomena
Admin Platform	Next.js App Router	Setup	Owner + Manager
Employee App	FlutterFlow	Setup	Employee mobile app
Styling	Tailwind CSS	Setup	Mobile-first UI
UI	shadcn/ui	Setup	Reusable UI sistem
Backend	Supabase	Setup	Shared backend
Database	PostgreSQL	Setup	Supabase managed
State	Zustand	Setup	UI state only
Server State	TanStack Query	Setup	Queries i cache
Forms	React Hook Form + Zod	Setup	Forms i validacija
Drag & Drop	dnd-kit	Setup	Shift Board
Hosting	Vercel	Later	Admin Platform deployment
Arhitektura sistema

SeasonStaff koristi dva frontend klijenta povezana na isti backend.

Admin Platform

Tehnologija:

Next.js

Koriste:

Owner
Manager

Dostupno preko:

Web
Mobile Web
Employee App

Tehnologija:

FlutterFlow

Koristi:

Employee

Dostupno preko:

iOS
Android
Shared Backend

Tehnologije:

Supabase
PostgreSQL
Auth
RLS

Employee App NIJE poseban sistem.

Koristi isti backend kao Admin Platform.

Setup koraci
Git i repository
Kreirati private GitHub repository
Branch strategy:
main
develop
feature/*
Dodati README.md
Dodati .gitignore
Next.js inicijalizacija
create-next-app
TypeScript strict mode
Tailwind setup
App Router only
ESLint konfiguracija
shadcn/ui setup
Init shadcn
Install base components
Setup theme variables
Setup dark mode support
FlutterFlow setup
Kreirati FlutterFlow projekat
Povezati Supabase
Konfigurisati Auth
Verifikovati konekciju sa bazom
Definisati osnovnu navigaciju
Potvrditi pristup istom Supabase projektu
Supabase setup
Kreirati Supabase projekt
Aktivirati Auth
Kreirati environment varijable
Spojiti Supabase MCP u Cursor
Potvrditi pristup iz Next.js aplikacije
Potvrditi pristup iz FlutterFlow aplikacije
Cursor setup
Kreirati .cursorrules
Definisati tech stack
Zabraniti overengineering
Definisati naming konvencije
Folder struktura

/app

/components

/features

/lib

/hooks

/store

/services

/providers

/types

/styles

Environment varijable
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
Faza 0 — Checklist
 GitHub repository kreiran
 Next.js setup završen
 Tailwind setup završen
 shadcn setup završen
 FlutterFlow projekat kreiran
 FlutterFlow povezan na Supabase
 Supabase setup završen
 Admin Platform povezana na Supabase
 Employee App povezana na Supabase
 Cursor MCP povezan
 Folder struktura zaključana
 .env.local konfiguriran