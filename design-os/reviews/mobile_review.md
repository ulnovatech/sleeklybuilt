# Mobile QA System
**Version:** 1.0  
**Status:** Review Layer  
**Depends On:** Mobile First, Mobile Intelligence, UX Intelligence, Accessibility Intelligence, Responsive Intelligence

---

# Purpose

The Mobile QA System is the final gate before approving any mobile-first interface.

It ensures the product behaves like a premium mobile application rather than a desktop website compressed onto a phone.

This review exists to eliminate:

- desktop thinking
- poor thumb ergonomics
- cramped layouts
- tiny touch targets
- excessive scrolling
- generic responsive design

The objective is simple:

**Users should mistake the website for a professionally built native application.**

---

# Core Philosophy

Mobile is not a smaller desktop.

It is an entirely different interaction model.

Design for:

- thumbs
- short attention spans
- one-handed usage
- intermittent connectivity
- limited screen space

Desktop is the adaptation.

Mobile is the primary product.

---

# Mobile Review Pipeline

```
Screen Purpose

↓

Thumb Reach

↓

Layout

↓

Navigation

↓

Components

↓

Performance

↓

Accessibility

↓

Approval
```

---

# 1. First Impression

Within three seconds ask:

Can users immediately identify:

- what this screen does?
- what action matters most?
- where they should tap first?

Reject clutter.

---

# 2. Thumb Reach

Primary actions must live inside the natural thumb zone.

Preferred placement:

```
Bottom Navigation

↓

Floating Action

↓

Bottom Sheets

↓

Sticky CTA
```

Avoid placing important controls in the far top corners.

---

# 3. One-Handed Use

Every primary workflow should be completable with one hand.

Review:

- navigation
- forms
- dialogs
- search
- checkout

Reject two-handed workflows unless unavoidable.

---

# 4. Navigation

Preferred:

- Bottom Navigation
- Bottom Sheets
- Context Menus
- Full-screen flows

Avoid:

Desktop navigation patterns squeezed into mobile.

---

# 5. Layout

Review:

- spacing
- hierarchy
- visual rhythm

Reject:

long stacks of identical cards with no hierarchy.

Each screen should have:

- focal point
- breathing room
- logical grouping

---

# 6. Typography

Verify:

- readable sizes
- comfortable line lengths
- strong hierarchy

Reject:

tiny text.

Avoid paragraphs wider than the device comfortably supports.

---

# 7. Touch Targets

Minimum:

```
44 × 44 px
```

Preferred:

```
48 × 48 px
```

Spacing should prevent accidental taps.

---

# 8. Forms

Verify:

- appropriate keyboards
- autofill
- inline validation
- minimal typing

Forms should minimize effort.

---

# 9. Scrolling

Scrolling should feel intentional.

Avoid:

- nested scrolling
- horizontal scrolling
- infinite walls of content

Users should always know where they are.

---

# 10. Gestures

Support:

- swipe
- pull to refresh
- long press
- drag

Only where users naturally expect them.

Never hide critical functionality behind undiscoverable gestures.

---

# 11. Bottom Sheets

Preferred for:

- filters
- actions
- confirmations
- quick editing

They should:

- open smoothly
- respect safe areas
- dismiss predictably

---

# 12. Safe Areas

Respect:

- status bars
- camera cutouts
- dynamic islands
- gesture areas
- rounded corners

Nothing important should be obscured.

---

# 13. Keyboard Experience

When the keyboard appears:

- inputs remain visible
- primary buttons remain reachable
- layout adapts smoothly

Reject layouts where the keyboard hides the active field.

---

# 14. Performance

Review:

- perceived speed
- animation smoothness
- image loading
- scrolling performance

Target:

```
60 FPS
```

Avoid unnecessary rendering.

---

# 15. Connectivity

Handle:

- slow networks
- offline states
- retries
- optimistic updates

Users should always know what is happening.

---

# 16. Accessibility

Verify:

- touch target size
- contrast
- screen reader compatibility
- keyboard support
- reduced motion

Accessibility remains mandatory on mobile.

---

# 17. Platform Feel

Ask:

Does this feel like:

- iOS?
- Android?

without copying either?

The interface should feel native while preserving brand identity.

---

# 18. Premium Experience Test

Compare mentally against products such as:

- Linear
- Notion
- Airbnb
- Stripe
- Apple Wallet
- Uber
- Spotify

Would this screen feel comfortable beside them?

If not:

continue refining.

---

# Automatic Rejection Rules

Reject immediately if:

- desktop layouts appear on mobile
- navigation is difficult to reach
- buttons are too small
- spacing feels cramped
- typography is unreadable
- horizontal scrolling exists
- forms require unnecessary typing
- performance feels sluggish
- keyboard hides important controls
- mobile feels like an afterthought

---

# Mobile Quality Score

```
Thumb Ergonomics

20%

Navigation

20%

Layout

15%

Performance

15%

Typography

10%

Forms

10%

Accessibility

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

- [ ] Mobile-first layout
- [ ] Primary actions are thumb reachable
- [ ] Navigation feels native
- [ ] Typography is comfortable
- [ ] Touch targets meet standards
- [ ] Forms minimize typing
- [ ] Keyboard interactions are smooth
- [ ] Performance is consistently fluid
- [ ] Accessibility passes review
- [ ] The interface feels like a premium mobile app

---

# Final Rule

A mobile interface should never feel like a responsive website.

It should feel like a product that was designed for the phone first, with every interaction optimized for speed, comfort, and confidence.