# Performance and Accessibility

## Performance Checklist

1. Split code by route and heavy component boundaries.
2. Lazy load non-critical UI and defer below-the-fold content.
3. Use responsive images (`srcset`, modern formats, explicit dimensions).
4. Self-host and subset fonts when practical; avoid blocking render.
5. Preload only critical assets and avoid excessive preload hints.
6. Cache static assets with content hashes and long max-age.
7. Minimize client-side JS and remove dead dependencies.
8. Measure Core Web Vitals and resolve largest regressions first.

## Accessibility Checklist

1. Use semantic HTML and landmark elements.
2. Guarantee keyboard navigation for all interactive elements.
3. Maintain visible focus indicators with sufficient contrast.
4. Add accessible names to controls and icon-only buttons.
5. Validate color contrast for text, controls, and data visuals.
6. Respect `prefers-reduced-motion`.
7. Ensure forms expose labels, errors, and guidance to assistive tech.
8. Test with screen reader basics for critical flows.

## Responsive Design

- Start with mobile constraints and scale up.
- Use fluid type and spacing within bounded ranges.
- Avoid breakpoint-only fixes; design for continuous resizing.

## Verification Workflow

1. Run lighthouse/web-vitals checks after first functional pass.
2. Address render-blocking and oversized bundles.
3. Run keyboard-only walk-through on primary flows.
4. Run contrast and semantics checks.
5. Re-test after UI polish changes.

## Common Anti-Patterns

- Decorative animation that obscures task completion.
- Token drift (raw hex and arbitrary spacing values scattered in UI).
- Over-nested navigation and dense multi-column forms on mobile.
- Heavy component libraries loaded for small interactions.
