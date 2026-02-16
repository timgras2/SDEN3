# Stack Playbooks

## Select a Path

- Choose React when ecosystem breadth and team familiarity are top priorities.
- Choose Vue when template readability and incremental adoption are key.
- Choose Svelte when minimal runtime and lean bundles matter most.

## React + Tailwind

### Architecture

- Organize by feature:
  - `src/app` for routes and providers
  - `src/features/*` for domain UI and logic
  - `src/components/ui` for reusable primitives
  - `src/lib` for utilities and shared hooks
- Keep state local first; lift only when cross-feature sync is required.

### Implementation Pattern

1. Define tokens in CSS variables.
2. Map token usage via Tailwind utilities or custom classes.
3. Compose primitives into sections and pages.
4. Add route-level lazy loading and data boundaries.

## Vue + Tailwind

### Architecture

- Use Single File Components with clear separation:
  - `<script setup>` for logic
  - `<template>` for structure
  - scoped utility composition, minimal custom CSS
- Use composables for shared logic and avoid monolithic stores.

### Implementation Pattern

1. Create foundational layout components (`AppShell`, `TopNav`, `SideNav`).
2. Establish token variables globally.
3. Build page modules from shared UI primitives.
4. Add route-based chunking and dynamic imports.

## Svelte + Utility Classes

### Architecture

- Keep components small and event-driven.
- Co-locate styles and behavior for local clarity.
- Prefer derived state over duplicated mutable state.

### Implementation Pattern

1. Build token-backed base styles.
2. Create small primitives and compose into sections.
3. Use lazy routes/components where possible.
4. Minimize hydration cost and avoid unnecessary client code.

## Tailwind Guidance

- Encode spacing, radius, and typography in theme config or CSS variables.
- Avoid long class strings without structure; extract reusable patterns.
- Keep utility usage systematic; avoid arbitrary values except one-off prototypes.

## Component Library Guidance

- Define a small core set first: `Button`, `Input`, `Select`, `Modal`, `Toast`, `Card`, `Tabs`.
- Treat variants as token-driven states, not separate disconnected components.
- Document component contracts: props, states, accessibility requirements.
