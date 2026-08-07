# Accessibility Review
**Version:** 1.0  
**Status:** Review Layer  
**Depends On:** Accessibility, Accessibility Intelligence, UX Intelligence, Component Intelligence

---

# Purpose

The Accessibility Review ensures every interface can be used by as many people as possible, regardless of physical, sensory, or cognitive ability.

Accessibility is not an optional feature.

It is a core measure of product quality.

Every release should meet or exceed WCAG 2.2 AA standards unless project requirements demand AAA.

---

# Core Philosophy

Accessible products are better products.

Improving accessibility almost always improves usability, clarity, consistency, and overall user experience.

Accessibility should be considered from the beginning—not added at the end.

---

# Accessibility Review Pipeline

```
Structure

↓

Navigation

↓

Typography

↓

Color

↓

Interaction

↓

Forms

↓

Media

↓

Assistive Technology

↓

Approval
```

---

# 1. Semantic Structure

Verify:

- proper heading hierarchy
- semantic HTML
- landmarks
- lists
- buttons
- links

Avoid:

- clickable divs
- generic containers replacing semantic elements

---

# 2. Keyboard Navigation

Every interactive element must be reachable using only the keyboard.

Verify:

- logical tab order
- visible focus indicators
- keyboard shortcuts (where applicable)
- no keyboard traps

Users should never require a mouse.

---

# 3. Focus Management

Focus should move predictably.

Examples:

Opening a dialog:

```
Open Button

↓

Dialog

↓

First Interactive Element
```

Closing the dialog:

```
Dialog

↓

Original Trigger
```

Focus should never disappear.

---

# 4. Color Contrast

Verify minimum contrast ratios:

Normal text:

```
4.5 : 1
```

Large text:

```
3 : 1
```

Interactive controls must remain distinguishable.

Never rely on color alone.

---

# 5. Typography

Review:

- readable font sizes
- scalable text
- sufficient line spacing
- paragraph spacing

Users should be able to zoom without breaking layouts.

---

# 6. Touch Targets

Minimum recommended size:

```
44 × 44 px
```

Preferred:

```
48 × 48 px
```

Spacing between controls should prevent accidental taps.

---

# 7. Forms

Verify:

- visible labels
- descriptive helper text
- accessible validation
- error announcements
- autocomplete where appropriate

Never rely on placeholders as labels.

---

# 8. Images

Every meaningful image requires:

Alternative text.

Decorative images should be ignored by assistive technologies.

Charts require text summaries.

---

# 9. Icons

Interactive icons require:

- accessible labels
- meaningful names

Decorative icons should remain hidden from screen readers.

---

# 10. Motion

Support:

```
prefers-reduced-motion
```

Reduce:

- animations
- parallax
- continuous movement

Essential motion should remain functional.

---

# 11. Audio and Video

Provide:

- captions
- transcripts
- pause controls

Autoplay should be avoided whenever possible.

---

# 12. Screen Reader Review

Test:

- headings
- landmarks
- buttons
- forms
- navigation
- dialogs

The interface should make sense without vision.

---

# 13. Responsive Accessibility

Verify accessibility across:

- mobile
- tablet
- desktop

Accessibility should never degrade on smaller screens.

---

# 14. Error Communication

Errors should explain:

- what happened
- why
- how to fix it

Screen readers should announce validation errors immediately.

---

# 15. Status Messages

Examples:

Saving...

Saved successfully.

Upload complete.

These should be announced to assistive technologies when appropriate.

---

# 16. Time Limits

If sessions expire:

Warn users.

Allow extensions whenever possible.

Avoid unexpected data loss.

---

# 17. Cognitive Accessibility

Reduce cognitive effort.

Review:

- simple language
- predictable layouts
- consistent terminology
- progressive disclosure

Avoid overwhelming users.

---

# Accessibility Anti-Patterns

Reject immediately if:

- focus is invisible
- contrast fails WCAG
- keyboard navigation is incomplete
- labels are missing
- dialogs trap users
- color communicates information alone
- clickable elements are too small
- semantic HTML is ignored

---

# Accessibility Quality Score

```
Keyboard Support

20%

Semantic Structure

20%

Contrast

15%

Forms

15%

Touch Targets

10%

Screen Reader Support

10%

Motion

5%

Media

5%
```

Minimum passing score:

```
95 / 100
```

Anything below **90** requires redesign.

Anything below **80** fails immediately.

---

# Approval Checklist

- [ ] Semantic HTML is used correctly
- [ ] Keyboard navigation is complete
- [ ] Focus is always visible
- [ ] Contrast passes WCAG AA
- [ ] Touch targets meet minimum size
- [ ] Forms are fully accessible
- [ ] Images include appropriate alt text
- [ ] Motion respects reduced-motion settings
- [ ] Screen reader testing passes
- [ ] Mobile accessibility is fully supported

---

# Final Rule

Accessibility is not about designing for a small group of users.

It is about removing unnecessary barriers so every user has an equal opportunity to succeed.

A product cannot be considered world-class unless it is accessible.