# Responsive Intelligence
**Version:** 1.0  
**Status:** Intelligence Layer  
**Depends On:** Product Classifier, Mobile First, Mobile Intelligence, Layout Intelligence, Grid System, Accessibility Intelligence

---

# Purpose

Responsive Intelligence decides how an experience changes as available space and input capability change.

It answers:

- where the breakpoints are, and why those values and no others
- what transforms and what merely scales
- how information density changes, and what the extra space is spent on
- how navigation changes form without changing meaning
- how the interface adapts to touch, mouse, keyboard, and stylus
- which capabilities are detected, and which assumptions are forbidden

Mobile Intelligence designs the mobile experience.

Responsive Intelligence decides how that experience grows, and what it must never become.

---

# Core Philosophy

There are no devices. There is only available space and available capability.

A breakpoint is not a phone, a tablet, or a laptop.

A breakpoint is the width at which the content stops working, or starts being wasted.

Design the smallest viable experience first, then let the content tell you when it needs to change.

Any other method produces a layout that is correct on the machines it was tested on and broken everywhere else.

---

# Responsive Decision Pipeline

Every interface follows:

```
Content Inventory

↓

Minimum Usable Dimensions

↓

Smallest Viable Layout

↓

Content Stress Test

↓

Breakpoint Discovery

↓

Transformation Decisions

↓

Density Decisions

↓

Navigation Metamorphosis

↓

Input Modality Decisions

↓

Capability Adaptation

↓

Handoff to Layout Patterns
```

Never begin with a device list.

---

# Step 1 — Inventory Content and Its Minimum Dimensions

Before any breakpoint can be chosen, every content type on the screen must declare the space it needs to remain usable.

Establish minimums:

- Running text: 45 to 75 characters per line, with roughly 66 as the comfortable target. Below 45 the eye returns too often; above 75 it loses the line.
- Body type: 16px minimum at every size. Text is never reduced to make a layout fit.
- Interactive controls: 44px minimum in both dimensions for coarse pointers, with adequate separation between adjacent targets.
- Table columns: the minimum width at which each column's real values do not wrap into ambiguity, measured against the longest realistic value, not the shortest.
- Charts: the minimum plot width at which the number of points remains distinguishable and axis labels remain legible without rotation.
- Images: the natural aspect ratio and the smallest size at which the subject is still identifiable.
- Monospaced content such as code, references, or identifiers: the character count that must not wrap, since wrapped identifiers become unreadable.
- Form fields: the width at which the expected input is fully visible, since a field that hides what was typed cannot be verified.

Rule: use the longest realistic content, not sample content. Layouts break on real names, real prices, real translations, and real error messages.

Rule: allow for text expansion when the product is or may be localised, since many languages require noticeably more space than English for the same string.

---

# Step 2 — Establish the Smallest Viable Layout

Design the layout that works at the smallest width the product must support.

Baseline requirements:

- Content must be usable at 320 CSS pixels of width with no two-dimensional scrolling, which is also the width the interface reduces to when a desktop page is zoomed to 400%.
- One column, single vertical flow.
- The primary action reachable without hunting.
- No horizontal page scrolling, at any width, for any reason.

This layout is the contract. Everything above it is an enhancement, and every enhancement must be removable without breaking the experience.

Consequence of designing the largest layout first: the small layout becomes a subtraction exercise, and the decisions about what to remove are made under pressure rather than by priority.

---

# Step 3 — Stress the Content

Before discovering breakpoints, expose the layout to the conditions that will actually occur.

Stress conditions:

- longest and shortest realistic values in every field
- a single item, and a very large number of items
- a missing image, a missing value, and a failed region
- the longest translated label
- user font-size preference increased
- browser zoom at 200% and at 400%
- landscape orientation on a short viewport, with an on-screen keyboard occupying part of it
- a window resized continuously rather than jumping between fixed widths

Rule: a layout that only works at the exact widths it was designed at is not responsive. It is a set of fixed layouts.

---

# Step 4 — Discover Breakpoints From Content

Breakpoints are found, not chosen. Resize the smallest viable layout continuously and record the width at which something stops working or starts being wasted.

## Legitimate Breakpoint Triggers

- Running text exceeds 75 characters per line, requiring a maximum width or a second column.
- Two panels can each meet their minimum usable width, enabling a list and detail relationship in place of navigation between them.
- A grid's final row leaves an awkward orphan, requiring a different column count.
- A table exceeds available width, requiring transformation or column prioritisation.
- Navigation items no longer fit horizontally without truncation, requiring collapse.
- A form label and its field can sit side by side without either becoming cramped.
- An image at its natural aspect ratio leaves dead space, or crops away its subject.
- A chart's legend competes with its plot area for space.
- The primary action is no longer reachable in the same gesture as the content it applies to.

## Illegitimate Breakpoint Triggers

- A device's screen dimensions.
- A popular framework's default values.
- The width of the designer's monitor.
- A round number chosen because it is memorable.

Device widths are guesses that were wrong when they were written and are more wrong now. They break on foldables, on split-screen multitasking, on browser windows occupying half a large display, on tablets in portrait with a persistent sidebar, on desktop browsers at high zoom, and on every screen size released after the guess was made.

## Breakpoint Rules

- Express breakpoints in relative units so they respond to the user's font size. A layout that changes at a fixed pixel width ignores a reader who has increased their type size, which is precisely the reader who needs the change to happen sooner.
- Aim for three to five breakpoints. More than that usually indicates the smallest layout was never resolved.
- Name breakpoints after the change they produce, such as the point at which the body becomes two columns or navigation becomes persistent. Never name them after devices, because the name becomes an assumption and the assumption becomes a bug.
- Add a breakpoint only when a real trigger was observed. Every breakpoint is permanent maintenance cost.

## Component-Level Breakpoints

A component that appears in more than one slot must respond to its container, not to the viewport.

Rule: if a card appears both in a wide main region and in a narrow sidebar, its layout decisions belong to the component and are driven by its own available width. Viewport-driven rules will make it correct in one slot and wrong in the other.

---

# Step 5 — Decide Transformation Versus Scaling

Not every change of width is the same kind of change.

## Scale When

- proportion carries meaning, as with images, media, and diagrams
- the content structure remains valid and only its size changes
- the interaction model is unchanged

## Transform When

- the interaction model changes, for example hover to tap
- the reading order needs to change
- a container can no longer hold its content at any legible size
- additional space enables a fundamentally better arrangement, such as adjacency replacing navigation

Common transformations, decided at this layer and implemented by the Layout System:

- a table becomes a list of records when the reader is scanning one record at a time
- a persistent sidebar becomes bottom navigation, or a drawer, depending on switching frequency
- a hover menu becomes a tap-revealed sheet
- a multi-column form becomes a single column
- horizontal tabs become an accordion or a select
- a centred modal becomes a full-height sheet
- a detail panel becomes a separate view

## Prohibited Responses to Reduced Width

- reducing text size to fit
- allowing horizontal page scrolling
- removing functionality
- maintaining two separate implementations of the same screen

## The Content Parity Rule

Capability must be identical at every width. Presentation may change; the feature set may not.

Rule: if something is hidden at a small width, it was either unnecessary at every width, or the small layout is incomplete. Decide which and act accordingly.

The only legitimate exception is a capability that genuinely depends on an input method or platform feature that is absent, such as multi-item drag arrangement. In that case an equivalent alternative is required, not an apology.

Consequence of breaking parity: the user learns the product is less capable on the device they use most, and adopts a competitor that is not.

---

# Step 6 — Decide Density Shifts

Density is a decision at each breakpoint, not a byproduct of available pixels.

## What Additional Space Buys

- comparison, by placing related information side by side
- context, by keeping a detail visible alongside its source
- fewer navigations, by putting a destination in place
- more rows or records visible at once, where scanning is the task
- persistent controls that were previously behind a disclosure

## What Additional Space Must Not Buy

- proportionally larger body text
- proportionally larger spacing everywhere
- decorative regions
- more metrics, cards, or panels simply because they fit

## Scaling Discipline

- Body text stays at or near its minimum comfortable size at every width. Long-form reading may increase modestly, by a point or two, and no more.
- Spacing may grow more than type, because the relationship between elements needs more separation as the canvas widens.
- Headings may grow substantially, since their job is hierarchy and they are read at a glance.
- Never scale an entire interface by a single multiplier. Type, spacing, and structure have different relationships to available space.

Rule: density should increase as space increases for productivity products, and remain generous for reading and marketing products. The Product Classifier's density decision governs which.

---

# Step 7 — Decide Navigation Metamorphosis

Navigation changes form more than any other element. The form changes; the model must not.

| Structure | Small width | Medium width | Large width |
| --- | --- | --- | --- |
| 3–5 sections, frequent switching | Bottom navigation | Horizontal top navigation | Persistent sidebar or top navigation |
| Many sections, hierarchical | Drawer plus search | Collapsible sidebar | Grouped persistent sidebar |
| Content-heavy, flat | Search-first with categories | Search plus visible categories | Search plus sidebar filters |
| Single linear task | Progress indicator only | Progress plus step labels | Steps plus persistent summary |
| Two-level workspace | Separate views | List and detail side by side | List, detail, and inspector |

## Rules

- The active location must be identifiable at every width. Losing the sense of place is the most common responsive navigation failure.
- Labels must not change between widths. Renaming a section between layouts breaks recall and makes support impossible.
- Never run two navigation systems simultaneously, such as a visible sidebar and a bottom bar.
- Never hide the primary navigation behind a menu at a width where it would fit, because a hidden section is used far less than a visible one.
- Search-first navigation is legitimate at every width when the content set is large and flat, and it should not be replaced by a menu simply because a menu now fits.

Detailed navigation selection belongs to Navigation Intelligence; the metamorphosis chain belongs here.

---

# Step 8 — Decide for Input Modality

Width tells you nothing about how the interface will be operated. A large screen may be touch-operated; a small window may be driven by a keyboard and a trackpad.

Design for input capability, and assume more than one is present.

## Touch

- 44px minimum targets, with clear separation between adjacent actions.
- No dependence on hover for any information or action.
- Immediate visual response on press, because there is no cursor to indicate readiness.
- Frequent actions positioned within comfortable reach rather than at the top of a tall screen.
- Gestures are enhancements with a visible alternative, never the only route to a function.

## Mouse and Trackpad

- Smaller controls are acceptable, and hover affordances are permitted.
- Hover may reveal secondary detail, never primary content or a required action.
- Right-click context menus may exist as an accelerator with an equivalent visible control.
- Precise interactions such as resizing and fine selection become available.

## Keyboard

- A complete and logical focus order at every width and in every layout.
- A visible focus indicator that survives every theme and background.
- Escape closes overlays; Enter confirms; focus returns to its origin on close.
- Focus must be trapped inside modal surfaces and released correctly.
- Shortcuts and command palettes are appropriate where a physical keyboard is likely, and must never be the only route to a function.
- A skip link to main content on pages with substantial navigation.

## Stylus

- Precision is available, but reliable hover often is not. Treat a stylus as a fine pointer without dependable hover.
- Palm contact is possible, so large passive areas must not trigger actions.

## Hybrid and Alternative Input

- Devices with both touch and pointer are common. Do not lock into a mode after the first input; adapt per interaction.
- Directional and remote input requires a clear focus model and generous target areas.
- Assistive technology and voice control require correct semantics and accessible names, which is an accessibility requirement handled with Accessibility Intelligence.

Rule: every function must be operable by touch, by pointer, and by keyboard. A function available to only one modality is a defect, not a specialisation.

---

# Step 9 — Adapt to Capability, Not Device

Never branch layout or behaviour on a user agent string. It is unreliable, it is spoofed, and it encodes assumptions that expire.

Detect capability instead.

## Legitimate Signals

- Available viewport dimensions, including safe areas that must not be occupied by controls.
- Container dimensions for component-level decisions.
- Pointer precision, coarse or fine, and whether hover is available at all.
- Reduced-motion preference.
- Colour scheme preference.
- Contrast preference.
- User font-size preference.
- Data-saving preference and connection quality, as a hint for asset weight.
- Presence of a specific capability such as a camera or file system access, tested by feature rather than inferred from platform.

## Forbidden Assumptions

- Small width means touch.
- Large width means mouse.
- Small width means a slow connection.
- Large width means an unmetered connection.
- Touch capability means no keyboard.
- Mobile means a short session.
- A particular platform implies a particular screen size.

## Progressive Enhancement Rules

- Core content and core actions must work before any measurement-dependent enhancement runs.
- A layout that depends on measuring the viewport in script must have a correct default before that measurement resolves, or the interface will visibly reflow on every load.
- Enhancements degrade to the baseline, never to a broken state.
- Load only what the current layout renders. Do not download a wide-layout chart library or an oversized image for a narrow layout.

---

# Orientation and Window Decisions

- Never lock orientation unless the task genuinely requires it, such as a scanning viewfinder.
- Landscape on a phone has very little height. Avoid vertically centred hero sections and full-height panels, since the content will be unreachable.
- An on-screen keyboard consumes a large share of a short viewport. The focused field and its validation message must remain visible while typing.
- Split-screen and half-width desktop windows produce narrow widths on physically large, pointer-driven devices. This is exactly the case that device-based breakpoints fail.
- Foldables introduce hinges and abrupt dimension changes. Layouts must survive a resize mid-interaction without losing state.

Rule: a layout must survive continuous resizing at any moment, including during data entry.

---

# Responsive Typography Decisions

- Set a minimum and a maximum size for each role, derived from measured legibility, and allow fluid interpolation between them. Uncapped fluid type becomes either unreadably small or absurdly large at the extremes.
- Keep measure under control with a maximum content width rather than by reducing type size.
- Line height needs to be more generous for longer measures and may tighten slightly for short measures and large headings.
- Never reduce line height to fit content into a viewport.
- Respect user font-size preferences by sizing in relative units, which means a reader's larger type triggers layout changes earlier, exactly as it should.

Detailed scales belong to the Typography System and Typography Intelligence.

---

# Responsive Media Decisions

Two distinct decisions are often confused.

## Resolution Switching

The same crop at different sizes, chosen for the display density and layout width.

Use when the image works at every aspect ratio required.

## Art Direction

A different crop, or a different image, at different widths.

Use when the subject is lost by scaling, which happens with wide scenic images at narrow widths, with images containing text, and with images whose subject is off-centre.

## Rules

- Reserve the space an image will occupy so the layout does not shift when it loads.
- Below-fold media loads lazily; above-fold media does not.
- Decorative media is omitted at narrow widths only when it is genuinely decorative, which must be a deliberate classification rather than a convenience.
- Video that autoplays must never do so on a metered or data-saving connection.

---

# Responsive Data Display Decisions

Tables are where responsive design most often fails. Decide by task, not by width.

- Scanning one record at a time: transform each row into a record block, with labels beside values.
- Comparing values across records: preserve the tabular structure and allow horizontal scrolling within the table only, with the identifying column held in place and a visible affordance showing more exists.
- Many columns of unequal value: rank columns by decision value, show the top ranks at narrow widths, and make the remainder available on demand. This ranking is a decision, not a truncation.
- Aggregated summary needed at narrow widths: show the summary and provide the detail on request.

Rules:

- Horizontal scrolling is acceptable inside a table and nowhere else.
- Never reduce table type size to fit more columns.
- Never allow a table to widen the page, which produces whole-page horizontal scrolling.

Charts follow the same principle: reduce series, points, and labels rather than sizes, and provide the underlying values as a table at every width. Implementation belongs to the Data Display System and the Charts Component.

---

# Responsive Form Decisions

- Single column at every width. Multi-column forms cause fields to be missed, and the extra width is better spent on help text or a persistent summary.
- Side-by-side labels only when both label and field exceed their minimum widths comfortably.
- Related short fields may share a row when they are conceptually one value, such as expiry month and year.
- Field width should suggest the expected input length, since a full-width field for a two-digit value invites the wrong answer.
- Validation messages must appear next to their field and remain visible with the keyboard open.
- Never place the submit action where a keyboard or a sticky element can cover it.

---

# Responsive Overlay Decisions

Overlays change kind, not only size, as space changes.

- A short, focused confirmation stays a centred dialog at every width, because it is small enough to fit anywhere.
- A form or a filter set becomes a full-height sheet at narrow widths, since a centred dialog with an on-screen keyboard leaves almost nothing visible.
- A detail overlay becomes an adjacent panel once two regions both meet their minimum usable widths, which removes the overlay entirely and is the better outcome.
- A menu triggered by hover becomes a tap-revealed surface wherever hover is unavailable.

Rules:

- An overlay must never exceed the viewport height with its action out of reach. If it does, it is a view, not an overlay.
- Dismissal must be available by an explicit control at every width, because gesture-only dismissal is undiscoverable and unavailable to keyboard users.
- Never stack overlays. If a second overlay is required, the flow needs a view.

Behaviour belongs to the Dialogs and Bottom Sheets components.

---

# Responsive Disclosure Decisions

Progressive disclosure is a density lever, and it must be applied consistently across widths.

Decisions:

- Which content is disclosed by default at each width, based on what the primary task needs rather than on what fits.
- Whether a section collapsed at a narrow width is expanded at a wide one, which is usually correct when space allows and the content is frequently needed.
- Whether disclosure state persists across widths and across visits.

Rules:

- Disclosure hides detail, never capability. A collapsed section is still reachable; a removed section is not.
- Default states must be identical in meaning at every width, so a reader moving between devices is not surprised by what is open.
- Never nest disclosure more than two levels deep at narrow widths, because the reader loses track of where the content lives.

---

# Responsive State Preservation

Layout transitions are where state is quietly lost, and this is one of the most damaging responsive defects because the user is blamed for it.

State that must survive a width change, a rotation, and a window resize:

- scroll position, or the nearest equivalent anchor when the layout changed
- current selection in a list or table
- all entered form data, including partially completed fields
- open panel, expanded section, and active tab
- applied filters, sort order, and time range
- the record currently being viewed, when a detail view becomes an adjacent panel

Rules:

- A resize during data entry must never discard input.
- When a detail view becomes an adjacent panel, the same record stays open. Returning the reader to the list is a loss of place.
- When two panels collapse into one view, the reader lands on the panel they were using, not on the default.

---

# Responsive Performance Decisions

Available width is not a proxy for available bandwidth, but layout does determine cost.

Decisions:

- Which assets belong to which layout, so a narrow layout never downloads a wide-layout image, chart library, or map.
- Whether a heavy region loads on demand rather than on arrival, which is usually correct for anything below the first screen.
- What the interface shows while a layout-dependent region resolves, so nothing shifts when it arrives.

Rules:

- Never serve both layouts and hide one. Hidden content is downloaded content, and it costs the reader on every visit.
- Reserve the space every asynchronous region will occupy, because layout shift is most severe on narrow layouts where a single element dominates the viewport.
- Treat a wide, pointer-driven layout as potentially bandwidth-constrained. A large monitor on a poor connection is common.

---

# Documenting Breakpoint Decisions

Breakpoints outlive the people who chose them, and an undocumented breakpoint becomes a value nobody dares change.

Record, for each breakpoint:

- its value in relative units
- the content trigger that produced it
- what transforms at it
- what the density change is spent on

Rule: a breakpoint whose reason is not recorded will eventually be duplicated, moved, or copied into a component where its trigger does not apply.

---

# Verification Decisions

Decide what must be verified before the responsive behaviour is accepted.

Verify at:

- the smallest supported width, at 320 CSS pixels
- each discovered breakpoint, and immediately on both sides of it
- continuous resizing, not fixed jumps
- 200% and 400% zoom
- increased user font size
- landscape on a short viewport with the keyboard open
- a narrow window on a large pointer-driven display
- a large touch-operated display
- keyboard-only operation at every width

Rule: verification at device presets alone is insufficient, because the failures occur between the presets.

Formal sign-off belongs to the Responsive Review and the Mobile Review.

---

# Handoff

When these decisions are resolved, hand off:

- column structure and gutters to the Grid System
- container widths and regional structure to the Layout System
- navigation form to the Navigation System
- transformation behaviour of tables and charts to the Data Display System
- overlay and sheet behaviour to the Dialogs and Bottom Sheets components
- touch and reach decisions to Mobile Intelligence
- focus, semantics, and preference handling to Accessibility Intelligence
- verification to the Responsive Review

Responsive Intelligence does not specify layouts, components, or QA steps.

---

# Responsive Intelligence Output

Example:

```
Product

Warehouse Inventory Console


Density Requirement

High — scanning and comparison are the primary tasks


Smallest Viable Layout

320 CSS pixels, single column, no horizontal page scroll


Content Minimums

Body measure 45–75 characters
Body type 16px at all widths
Touch targets 44px
Item code column must not wrap — 14 characters
Stock table identifying column minimum 12 characters
Trend chart minimum plot width for 30 points


Breakpoints Discovered

38rem — item cards move from one column to two, orphan row resolved
48rem — filters move from sheet to persistent rail, both meet minimums
64rem — list and detail meet minimum widths simultaneously
90rem — stock table shows all ranked columns without scrolling

Named by change, not by device


Component-Level Rules

Item card responds to its container, since it appears in the main
region, the detail panel, and the picking sidebar


Transformations

Stock table → record blocks below 48rem, tabular with held
identifying column above
Filter sheet → persistent rail at 48rem
Detail view → adjacent panel at 64rem
Tabs → accordion below 38rem


Scaling

Images scale, charts scale plot area and reduce series count


Content Parity

Full capability at every width, including bulk adjustments


Density Shifts

Rows visible increases with width
Body type constant, spacing grows, headings grow


Navigation Metamorphosis

Bottom navigation → top navigation at 48rem → grouped sidebar at 64rem
Labels identical at every width
Command palette available whenever a physical keyboard is present


Input Modality

Touch — 44px targets, no hover dependency, press feedback
Pointer — hover reveals row actions already available in the row menu
Keyboard — full focus order, shortcuts for scan and adjust, skip link
Stylus — treated as fine pointer without hover, palm areas inert
Hybrid — adapts per input, never locks to a mode


Capability Adaptation

Pointer precision and hover availability detected
Reduced motion, colour scheme, and contrast preferences respected
Chart library loads only where a chart renders
No user agent branching


Orientation

Never locked — scanner view usable in landscape with short height


Media

Item photography uses resolution switching
Warehouse map uses art direction, cropped to aisle at narrow widths


Verification

320px, each breakpoint boundary, continuous resize, 200% and 400% zoom,
increased font size, landscape with keyboard, narrow desktop window,
large touch display, keyboard-only


Handoff

Grid System, Layout System, Navigation System, Data Display System


Review

Pass
```

---

# Failure Conditions

Responsive Intelligence fails when:

- Breakpoints were copied from device dimensions or framework defaults.
- Breakpoints are fixed in pixels and ignore user font-size preferences.
- The largest layout was designed first and the smallest was derived by subtraction.
- Text is reduced in size to make content fit.
- The page scrolls horizontally at any width.
- Functionality disappears at narrow widths.
- Two implementations of the same screen exist for two widths.
- A component responds to the viewport when it should respond to its container.
- Additional width is spent on larger text and more padding rather than on comparison and context.
- Navigation labels or structure change meaning between widths.
- Two navigation systems are visible at once.
- Hover is required to reach information or an action.
- Touch is assumed from small width, or a pointer from large width.
- Layout branches on a user agent string.
- A table widens the page instead of transforming or scrolling within itself.
- The layout breaks when the window is resized during data entry.
- Selection, filters, or entered data are lost when a layout transition occurs.
- Both layouts are downloaded and one is hidden.
- Verification happened only at device presets.

---

# Review Questions

Before approval:

- Can every breakpoint be justified by a content trigger that was observed?
- Does the interface work at 320 CSS pixels and at 400% zoom?
- Does a reader with larger type get the layout change earlier?
- Is every capability present at every width?
- Is anything hidden that should never have existed?
- Does extra space buy comparison and context, or only air?
- Is the current location always identifiable, whatever form navigation has taken?
- Can every action be completed by touch, by pointer, and by keyboard?
- Does anything depend on hover?
- Does the layout survive continuous resizing, including mid-interaction?
- Would this interface still be correct on a screen size that does not exist yet?

---

# Final Rule

Responsive design is not a set of layouts for a set of devices.

It is one experience that understands its own content, listens to the space it is given, and adapts to how it is being operated.

Decide from the content and the capability, and the interface will be correct on hardware nobody has designed yet.
