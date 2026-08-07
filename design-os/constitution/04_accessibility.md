# Accessibility
**Version:** 1.0  
**Status:** Canonical  
**Depends On:** Design Constitution, Design Principles, Quality Bar, Mobile First

---

# Purpose

Accessibility is a core design requirement.

It is not an enhancement.

It is not an optional review step.

Every interface must be designed so that the widest possible range of people can successfully use it.

Accessibility failures are design failures.

---

# Design Philosophy

Design for people.

Not perfect eyesight.

Not perfect hearing.

Not perfect motor control.

Not perfect memory.

Not perfect internet.

Not perfect hardware.

The best interfaces work well for everyone.

---

# Core Principles

Every interface must be:

- Perceivable
- Operable
- Understandable
- Robust

Every design decision should improve at least one of these.

---

# Readability

Text must always be readable.

Prioritize:

- generous line height
- comfortable paragraph width
- adequate font size
- clear hierarchy
- sufficient spacing

Never sacrifice readability for aesthetics.

---

# Typography

Typography must remain readable under:

- increased zoom
- browser scaling
- operating system scaling
- accessibility font settings

Never lock text sizes.

Never prevent scaling.

---

# Contrast

Text must always have sufficient contrast against its background.

Never rely on subtle gray-on-gray combinations.

Never prioritize visual style over readability.

When uncertain,

increase contrast.

---

# Color

Color must never be the only method of communicating information.

Always provide additional cues such as:

- icons
- labels
- text
- patterns
- borders

Users should understand the interface without relying solely on color.

---

# Touch Targets

Interactive elements must be easy to touch.

Minimum size:

44 × 44 px

Preferred:

48–56 px

Provide adequate spacing between interactive controls.

---

# Keyboard Navigation

Every interactive element must be usable without a mouse.

Users should be able to:

- navigate
- activate controls
- submit forms
- dismiss dialogs
- move through menus

using only the keyboard.

---

# Focus

Keyboard focus must always be visible.

Never remove focus outlines without replacing them with an equal or better indicator.

Users should never lose track of where they are.

---

# Screen Readers

Interfaces must expose meaningful information to assistive technologies.

Every meaningful control should have:

- a clear accessible name
- a meaningful role
- useful state information

Avoid generic labels.

---

# Buttons

Buttons must describe their action.

Prefer:

Save Changes

Delete Project

Continue Checkout

instead of:

OK

Submit

Continue

unless the surrounding context makes the action completely obvious.

---

# Links

Links should describe where they lead.

Avoid:

Click here

Learn more

Read this

Prefer:

View Order

Open Settings

Download Invoice

---

# Forms

Forms must:

- clearly identify required fields
- explain validation errors
- preserve user input
- provide helpful instructions
- support autocomplete

Users should never need to guess what is expected.

---

# Error Messages

Errors should:

Explain:

- what happened
- why
- how to fix it

Avoid technical language.

Never blame the user.

---

# Motion

Support reduced motion preferences.

If the operating system requests reduced motion:

Reduce or remove:

- large transitions
- parallax
- unnecessary animations

Maintain functionality without excessive movement.

---

# Flashing Content

Never create content that flashes rapidly.

Avoid effects that could trigger photosensitive conditions.

---

# Audio

Never rely solely on sound.

If audio communicates important information,

provide a visual alternative.

---

# Icons

Icons must support meaning.

They must not replace text unless universally understood.

Whenever possible,

pair icons with labels.

---

# Images

Every meaningful image should have meaningful alternative text.

Decorative images should not create unnecessary screen reader noise.

---

# Tables

Tables should remain understandable when read linearly.

Avoid overly complex structures.

Provide clear headings.

---

# Charts

Charts must communicate information beyond color.

Support:

- labels
- legends
- values
- patterns

Important insights should also appear as text.

---

# Dialogs

Dialogs must:

- receive focus when opened
- trap focus appropriately
- restore focus when closed

Users should never become lost.

---

# Notifications

Notifications should be noticeable without interrupting unnecessarily.

Important notifications should remain available after they appear.

Never depend only on disappearing toast messages for critical information.

---

# Time Limits

Avoid unnecessary time limits.

If time limits exist,

allow users to extend them whenever practical.

---

# Language

Write clearly.

Avoid:

- jargon
- unnecessary abbreviations
- vague labels
- technical terminology

Interfaces should communicate naturally.

---

# Responsive Accessibility

Accessibility must remain intact across:

- phones
- tablets
- laptops
- desktops

Responsive layouts must never reduce accessibility.

---

# Loading States

Loading indicators should communicate progress whenever possible.

Never leave users uncertain about whether the application is working.

---

# Empty States

Empty states should:

Explain:

- why nothing appears
- what users can do next

Reduce uncertainty.

---

# Performance

Performance improves accessibility.

Slow interfaces increase cognitive load.

Optimize:

- rendering
- interaction latency
- responsiveness
- perceived speed

---

# Cognitive Accessibility

Reduce mental effort.

Prefer:

- clear grouping
- simple navigation
- consistent interactions
- predictable layouts
- familiar language

Avoid unnecessary complexity.

---

# Accessibility Checklist

Every interface must satisfy:

## Visual

- [ ] Readable typography
- [ ] Sufficient contrast
- [ ] Scalable text
- [ ] Clear hierarchy

---

## Interaction

- [ ] Keyboard accessible
- [ ] Visible focus
- [ ] Comfortable touch targets
- [ ] Clear navigation

---

## Content

- [ ] Descriptive buttons
- [ ] Meaningful links
- [ ] Helpful labels
- [ ] Helpful instructions

---

## Feedback

- [ ] Helpful errors
- [ ] Accessible notifications
- [ ] Loading feedback
- [ ] Success confirmation

---

## Motion

- [ ] Reduced motion supported
- [ ] No unnecessary animation
- [ ] No flashing content

---

## Assistive Technology

- [ ] Screen reader friendly
- [ ] Semantic structure
- [ ] Meaningful alternative text
- [ ] Accessible dialogs

---

# Final Rule

An interface is not complete until it is usable by people with diverse abilities, devices, environments, and circumstances.

Accessibility is not a feature.

It is a defining characteristic of excellent design.