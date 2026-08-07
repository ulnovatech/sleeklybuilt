# Animation QA System
**Version:** 1.0  
**Status:** Review Layer  
**Depends On:** Motion System, Motion Intelligence, UX Intelligence, Accessibility Review

---

# Purpose

The Animation QA System validates that every animation in the product improves usability, reinforces hierarchy, and communicates state without sacrificing performance.

Animation is not decoration.

Animation is communication.

Every motion should answer one of these questions:

- What changed?
- Where did it come from?
- Where did it go?
- What is happening now?
- What should the user do next?

---

# Core Philosophy

Professional products do not animate more.

They animate better.

Animation should disappear into the experience.

If users notice the animation more than the task, it is probably excessive.

---

# Animation Review Pipeline

```
Purpose

↓

Trigger

↓

Timing

↓

Easing

↓

Performance

↓

Accessibility

↓

Consistency

↓

Approval
```

---

# 1. Purpose Review

Every animation must have a reason.

Allowed purposes:

- feedback
- orientation
- transition
- hierarchy
- progress
- delight

Reject decorative motion.

---

# 2. Trigger Review

Every animation begins because of:

- user interaction
- system state
- navigation
- content loading

Reject animations that occur randomly.

---

# 3. Timing Review

Animations should match the Motion System.

Typical durations:

```
Micro Interaction

100–150ms

Component Transition

150–250ms

Navigation

200–350ms

Large Layout

300–500ms
```

Reject inconsistent timing.

---

# 4. Easing Review

Use system easing tokens only.

Preferred:

- ease-standard
- ease-out
- ease-in-out
- ease-emphasized

Reject custom easing unless justified.

---

# 5. Performance Review

Animation should maintain:

```
60 FPS
```

Prefer animating:

- transform
- opacity

Avoid animating:

- width
- height
- top
- left
- margin

unless absolutely necessary.

---

# 6. Navigation Motion

Review:

- page transitions
- drawers
- bottom sheets
- dialogs

Movement should preserve orientation.

Users should always understand where content came from.

---

# 7. Component Motion

Verify consistency across:

- buttons
- cards
- dropdowns
- menus
- accordions
- tabs
- snackbars

Identical components should animate identically.

---

# 8. Loading Motion

Review:

- skeletons
- progress indicators
- AI generation steps
- uploads

Loading animations should reassure users.

Reject endless spinners without context.

---

# 9. Feedback Motion

Actions should visibly respond.

Examples:

Button

↓

Pressed

↓

Loading

↓

Success

Every major action should communicate completion.

---

# 10. Scroll Motion

Allowed:

- sticky headers
- lazy loading
- subtle reveal animations

Reject:

- scroll hijacking
- excessive parallax
- distracting effects

---

# 11. Gesture Review

On touch devices:

Motion should follow the user's finger.

Examples:

Swipe

↓

Content moves naturally

↓

Release completes interaction

Reject unnatural movement.

---

# 12. Reduced Motion

Verify support for:

```
prefers-reduced-motion
```

Decorative motion should be removed.

Essential feedback should remain.

---

# 13. Brand Motion

Review:

- onboarding
- hero sections
- logo reveals

Brand animation should reinforce identity without slowing users.

---

# 14. Consistency

Ask:

Would this animation feel at home everywhere in the product?

Reject isolated animation styles.

---

# Animation Anti-Patterns

Reject immediately if:

- animations delay interaction
- durations vary randomly
- easing is inconsistent
- elements bounce unnecessarily
- multiple animations compete
- loading loops endlessly
- animation blocks user input
- motion causes layout shift

---

# Animation Quality Score

```
Purpose

25%

Consistency

20%

Performance

20%

Responsiveness

15%

Accessibility

10%

Delight

10%
```

Minimum passing score:

```
95 / 100
```

Anything below **90** requires redesign.

Anything below **80** fails immediately.

---

# Approval Checklist

- [ ] Every animation has a purpose
- [ ] Motion follows the Motion System
- [ ] Performance remains smooth
- [ ] Navigation preserves orientation
- [ ] Components animate consistently
- [ ] Loading communicates progress
- [ ] Reduced-motion support is implemented
- [ ] Motion enhances usability

---

# Final Rule

Users should remember how smooth the product felt—not how flashy its animations were.

Great animation guides attention, builds confidence, and quietly disappears into the overall experience.