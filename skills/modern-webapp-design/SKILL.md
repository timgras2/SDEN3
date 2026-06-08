---
name: modern-webapp-design
description: Design and implement beautiful, clean, and modern web applications with strong UX, performance, accessibility, and scalable code architecture. Use when users ask for UI/UX direction, frontend architecture, component systems, design tokens, React/Vue/Svelte/Tailwind implementation, modernization of existing interfaces, landing pages, dashboards, SaaS interfaces, or performance-focused visual refreshes.
---

# Modern Web App Design

Build polished web apps that are minimal, elegant, fast, accessible, and maintainable. Use this workflow to turn vague ideas into production-ready UI systems with consistent visual language and modular architecture.

## Workflow

1. Define constraints before drawing UI.
- Capture target users, devices, key journeys, success metrics, brand tone, and required framework.
- Turn broad asks into explicit deliverables: page map, component list, token set, implementation plan.

2. Establish a design system foundation first.
- Define color, typography, spacing, radius, shadows, and motion tokens before writing components.
- Prefer tokens and primitives over one-off CSS values.
- Use `references/design-principles.md` for visual rules and composition standards.

3. Choose stack and implementation path.
- React + Tailwind: fastest for teams with strong ecosystem needs.
- Vue + Tailwind: great for template clarity and progressive adoption.
- Svelte + utility classes: strong performance and low overhead.
- Read only the chosen framework section in `references/stack-playbooks.md`.

4. Build information architecture and navigation.
- Design primary routes and decision points first; avoid deep nesting.
- Keep navigation predictable and lightweight.
- Use progressive disclosure to reduce cognitive load.

5. Implement modular components.
- Start from primitives (`Button`, `Input`, `Card`, `Stack`, `Grid`) and compose upward.
- Enforce consistent spacing and typographic scale through tokens.
- Use `assets/templates/` as starter shells, then adapt to project context.

6. Harden performance and accessibility during implementation.
- Apply lazy loading, route-level code splitting, responsive images, and font loading strategy.
- Meet keyboard, focus, semantics, contrast, and reduced-motion requirements.
- Run the checklist in `references/performance-accessibility.md`.

7. Deliver with design and code quality gates.
- Verify visual consistency, UX clarity, and interaction intent.
- Ensure architecture remains simple: low component coupling, clear boundaries, reusable patterns.
- Include rationale for major tradeoffs in the final handoff.

## Output Contract

When using this skill, produce:
- A concise visual direction summary (typography, color system, spacing, motion intent).
- A component architecture plan and folder structure.
- A framework-specific implementation scaffold.
- A performance and accessibility checklist result.
- Optional next iteration opportunities for polish.

## Resource Map

- `references/design-principles.md`: Minimalist UI/UX rules, token strategy, layout system.
- `references/stack-playbooks.md`: React/Vue/Svelte/Tailwind implementation playbooks.
- `references/performance-accessibility.md`: Optimization and accessibility checklist.
- `references/case-studies.md`: Before/after style examples and practical transformations.
- `assets/templates/design-tokens.css`: Token starter file.
- `assets/templates/react-tailwind-app-shell.jsx`: React shell template.
- `assets/templates/vue-tailwind-app-shell.vue`: Vue shell template.
- `assets/templates/svelte-app-shell.svelte`: Svelte shell template.
