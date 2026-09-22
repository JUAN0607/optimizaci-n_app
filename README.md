# RITMO

**RITMO** is a personal time-management, habit-tracking, routine and consistency app, built for one user (you) to install on your own iPhone. It is not published to the App Store and doesn't need to be.

RITMO follows a simple cycle: **Plan → Execute → Check → Measure → Improve**, and tries to answer five questions well:

1. What do I need to do today?
2. What is happening now?
3. What should I do next?
4. What habits am I maintaining?
5. How am I progressing over time?

## Stack

- [Expo](https://expo.dev) (managed workflow, SDK 57) + React Native 0.86 + TypeScript (strict)
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based navigation, routes under `src/app/`
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — local, structured, persistent storage (the only source of truth)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) — local reminders (no push/remote notifications)
- `react-native-svg` — small custom charts, no heavy charting library
- `@gorhom/bottom-sheet` — the creation sheet and modal pickers
- `zustand` — a tiny store for theme mode, onboarding state, and a `dataVersion` counter that tells screens to re-read from SQLite after a write
- `date-fns` — date math, always in the device's local timezone

RITMO is **local-first**: everything (activities, habits, routines, goals, settings) lives in a SQLite database on the device. There is no backend and no account system. Core functionality works fully offline.

## Project structure

```
src/
  app/            Expo Router routes — tabs (Hoy/Plan/Hábitos/Progreso), onboarding, settings,
                   activity/[id], habit/[id], create/{task,event,habit,routine,reminder}
  components/      Reusable design-system components (ActivityCard, HabitCard, ProgressBar, …)
  features/planner/  Day/Week/Month/Year calendar views used by the Plan tab
  db/              SQLite client, versioned migrations, seed data, one repository per entity
  services/        exportService (data-ownership boundary), notificationService lives in notifications/
  notifications/   Local notification scheduling, with a notification_map table so edits/deletes
                   cancel and reschedule instead of duplicating reminders
  hooks/           useActivities/useHabits/useCategories (read from SQLite, driven by dataVersion),
                   useAppStore (zustand), useCreateSheetStore
  utils/           Date helpers and the recurrence engine (`isScheduledDay`)
  analytics/       Pure functions: completion rate, time metrics, category breakdown, streaks
  constants/       Default categories, labels (Spanish UI strings)
  theme/           Colors (light/dark), typography (DM Sans), spacing, ThemeProvider
  types/           Shared entity types
```

## Data model

SQLite tables: `category, activity, habit, habit_log, routine, routine_item, goal, app_settings, notification_map`, created and evolved through versioned migrations in [`src/db/migrations.ts`](src/db/migrations.ts) (`PRAGMA user_version`-gated, additive only — never edit a past migration).

- **Activities** (`TASK` / `EVENT` / `REMINDER`) carry `status` (`PENDING`/`IN_PROGRESS`/`COMPLETED`/`SKIPPED`/`OVERDUE`), `priority`, and an optional `recurrenceRule`.
- **Habits** carry a `measurementType` (`CHECKBOX`/`DURATION`/`QUANTITY`/`DISTANCE`/`COUNT`) and a `recurrenceRule`; **habit logs** are one row per habit per completed/skipped day.
- **Recurrence** is stored as structured JSON, not a raw RRULE string — see the `RecurrenceRule` union in [`src/types/entities.ts`](src/types/entities.ts). `isScheduledDay()` in [`src/utils/recurrence.ts`](src/utils/recurrence.ts) is the single source of truth for "was this day required", used by both the calendar and the streak calculator so they never disagree.
- **Streaks** ([`src/analytics/streaks.ts`](src/analytics/streaks.ts)) respect the habit's actual schedule: an unscheduled day (e.g. Tuesday for a Mon/Wed/Fri habit) never breaks a streak, and `X_TIMES_PER_WEEK` habits are evaluated per ISO week instead of per day, since they have no fixed weekday. Covered by unit tests in `src/analytics/__tests__/`.

## Installing dependencies

```bash
npm install
```

## Running locally

```bash
npx expo start --dev-client
```

RITMO uses `expo-sqlite`, `expo-notifications`, `@gorhom/bottom-sheet` (reanimated + gesture-handler) and other native modules, so it **cannot run in plain Expo Go** — it needs a development build (`npx expo run:ios` builds one locally; `eas build --profile development` builds one in the cloud).

### Running on iOS Simulator

```bash
npx expo run:ios
```

This generates the `ios/` folder via Continuous Native Generation (CNG) — **never edit `ios/` by hand**; configure native behavior through `app.json` and config plugins instead, and re-run `expo prebuild` (or `run:ios`) after changing them.

If CocoaPods fails with a Unicode/encoding error (`UnicodeNormalize.normalize`), your shell's locale isn't UTF-8. Either run installs with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`, or add that to your `~/.profile` permanently (CocoaPods prints this warning itself).

## Installing RITMO on a personal iPhone

RITMO is meant to be built and installed on your own device, not published. Two real options:

1. **Free Apple ID (no paid account)** — `npx expo run:ios --device` with your iPhone connected, signing with your free Apple ID in Xcode. The app re-signs and stays installed for **7 days**, after which you rebuild/reinstall from a Mac. No cost, but you're on a weekly rebuild cadence.
2. **Paid Apple Developer Program ($99/yr)** — lets you use [EAS Build](https://docs.expo.dev/build/introduction/) (`eas build --platform ios --profile development`) for cloud builds and up to 1-year-valid ad-hoc/development signing, and [EAS Update](https://docs.expo.dev/eas-update/introduction/) to push JS-only changes over the air without a full rebuild.

Neither path requires App Store review or a public listing — both stay entirely on your own device(s).

### Notification permissions

RITMO asks for local notification permission during onboarding (step 5) and again wherever you toggle notifications on in Settings. Since it only schedules **local** notifications (no push service, no `UIBackgroundModes: remote-notification`), there's nothing else to configure — no server keys, no APNs certificates.

## Testing

```bash
npm test        # Jest — recurrence, streak and completion-rate logic
npm run typecheck
npm run lint
```

## Git workflow

Commits follow `feat:` / `fix:` / `refactor:` / `chore:` / `docs:` / `test:` prefixes. `ios/` and `android/` (native projects, regenerated by CNG), `node_modules/`, `.expo/`, and any `.env*` file are gitignored — no secrets, signing certificates, or provisioning profiles are ever committed.

## What's implemented vs. deferred

Implemented: onboarding, Today, Plan (Day/Week/Month/Year), all five creation flows, habit tracking with streaks, Settings (profile/categories/notifications/appearance/data export), light/dark theme, local notification scheduling for task/event reminders and daily/weekly summaries, SQLite persistence across restarts, and unit tests for the highest-risk logic (recurrence + streaks + completion rate).

Deferred, on purpose, rather than half-built: per-habit reminder scheduling (the UI field exists on the data model but isn't wired to a picker yet), deeper analytics charts beyond the current week/month/year metric cards, CSV export/JSON import (the export service boundary exists — `src/services/exportService.ts` — so this can be added without touching the rest of the app), and the future AI planning layer described in the product spec.

## Design system

Colors, typography (DM Sans) and spacing are centralized in `src/theme/`, designed from the product spec ahead of the Lovable mockups. When those mockups arrive, the plan is to adapt this presentation layer — components, spacing, exact colors — while keeping the architecture (data layer, navigation shape, recurrence/streak logic) as-is.
