# SeasonStaff — Employee App Developer Handoff

**Version:** 1.0  
**Date:** June 2026  
**Audience:** Flutter / FlutterFlow mobile developer  
**Stack:** Flutter + Supabase Flutter SDK

---

## Table of Contents

1. [Backend Overview](#1-backend-overview)
2. [Authentication](#2-authentication)
3. [Database Tables](#3-database-tables)
4. [RLS Policies](#4-rls-policies)
5. [API Endpoints](#5-api-endpoints)
6. [Data Models (Dart)](#6-data-models-dart)
7. [Employee App Screens](#7-employee-app-screens)
8. [Notifications](#8-notifications)
9. [Key Rules & Constraints](#9-key-rules--constraints)

---

## 1. Backend Overview

### Supabase Project

The Employee App uses the **exact same Supabase project** as the Admin Platform (web app). There is no separate backend. The same database, same auth system, and same RLS rules serve both clients.

| Setting | Value |
|---|---|
| **Project URL** | From `NEXT_PUBLIC_SUPABASE_URL` env var — get from project owner |
| **Anon Key** | From `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var — get from project owner |
| **Service Role Key** | Never use in Flutter. Server-only. |
| **Database** | PostgreSQL (managed by Supabase) |
| **Auth** | Supabase Auth (email/password) |
| **Security** | Row Level Security (RLS) on all tables |

### Flutter SDK Setup

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.x.x
```

```dart
// main.dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);

// Access client anywhere
final supabase = Supabase.instance.client;
```

### Important Principle

The Employee App is not a separate system. It is a different UI entry point into the same backend. All data access is controlled by RLS — the database enforces what employees can and cannot see.

---

## 2. Authentication

### Overview

Employees **never self-register**. An owner or manager creates the employee record and sends an invite email. After initial setup (done via web browser), the employee logs in to Flutter with email and password.

### Employee Invite & First Login Flow

```
1. Admin creates employee → invite email sent (via web platform)
2. Employee clicks link in email → opens web browser
3. Web platform (/auth/confirm) exchanges tokens → redirects to /setup
4. Employee completes profile setup on web (name, etc.)
5. Employee downloads the Flutter app
6. Employee logs in with email + password (same credentials set during setup)
```

**The Flutter app handles step 6 onward.** Steps 1–5 happen on the web platform and are already implemented. The Flutter app does not need to handle invite links or profile setup.

### Standard Login (Flutter)

```dart
final response = await supabase.auth.signInWithPassword(
  email: email,
  password: password,
);

if (response.session != null) {
  // Login successful — navigate to Home screen
} else {
  // Show error
}
```

### Sign Out

```dart
await supabase.auth.signOut();
// Navigate to Login screen
```

### Session Persistence

Supabase Flutter SDK automatically persists sessions to local storage and refreshes tokens. No manual handling needed.

```dart
// Check if already logged in on app start
final session = supabase.auth.currentSession;
if (session != null) {
  // Navigate to Home (skip Login screen)
} else {
  // Navigate to Login screen
}

// Listen to auth state changes
supabase.auth.onAuthStateChange.listen((data) {
  final event = data.event;
  if (event == AuthChangeEvent.signedOut) {
    // Navigate to Login
  }
});
```

### Get Current User IDs

Two IDs are critical throughout the app. Fetch them once after login and cache them.

```dart
// auth_state.dart — fetch once after login, store in app state

// 1. Auth user ID (= profile ID)
final userId = supabase.auth.currentUser!.id;

// 2. Profile (role, org, name)
final profileRow = await supabase
    .from('profiles')
    .select('id, organization_id, role, first_name, last_name, phone')
    .eq('id', userId)
    .single();

// 3. Employee record ID (needed for shift/attendance/request queries)
final employeeRow = await supabase
    .from('employees')
    .select('id, position_id, status')
    .eq('profile_id', userId)
    .maybeSingle();

// Store: userId, organizationId, employeeId, profile
```

**Always verify `role == 'employee'`** before rendering the Employee App. Owners and managers should not use this app.

### Password Reset

The employee requests a password reset via the web platform (forgot password page). The Flutter app does not need to implement password reset — direct users to the web URL.

---

## 3. Database Tables

All tables are in the `public` schema. All use `uuid` primary keys. All timestamps are `timestamptz` (UTC).

### `organizations`

Business entity. One per owner.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `business_name` | text | |
| `phone` | text | nullable |
| `email` | text | nullable |
| `address` | text | nullable |
| `default_shift_start` | text | nullable, format `HH:MM` |
| `default_shift_end` | text | nullable, format `HH:MM` |
| `default_position_ids` | uuid[] | nullable |
| `created_at` | timestamptz | |

### `profiles`

Auth-linked user profile. One per auth user. `id` = `auth.users.id`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Same as auth user ID |
| `organization_id` | uuid FK → organizations | |
| `role` | `app_role` enum | `owner`, `manager`, `employee` |
| `first_name` | text | nullable |
| `last_name` | text | nullable |
| `phone` | text | nullable |
| `created_at` | timestamptz | |

### `employees`

Operational employee record. Separate from `profiles` to allow pre-creation before login.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Used in shifts, attendance, requests |
| `organization_id` | uuid FK → organizations | |
| `profile_id` | uuid FK → profiles | nullable — null until invite accepted |
| `first_name` | text | |
| `last_name` | text | |
| `email` | text | |
| `phone` | text | nullable |
| `position_id` | uuid FK → positions | nullable |
| `status` | `employee_status` enum | `active`, `inactive`, `suspended` |
| `notes` | text | nullable, internal manager notes |
| `created_at` | timestamptz | |

**Key:** `profile_id` links the auth account to the operational record. Query `employees` by `profile_id = auth.user.id` to get the employee's `id`.

### `positions`

Custom job positions defined per organization.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organization_id` | uuid FK → organizations | |
| `name` | text | e.g., "Waiter", "Bartender", "Chef" |
| `created_at` | timestamptz | |

### `shifts`

The most important table in the system. Represents a scheduled work shift.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organization_id` | uuid FK → organizations | |
| `employee_id` | uuid FK → employees | |
| `shift_date` | date | Format: `YYYY-MM-DD` |
| `start_time` | time | Format: `HH:MM:SS` (normalize to `HH:MM` for display) |
| `end_time` | time | Format: `HH:MM:SS` (normalize to `HH:MM` for display) |
| `position_id` | uuid FK → positions | nullable |
| `status` | `shift_status` enum | `scheduled`, `completed`, `cancelled` |
| `notes` | text | nullable |
| `created_at` | timestamptz | |

**Time format note:** PostgreSQL returns `HH:MM:SS`. Trim to `HH:MM` for display. When creating shifts on the Admin Platform, `HH:MM` is sent and stored as `HH:MM:00`.

### `requests`

Unified table for both swap and time-off requests.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organization_id` | uuid FK → organizations | |
| `employee_id` | uuid FK → employees | |
| `type` | `request_type` enum | `swap`, `time_off` |
| `status` | `request_status` enum | `pending`, `approved`, `rejected` |
| `metadata` | jsonb | Structure depends on `type` — see below |
| `created_at` | timestamptz | |

**Metadata structure:**

```json
// type = "swap"
{
  "shift_id": "uuid-of-the-shift",
  "note": "optional note from employee"
}

// type = "time_off"
{
  "date": "YYYY-MM-DD",
  "note": "optional note from employee"
}
```

### `attendance_logs`

Individual check-in and check-out events.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organization_id` | uuid FK → organizations | |
| `employee_id` | uuid FK → employees | |
| `type` | `attendance_type` enum | `check_in`, `check_out` |
| `timestamp` | timestamptz | UTC timestamp of the event |
| `notes` | text | nullable |
| `created_at` | timestamptz | |

**Worked hours calculation:** Pair each `check_in` with the next `check_out` on the same calendar date (UTC). Difference in hours = worked hours for that day.

### `employee_invites`

Tracks invite emails. Read-only for the Employee App (not needed in most flows).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `organization_id` | uuid FK → organizations | |
| `employee_id` | uuid FK → employees | |
| `email` | text | |
| `token` | text | |
| `accepted_at` | timestamptz | nullable — null until accepted |
| `expires_at` | timestamptz | |
| `created_at` | timestamptz | |

### `notifications`

In-app notifications for employees (and managers).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | = `auth.user.id` |
| `organization_id` | uuid FK → organizations | |
| `type` | text | See notification types below |
| `title` | text | Human-readable title |
| `meta` | text | Human-readable description string |
| `href` | text | Web navigation hint (e.g., `/requests`) — map to Flutter screen |
| `unread` | boolean | `true` = unread |
| `created_at` | timestamptz | |

---

## 4. RLS Policies

All tables have Row Level Security enabled. The anon key alone cannot read anything — the user must be authenticated.

### Employee Access Rules

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `organizations` | Own org only | No | No | No |
| `profiles` | Own profile only | No | Own profile only | No |
| `employees` | Own record only | No | No | No |
| `positions` | Own org only | No | No | No |
| `shifts` | Own shifts only | No | No | No |
| `requests` | Own requests only | Own requests only | No | No |
| `attendance_logs` | Own logs only | Own logs only | No | No |
| `notifications` | Own notifications | No | Own (mark read) | No |
| `employee_invites` | No access needed | No | No | No |

### Critical Rules

1. **Organization isolation** — Every query is automatically scoped to the employee's organization. RLS enforces this — you cannot accidentally see another organization's data.
2. **Employee isolation** — Employees cannot see other employees' shifts, attendance, or requests. Only their own records.
3. **Read-only schedule** — Employees can only read shifts. They cannot create, modify, or delete shifts.
4. **Request creation** — Employees can insert their own requests. They cannot approve or reject any request.
5. **Attendance insertion** — Employees can insert `check_in` / `check_out` records for themselves. They cannot modify existing logs.
6. **Notifications** — Employees can read their own notifications and mark them as read (update `unread = false`).

---

## 5. API Endpoints

All queries use the Supabase Flutter SDK. Assumes `supabase`, `userId`, `employeeId`, and `organizationId` are stored in app state after login.

### 5.1 Get Employee Profile

```dart
// Get profile (name, role, org)
final profile = await supabase
    .from('profiles')
    .select('id, organization_id, role, first_name, last_name, phone, created_at')
    .eq('id', userId)
    .single();

// Get employee record (position, status, employee_id)
final employee = await supabase
    .from('employees')
    .select('''
      id, organization_id, profile_id,
      first_name, last_name, email, phone,
      position_id, status, notes, created_at,
      position:positions(id, name)
    ''')
    .eq('profile_id', userId)
    .single();
```

### 5.2 Get Own Shifts (Weekly Schedule)

```dart
// Get shifts for a specific week
// weekStart = Monday's date, weekEnd = Sunday's date

final shifts = await supabase
    .from('shifts')
    .select('''
      id, organization_id, employee_id,
      shift_date, start_time, end_time,
      position_id, status, notes, created_at,
      position:positions(id, name)
    ''')
    .eq('employee_id', employeeId)
    .gte('shift_date', weekStart) // e.g., '2026-06-09'
    .lte('shift_date', weekEnd)   // e.g., '2026-06-15'
    .order('shift_date')
    .order('start_time');
```

**Display:** Trim `start_time` and `end_time` from `HH:MM:SS` to `HH:MM`.

### 5.3 Get Upcoming Shifts (Home Screen)

```dart
final today = DateTime.now().toIso8601String().substring(0, 10); // 'YYYY-MM-DD'

final upcomingShifts = await supabase
    .from('shifts')
    .select('''
      id, shift_date, start_time, end_time, status,
      position:positions(id, name)
    ''')
    .eq('employee_id', employeeId)
    .gte('shift_date', today)
    .neq('status', 'cancelled')
    .order('shift_date')
    .order('start_time')
    .limit(5);
```

### 5.4 Get Own Attendance Logs

```dart
// All logs (most recent first)
final logs = await supabase
    .from('attendance_logs')
    .select('id, employee_id, organization_id, type, timestamp, notes, created_at')
    .eq('employee_id', employeeId)
    .order('timestamp', ascending: false)
    .limit(200);

// Logs for current month only (for Worked Hours screen)
final dateFrom = '${year}-${month.toString().padLeft(2, '0')}-01';
final dateTo = '${year}-${month.toString().padLeft(2, '0')}-${lastDay}';

final monthLogs = await supabase
    .from('attendance_logs')
    .select('id, type, timestamp')
    .eq('employee_id', employeeId)
    .gte('timestamp', '${dateFrom}T00:00:00.000Z')
    .lte('timestamp', '${dateTo}T23:59:59.999Z')
    .order('timestamp');
```

### 5.5 Create Check-In / Check-Out

```dart
// Check in
await supabase.from('attendance_logs').insert({
  'organization_id': organizationId,
  'employee_id': employeeId,
  'type': 'check_in',                          // or 'check_out'
  'timestamp': DateTime.now().toUtc().toIso8601String(),
  'notes': null,                               // optional
});

// Check out
await supabase.from('attendance_logs').insert({
  'organization_id': organizationId,
  'employee_id': employeeId,
  'type': 'check_out',
  'timestamp': DateTime.now().toUtc().toIso8601String(),
  'notes': null,
});
```

**Always send UTC timestamps.** The `timestamp` field is `timestamptz` — use `DateTime.now().toUtc().toIso8601String()`.

**Determining current status (checked in or out):** Fetch the most recent attendance log and check its `type`.

```dart
final latest = await supabase
    .from('attendance_logs')
    .select('id, type, timestamp')
    .eq('employee_id', employeeId)
    .order('timestamp', ascending: false)
    .limit(1)
    .maybeSingle();

final isCheckedIn = latest != null && latest['type'] == 'check_in';
```

### 5.6 Get Own Requests

```dart
final requests = await supabase
    .from('requests')
    .select('id, employee_id, organization_id, type, status, metadata, created_at')
    .eq('employee_id', employeeId)
    .order('created_at', ascending: false);

// metadata is a Map<String, dynamic> (jsonb)
// For type = 'swap': metadata['shift_id'], metadata['note']
// For type = 'time_off': metadata['date'], metadata['note']
```

### 5.7 Create Time-Off Request

```dart
await supabase.from('requests').insert({
  'organization_id': organizationId,
  'employee_id': employeeId,
  'type': 'time_off',
  'status': 'pending',
  'metadata': {
    'date': '2026-07-15',         // YYYY-MM-DD, must be today or future
    'note': 'Optional note',      // optional
  },
});
```

**Validation (client-side):**
- `date` must be today or in the future
- `date` format must be `YYYY-MM-DD`

### 5.8 Create Swap Request

```dart
// First, let employee pick a shift to swap (their upcoming shifts)
final upcomingShifts = await supabase
    .from('shifts')
    .select('id, shift_date, start_time, end_time, position:positions(name)')
    .eq('employee_id', employeeId)
    .gte('shift_date', today)
    .neq('status', 'cancelled')
    .order('shift_date')
    .order('start_time');

// Then create the swap request
await supabase.from('requests').insert({
  'organization_id': organizationId,
  'employee_id': employeeId,
  'type': 'swap',
  'status': 'pending',
  'metadata': {
    'shift_id': selectedShiftId,  // must be an upcoming shift belonging to employee
    'note': 'Optional note',      // optional
  },
});
```

**Validation (client-side):**
- `shift_id` must reference a shift that belongs to this employee
- The shift's `shift_date` must be today or in the future (can't swap past shifts)

### 5.9 Get Notifications

```dart
// Fetch latest notifications (most recent first)
final notifications = await supabase
    .from('notifications')
    .select('id, user_id, organization_id, type, title, meta, href, unread, created_at')
    .eq('user_id', userId)          // userId = auth user ID = profile ID
    .order('created_at', ascending: false)
    .limit(20);

// Get unread count only
final response = await supabase
    .from('notifications')
    .select('id', count: CountOption.exact)
    .eq('user_id', userId)
    .eq('unread', true);
final unreadCount = response.count ?? 0;
```

### 5.10 Mark Notification as Read

```dart
// Mark single notification as read
await supabase
    .from('notifications')
    .update({'unread': false})
    .eq('id', notificationId)
    .eq('user_id', userId);

// Mark all notifications as read
await supabase
    .from('notifications')
    .update({'unread': false})
    .eq('user_id', userId)
    .eq('unread', true);
```

### 5.11 Worked Hours Calculation

Worked hours are derived from `attendance_logs` — there is no pre-computed worked hours table.

```dart
// Algorithm:
// 1. Fetch logs for a date range, sorted by timestamp ascending
// 2. Group logs by date (UTC date from timestamp)
// 3. For each date: first check_in and first check_out after it = one work session
// 4. Hours = (check_out timestamp - check_in timestamp) in hours

double calculateWorkedHours(List<Map<String, dynamic>> logs) {
  // Group by date
  final Map<String, List<Map<String, dynamic>>> byDate = {};
  for (final log in logs) {
    final date = DateTime.parse(log['timestamp']).toUtc()
        .toIso8601String().substring(0, 10);
    byDate.putIfAbsent(date, () => []).add(log);
  }

  double total = 0;
  for (final dayLogs in byDate.values) {
    final checkIns = dayLogs
        .where((l) => l['type'] == 'check_in')
        .map((l) => DateTime.parse(l['timestamp']))
        .toList()..sort();
    final checkOuts = dayLogs
        .where((l) => l['type'] == 'check_out')
        .map((l) => DateTime.parse(l['timestamp']))
        .toList()..sort();

    if (checkIns.isNotEmpty && checkOuts.isNotEmpty) {
      final checkIn = checkIns.first;
      final checkOut = checkOuts.firstWhere(
        (t) => t.isAfter(checkIn),
        orElse: () => checkOuts.first,
      );
      final diff = checkOut.difference(checkIn);
      if (diff.inSeconds > 0) {
        total += diff.inMinutes / 60.0;
      }
    }
  }
  return double.parse(total.toStringAsFixed(1));
}
```

### 5.12 Update Own Profile

```dart
// Employee can update their own profile (name, phone)
await supabase
    .from('profiles')
    .update({
      'first_name': firstName,
      'last_name': lastName,
      'phone': phone,
    })
    .eq('id', userId);
```

---

## 6. Data Models (Dart)

### Enums

```dart
enum AppRole { owner, manager, employee }

enum EmployeeStatus { active, inactive, suspended }

enum ShiftStatus { scheduled, completed, cancelled }

enum RequestType { swap, time_off }

enum RequestStatus { pending, approved, rejected }

enum AttendanceType { check_in, check_out }
```

### Profile

```dart
class Profile {
  final String id;           // = auth user ID
  final String organizationId;
  final AppRole role;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final DateTime createdAt;

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
}
```

### Organization

```dart
class Organization {
  final String id;
  final String businessName;
  final String? phone;
  final String? email;
  final String? address;
  final String? defaultShiftStart; // 'HH:MM'
  final String? defaultShiftEnd;   // 'HH:MM'
  final DateTime createdAt;
}
```

### Position

```dart
class Position {
  final String id;
  final String organizationId;
  final String name;
  final DateTime createdAt;
}
```

### Employee

```dart
class Employee {
  final String id;              // Used in shifts, attendance, requests
  final String organizationId;
  final String? profileId;      // = auth user ID after invite accepted
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final String? positionId;
  final Position? position;     // joined from positions table
  final EmployeeStatus status;
  final String? notes;
  final DateTime createdAt;

  String get fullName => '$firstName $lastName';
}
```

### Shift

```dart
class Shift {
  final String id;
  final String organizationId;
  final String employeeId;
  final String shiftDate;       // 'YYYY-MM-DD'
  final String startTime;       // 'HH:MM' (trimmed from DB's HH:MM:SS)
  final String endTime;         // 'HH:MM'
  final String? positionId;
  final Position? position;     // joined
  final ShiftStatus status;
  final String? notes;
  final DateTime createdAt;
}
```

### Request

```dart
class SwapRequestMetadata {
  final String shiftId;
  final String? note;
}

class TimeOffRequestMetadata {
  final String date;   // 'YYYY-MM-DD'
  final String? note;
}

class Request {
  final String id;
  final String employeeId;
  final String organizationId;
  final RequestType type;
  final RequestStatus status;
  final Map<String, dynamic> metadata; // parse based on type
  final DateTime createdAt;

  // Helpers
  SwapRequestMetadata? get swapMeta => type == RequestType.swap
      ? SwapRequestMetadata(
          shiftId: metadata['shift_id'] as String,
          note: metadata['note'] as String?,
        )
      : null;

  TimeOffRequestMetadata? get timeOffMeta => type == RequestType.time_off
      ? TimeOffRequestMetadata(
          date: metadata['date'] as String,
          note: metadata['note'] as String?,
        )
      : null;
}
```

### AttendanceLog

```dart
class AttendanceLog {
  final String id;
  final String employeeId;
  final String organizationId;
  final AttendanceType type;
  final DateTime timestamp;     // UTC — display in local time
  final String? notes;
  final DateTime createdAt;
}

class AttendanceDaySummary {
  final String date;        // 'YYYY-MM-DD'
  final String? checkIn;   // 'HH:MM' UTC
  final String? checkOut;  // 'HH:MM' UTC
  final double hours;
}
```

### Notification

```dart
class AppNotification {
  final String id;
  final String userId;          // = auth user ID
  final String organizationId;
  final String type;            // See notification types
  final String title;           // e.g., "Request approved"
  final String meta;            // Plain text description
  final String href;            // Web path hint — map to Flutter screen
  final bool unread;
  final DateTime createdAt;
}
```

**`href` to Flutter screen mapping:**

| `href` value | Flutter Screen |
|---|---|
| `/requests` | Requests screen |
| `/shifts` | Schedule screen |
| `/attendance` | Attendance screen |
| `/dashboard` | Home screen |

---

## 7. Employee App Screens

### Screen Architecture

```
Login
  └─ Home (after login)
       ├─ Schedule
       ├─ Requests
       ├─ Attendance
       ├─ Worked Hours
       └─ Notifications
```

---

### Login Screen

**Purpose:** Email/password authentication.

**UI Elements:**
- Email field
- Password field
- "Sign in" button
- "Forgot password?" link → opens web browser to `https://[web-app-url]/forgot-password`
- Error message display

**Logic:**
- Call `signInWithPassword`
- On success: load profile + employee record, navigate to Home
- On error: display human-readable error

---

### Home Screen

**Purpose:** Quick overview of what's happening today/next.

**Data to fetch on load:**
1. Next upcoming shift (first future shift, status != cancelled)
2. Today's attendance status (last attendance log — checked in or out)
3. Unread notification count (for badge)

**UI Elements:**

```
┌─────────────────────────────┐
│  Hi, [First Name]           │
│  [Organization Name]        │
│                             │
│  NEXT SHIFT                 │
│  ┌───────────────────────┐  │
│  │ Tuesday, Jun 10       │  │
│  │ 09:00 – 17:00         │  │
│  │ Waiter                │  │
│  └───────────────────────┘  │
│                             │
│  TODAY'S STATUS             │
│  ● Checked in at 09:02      │
│  [Check Out] button         │
│                             │
│  NOTIFICATIONS (3 unread)   │
│  [View All]                 │
└─────────────────────────────┘
```

**Attendance quick action:**
- If no log today → show "Check In" button
- If last log = `check_in` → show "Check Out" button
- If last log = `check_out` → show "Checked out at HH:MM"
- After tap → insert log → update UI

**Refresh strategy:** Refresh on screen focus (when returning to Home). Pull-to-refresh supported.

---

### Schedule Screen

**Purpose:** Weekly view of employee's own shifts.

**Data to fetch:**
- Shifts for current week (Monday–Sunday)
- Allow navigation to next/previous week

**UI Elements:**

```
┌─────────────────────────────┐
│  < Jun 9 – Jun 15 >         │
│                             │
│  MON  TUE  WED  THU  FRI    │
│  9    10   11   12   13     │
│                             │
│  [No shift] [09–17] [09–17] ...
│                             │
│  ── Shift Detail ──         │
│  Tuesday, June 10           │
│  09:00 – 17:00              │
│  Position: Waiter           │
│  Status: Scheduled          │
└─────────────────────────────┘
```

**Logic:**
- Current week shown on open
- Tap on a shift → show detail (date, time, position, status)
- Do NOT show cancelled shifts in the primary view (filter `status != 'cancelled'`)
- Week starts on Monday

**Date key format:** `YYYY-MM-DD`. Calculate Monday of current week and add 6 days for Sunday.

---

### Requests Screen

**Purpose:** View history of all own requests. Create new requests.

**Tabs / Filters:** All | Pending | Approved | Rejected

**UI Elements (Request List Item):**

```
┌─────────────────────────────┐
│  🔄 Shift Swap  [PENDING]   │
│  June 12, 09:00–17:00       │
│  Requested Jun 9, 2026      │
├─────────────────────────────┤
│  🕐 Time Off   [APPROVED]   │
│  July 15, 2026              │
│  Requested Jun 1, 2026      │
└─────────────────────────────┘
```

**Create Request flow:**

**Time Off Request:**
1. Tap "New Request" → select type "Time Off"
2. Pick a date (date picker, future dates only)
3. Optional note field
4. Confirm → insert into `requests`

**Swap Request:**
1. Tap "New Request" → select type "Shift Swap"
2. List of employee's upcoming shifts to pick from
3. Optional note field
4. Confirm → insert into `requests`

**Status badge colors:**
- `pending` → amber/yellow
- `approved` → green
- `rejected` → red

---

### Attendance Screen

**Purpose:** Check in/out and view personal attendance history.

**Data to fetch:**
- Latest attendance log (for current status)
- Recent attendance logs (last 30, for history list)

**UI Elements:**

```
┌─────────────────────────────┐
│  ATTENDANCE                 │
│                             │
│  Current status:            │
│  ● Checked in at 09:02      │
│                             │
│  [    CHECK OUT    ]        │
│                             │
│  ── Recent Activity ──      │
│  Today          Check in  09:02  │
│  Yesterday      Check out  17:05 │
│  Yesterday      Check in   09:00 │
│  ...                        │
└─────────────────────────────┘
```

**Timestamps:** Store in UTC (`DateTime.now().toUtc()`). Display in local device time (`timestamp.toLocal()`).

**Business rule:** There are no restrictions on multiple check-ins per day — the system accepts them. The worked hours calculation uses the first check-in and first valid check-out per day.

---

### Worked Hours Screen

**Purpose:** Monthly summary of hours worked.

**Data to fetch:**
- All `attendance_logs` for current month
- Calculated via the algorithm in section 5.11

**UI Elements:**

```
┌─────────────────────────────┐
│  < May 2026    Jun 2026 >   │
│                             │
│  TOTAL HOURS THIS MONTH     │
│  138h                       │
│                             │
│  ── Daily Breakdown ──      │
│  Jun 9  (Mon)   8.0h       │
│  Jun 10 (Tue)   8.5h       │
│  Jun 11 (Wed)   7.5h       │
│  ...                        │
└─────────────────────────────┘
```

**Month navigation:** Allow prev/next month. Recalculate on month change.

**Days with 0 hours:** Only show days that have at least one attendance log (skip days with no activity).

**Note:** There is no `worked_hours` table. All calculations happen client-side from `attendance_logs`. This is intentional — keep backend simple.

---

### Notifications Screen

**Purpose:** View all in-app notifications.

**Data to fetch:**
- Latest 20 notifications for `user_id = auth.user.id`
- Mark as read when viewed

**UI Elements:**

```
┌─────────────────────────────┐
│  NOTIFICATIONS              │
│                             │
│  ● Request approved          │  ← unread (bold/highlighted)
│  Your time off for Jul 15...│
│  5 minutes ago              │
│                             │
│  Request submitted           │  ← read
│  Swap request for Jun 12... │
│  2 days ago                 │
└─────────────────────────────┘
```

**Behavior:**
- Mark individual notification as read when tapped
- "Mark all read" option in header
- Badge in bottom nav shows unread count
- Update badge after marking read

**Notification type → display icon:**

| Type | Label | Icon suggestion |
|---|---|---|
| `shift_created` | New shift assigned | 📅 |
| `shift_assigned` | Shift assigned | 📅 |
| `shift_updated` | Shift updated | ✏️ |
| `shift_cancelled` | Shift cancelled | ❌ |
| `swap_approved` | Swap request approved | ✅ |
| `swap_rejected` | Swap request rejected | ❌ |
| `time_off_approved` | Time off approved | ✅ |
| `time_off_rejected` | Time off rejected | ❌ |
| `attendance_reminder` | Attendance reminder | ⏰ |
| `attendance_confirmation` | Attendance confirmed | ✅ |
| `swap_request` | New swap request (sent to managers) | 🔄 |
| `time_off_request` | New time off request (sent to managers) | 🕐 |

---

### Profile Screen

**Purpose:** View and edit personal info.

**Data:**
- Profile (first_name, last_name, phone)
- Employee record (email, position, status)

**Editable fields:** `first_name`, `last_name`, `phone` in `profiles` table.

**Non-editable:** email, position, status — managed by admin only.

**Actions:**
- Edit profile (update `profiles`)
- Sign out

---

## 8. Notifications

### How Notifications Are Created

Notifications are created **server-side** by the Admin Platform (Next.js) when specific events occur. The Employee App only reads and marks them.

| Trigger | Who Receives |
|---|---|
| Employee creates a request | Managers and owners of the organization |
| Manager approves/rejects request | The employee who submitted it |
| Shift assigned to employee | That employee |
| Shift updated | That employee |
| Shift cancelled | That employee |

### Notification Schema

```dart
// The `meta` field is a plain-text description string (not JSON):
// "Time off · July 15, 2026"
// "Shift swap · Jun 12 09:00–17:00 (Waiter)"

// The `href` field is a web path — use the mapping table in section 6 to
// route the user to the correct screen when they tap a notification.
```

### Polling Strategy

**No real-time / WebSocket.** This is a locked MVP decision.

Refresh notifications:
- On app open (cold start)
- When user navigates to the Notifications screen
- When app returns from background

```dart
// Recommended: refresh on app lifecycle change
AppLifecycleListener(
  onResume: () => refreshNotifications(),
);
```

Do not implement push notifications in the MVP unless explicitly scoped. The system uses in-app notifications only.

### Unread Badge

Show unread count on the Notifications tab in the bottom navigation bar. Refresh this count:
- After login
- After marking notifications read
- On app resume

---

## 9. Key Rules & Constraints

### Must Follow

1. **Never use Service Role Key in Flutter.** Only `anonKey`. Service role key is server-only.

2. **All timestamps are UTC.** Store as UTC, display in local device timezone. Use `DateTime.now().toUtc()` for inserts.

3. **`employee_id` vs `user_id` vs `profile_id`:**
   - `profiles.id` = `auth.user.id` = used for notifications (`user_id`)
   - `employees.id` = used for shifts, requests, attendance
   - `employees.profile_id` = `profiles.id` (the link between them)
   - Store both after login. Use the right one per table.

4. **Shift times come back as `HH:MM:SS`.** Trim to `HH:MM` for display. This is how PostgreSQL returns `time` columns.

5. **Employees cannot modify the schedule.** No INSERT/UPDATE on `shifts`. Show shifts as read-only.

6. **Request metadata is `jsonb`.** Parse based on `type` field. Always check `type` first.

7. **All queries are organization-scoped automatically.** RLS handles this — you don't need to add `organization_id` to every SELECT. But you must include it in INSERT statements.

8. **snake_case everywhere.** Column names are `snake_case` (e.g., `first_name`, `shift_date`, `employee_id`). Match exactly.

### Refresh Strategy

| Trigger | What to Refresh |
|---|---|
| App open (cold start) | Everything |
| App returns from background | Current screen data + notifications |
| Pull-to-refresh | Current screen data |
| After insert (check-in, request) | Current screen data |

Do not implement live sync, WebSocket, or real-time subscriptions. Not in MVP scope.

### Error Handling

Supabase SDK returns a `PostgrestException` for query errors. Always check for errors and show user-friendly messages.

```dart
try {
  final result = await supabase.from('shifts').select(...);
  // use result
} on PostgrestException catch (e) {
  // Show user-friendly error
  showError('Failed to load shifts. Please try again.');
} catch (e) {
  showError('Something went wrong. Please try again.');
}
```

Do not show raw database error messages to users.

### Employee Statuses

Only `active` employees can have active shifts. However, the RLS is based on `profile_id` linkage, not status — an `inactive` or `suspended` employee can still log in. Handle this gracefully:

```dart
if (employee.status == EmployeeStatus.suspended) {
  // Show "Your account has been suspended. Contact your manager."
  // Prevent check-in/out actions
}
```

### Performance

- Limit all queries. Use `.limit(200)` for attendance, `.limit(20)` for notifications.
- Show skeleton/loading states while data loads.
- Cache profile and employee ID — don't re-fetch on every screen.
- Use pull-to-refresh for manual refresh — no auto-polling intervals.

---

*For questions about the backend, contact the web platform developer or check the Supabase dashboard at https://supabase.com for the SeasonStaff project.*
