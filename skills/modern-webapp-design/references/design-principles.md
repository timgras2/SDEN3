# Design Principles

## Purpose

Apply modern UI/UX principles to produce web apps that feel minimal, intentional, and clear without looking generic.

## Core Rules

1. Prioritize content hierarchy over decoration.
2. Use no more than 2 type families and 5 text sizes per screen.
3. Keep a consistent spacing scale (4, 8, 12, 16, 24, 32, 48).
4. Limit base palette to 1 neutral scale + 1 accent + semantic status colors.
5. Use motion to communicate state change, not to add noise.

## Typography

- Prefer readable line length (45-80 characters for body text).
- Set explicit type ramp: caption, body, label, title, heading.
- Reserve heavy weight for true emphasis.
- Keep paragraph and heading spacing proportional to scale tokens.

## Layout and Spacing

- Build with predictable grid and stack primitives.
- Use whitespace intentionally to separate concerns.
- Avoid dense controls near primary action zones.
- Keep alignment strict; visual rhythm should be obvious.

## Color and Contrast

- Define semantic tokens (`--color-bg`, `--color-text`, `--color-accent`).
- Enforce WCAG contrast targets for text and controls.
- Use accent color sparingly for interactive priorities.

## Motion

- Standardize timing tokens (`120ms`, `200ms`, `320ms`).
- Prefer transform and opacity animations.
- Respect reduced-motion preferences.

## Design Tokens

Use token layers:
- Global tokens: base color, spacing, typography scales.
- Semantic tokens: role-based values (`surface`, `border`, `danger`).
- Component tokens: local override only when needed.

Avoid hard-coded values in component styles when tokenized equivalents exist.

## Navigation and Flow

- Keep global navigation shallow and stable.
- Make primary actions visually dominant and spatially consistent.
- Surface secondary actions only when context demands them.

## Quality Gate

Before finalizing a UI, confirm:
- Visual hierarchy is obvious within 3 seconds.
- Primary action is unambiguous on each key screen.
- Spacing and typography follow the defined scale.
- Components look like one system, not isolated widgets.
