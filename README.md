# liftmaxxing

A mobile-first personal-record tracker for gym workouts. Track the maximum weight and reps reached for exercises across chest, legs, and full-body workout days.

## Current status

The app currently contains a static dashboard prototype with workout filters, a daily best lift, and recent PRs. Persistence and workout logging are not implemented yet.

## Stack

- Expo SDK 57 and React Native 0.86
- Expo Router
- React Native Reusables
- NativeWind
- Reanimated
- TypeScript

## Run locally

```bash
pnpm install
npx expo start
```

Use the Expo CLI prompt to open the app on iOS, Android, or web.

## Verify changes

```bash
npx expo lint
npx tsc --noEmit
```

## Project structure

```text
src/
├── app/            # Expo Router screens and layouts
├── components/ui/  # React Native Reusables components
├── lib/            # Theme and shared utilities
└── global.css      # NativeWind theme tokens
```
