# Authentication Flow Pattern
**Version:** 1.0  
**Status:** Pattern Layer  
**Depends On:** Authentication Component, Forms System, Feedback System, Mobile First, Accessibility Intelligence, UX Intelligence  
**Gated By:** Security Review

---

# Purpose

The Authentication Flow Pattern defines the complete solution for every screen between a stranger and their account.

Authentication is the only part of a product every single user must complete before receiving any value.

It is therefore the highest-leverage friction in the product and the least forgiving place to be creative.

A user who cannot sign in does not evaluate the feature set. They leave, and they blame the whole product for a form.

The goal is not security theatre and it is not one-tap magic. The goal is that a legitimate user reaches their account on the first attempt, and that every failed attempt tells them precisely what to do next.

---

# When To Use

Use this pattern when:

- the product stores anything belonging to an individual user
- data is scoped per account, organisation, or tenant
- actions must be attributable to a person
- billing, permissions, or history exist
- a session must be able to end

---

# When Not To Use

Do not use this pattern when:

- the content is entirely public and personalisation adds no value
- a share link with an expiry satisfies the requirement
- the only reason for accounts is analytics collection
- the user is completing a single anonymous transaction — support guest flows instead

The most common product mistake is requiring an account before the user has seen anything worth creating an account for.

Let people reach value first. Ask for the account at the moment it protects something they now own.

---

# User Goal

The primary goal is always one of five:

```
Get into my account

↓

Create an account with minimum effort

↓

Recover access I have lost

↓

Prove it is me without being interrogated

↓
Understand why I was signed out
```

Nobody's goal is to authenticate. Authentication is a toll, and every screen in this pattern must justify its existence as necessary toll collection.

---

# User Journey

```
Encounters a gate

↓

Chooses sign in or sign up

↓

Provides credentials or picks a provider

↓

Verifies identity if required

↓

Lands on the destination they originally wanted

↓

Works until the session ends

↓

Re-authenticates without losing work
```

The second-to-last and last steps are the ones products forget.

A user who is signed out mid-task and returns to a blank home screen has lost their work twice: once to the session, once to the interface.

---

# UX Flow

## Entry

The user arrives from:

- a marketing call to action, intending to sign up
- a bookmark or app launch, intending to sign in
- a deep link to protected content, intending to reach that content
- an invitation email, intending to join an existing organisation
- an expired session, intending to resume

Each entry demands a different first screen. The deep link path must return the user to the original destination after success, never to a generic home.

---

## Identify

Ask for the identifier first.

```
Email or username

↓

Determine which methods this account uses

↓

Present only those methods
```

Identifier-first is preferred because it lets the product show the right second step: a password field, a single sign-on redirect, or a passkey prompt. Presenting all methods at once forces every user to read every option.

---

## Authenticate

Support at minimum:

- password
- one social or enterprise provider, where the audience uses one
- a passwordless email link, where the audience is non-technical

Rules:

- The method the user used last time is shown first and remembered per device.
- Never show more than three authentication choices on one screen. Additional methods live behind "Other ways to sign in".
- Social buttons state the provider name, never only its logo.

---

## Verify

Verification exists for three different reasons and each needs different copy:

```
Confirming an email address is reachable

↓

Confirming a second factor at sign in

↓

Confirming identity before a sensitive action
```

Never reuse one screen for all three. A user re-authenticating before deleting their account needs to know that is what is happening.

---

## Recover

Recovery is a first-class flow, not a link in small text.

```
Request reset

↓

Confirm the message was sent

↓

Open the link

↓

Set a new credential

↓

Land signed in, at the original destination
```

Finish recovery signed in. Forcing a user who just proved ownership of the inbox and set a new password to then sign in with it is a gratuitous extra step.

---

## Maintain

Sessions must expire, but expiry must never destroy work.

```
Session nears expiry

↓

Warn before it ends

↓

Offer inline extension

↓

If it lapses, preserve draft state

↓

Re-authenticate in place

↓

Resume exactly where the user was
```

---

# Screen Layout

## Mobile

```
┌──────────────────────────┐
│         [ logo ]         │
│                          │
│  Sign in                 │
│  New here? Create account│
├──────────────────────────┤
│ Email                    │
│ ┌──────────────────────┐ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ Password         Show    │
│ ┌──────────────────────┐ │
│ │                      │ │
│ └──────────────────────┘ │
│ Forgot password?         │
│                          │
│ ┌──────────────────────┐ │
│ │      Sign in         │ │
│ └──────────────────────┘ │
│                          │
│ ──────── or ───────────  │
│ [ Continue with Google ] │
├──────────────────────────┤
│ Terms · Privacy · Help   │
└──────────────────────────┘
```

Mobile rules:

- Single column, one card, no horizontal scroll at any width down to 320px.
- The primary button sits above the keyboard fold when the last field is focused.
- Email fields use the email keyboard with autocapitalisation off and autocorrect off.
- One-time codes use a numeric keyboard and single-field autofill from SMS or authenticator.
- No modal authentication on mobile. Modals collapse when the keyboard opens.
- Password managers must be able to fill the form: standard autocomplete tokens on every field.

---

## Tablet

```
┌────────────────────────────────────────────┐
│                  [ logo ]                  │
│                                            │
│    ┌──────────────────────────────────┐    │
│    │ Sign in                          │    │
│    │ New here? Create account         │    │
│    │                                  │    │
│    │ Email                            │    │
│    │ [                              ] │    │
│    │ Password              Show       │    │
│    │ [                              ] │    │
│    │ Forgot password?                 │    │
│    │ [          Sign in             ] │    │
│    │ ─────────── or ────────────────  │    │
│    │ [ Continue with Google         ] │    │
│    └──────────────────────────────────┘    │
│         Terms · Privacy · Help             │
└────────────────────────────────────────────┘
```

The card is centred with a maximum width around 420px. Wider cards make short fields look broken.

---

## Desktop

```
┌───────────────────────────┬────────────────────────────────┐
│                           │            [ logo ]            │
│  Context panel            │                                │
│                           │  Sign in                       │
│  One sentence of value     │  New here? Create account      │
│  Optional proof line      │                                │
│                           │  Email                         │
│  Never a rotating         │  [                           ] │
│  carousel                 │  Password            Show      │
│                           │  [                           ] │
│                           │  Forgot password?              │
│                           │  [         Sign in           ] │
│                           │  ────────── or ─────────────   │
│                           │  [ Continue with Google      ] │
│                           │                                │
│                           │  Terms · Privacy · Help        │
└───────────────────────────┴────────────────────────────────┘
```

Desktop rules:

- The form column never widens beyond the mobile card width. Space becomes context, not longer fields.
- The context panel is static. Animated marketing beside a password field is a distraction at the worst moment.
- On narrow desktop windows the context panel drops entirely rather than compressing.

---

# Component Hierarchy

```
AuthLayout
├── BrandMark
├── ContextPanel                 desktop only, static
└── AuthCard
    ├── AuthHeader
    │   ├── Title
    │   └── ModeSwitchLink
    ├── ProviderGroup
    │   └── ProviderButton ×n     max 3 visible
    ├── Divider
    ├── AuthForm
    │   ├── IdentifierField
    │   ├── PasswordField
    │   │   ├── VisibilityToggle
    │   │   └── StrengthMeter     sign up only
    │   ├── OtpField              verify step only
    │   ├── RememberDeviceToggle
    │   ├── FieldError ×n
    │   ├── FormError
    │   └── SubmitButton
    ├── RecoveryLink
    ├── ResendControl             verify step only
    └── LegalFooter
        ├── TermsLink
        ├── PrivacyLink
        └── SupportLink

SessionExpiryDialog
├── ExplanationText
├── PasswordField
├── ExtendAction
└── SignOutAction
```

Reuse rules:

- One `AuthCard` serves sign in, sign up, verify, reset request, and reset completion. Steps change content, never structure.
- `PasswordField` is a single component. The strength meter is a variant, not a second component.
- The session expiry dialog reuses the same field components as the sign-in form so autofill behaves identically.

---

# Interaction Flow

Every interaction resolves:

```
Action

↓

Immediate feedback

↓

Result

↓

The user knows exactly what to do next
```

## Sign Up

1. Ask for the minimum: email and password, or a single provider button. Name and company are collected after first value, not before.
2. Password requirements are visible before typing, not revealed as errors afterwards.
3. Strength feedback updates as the user types and never blocks submission for style preferences.
4. Submit disables itself and shows "Creating account…" while remaining focus-visible.
5. On success, sign the user in immediately and route to the destination or to onboarding. Never route to a sign-in screen.
6. Email verification is requested in the product with a persistent banner, not as a wall before first use, unless the product's risk profile requires the wall.

## Sign In

1. Submit is enabled whenever both fields have content; validity is decided by the server.
2. On submit, the button enters a loading state and both fields become read-only rather than disabled, so screen readers still announce their values.
3. On success, route to the originally requested destination.
4. On failure, the error appears above the fields, focus moves to the error, and the password field is cleared while the identifier is preserved.

## Wrong Password

1. The message is deliberately non-specific: "Email or password is incorrect."
2. Never disclose whether the account exists.
3. Offer the two useful next actions: reset the password, or try a different sign-in method if the account has one.
4. Preserve the email so the user can retry with one keystroke.

```
┌──────────────────────────────────────┐
│ ⚠ Email or password is incorrect.    │
│   Reset your password, or sign in    │
│   with Google if you used that       │
│   before.                            │
└──────────────────────────────────────┘
```

## Locked Account

After the defined number of failures, lock and explain honestly.

```
┌──────────────────────────────────────┐
│ 🔒 Too many attempts                 │
│                                      │
│    Sign in is paused for 15 minutes  │
│    to protect this account. You can  │
│    reset your password now instead — │
│    that unlocks it immediately.      │
│                                      │
│    [ Reset password ]  Contact support│
└──────────────────────────────────────┘
```

State the duration. A lock with no stated end turns into a support ticket.

## Verification Code

1. Six digits, one field with per-character segments, full-code paste supported.
2. Autofill from SMS or authenticator is supported and not defeated by custom inputs.
3. Submission happens automatically once the code is complete, with a visible pending state.
4. A wrong code clears the field, keeps focus in it, and states remaining attempts.
5. Resend is disabled for a stated cooldown with a visible countdown, then re-enabled.
6. Offer a fallback: another factor, a backup code, or a support route.

```
Enter the 6-digit code sent to a•••@example.com

[ 4 ][ 8 ][ 1 ][   ][   ][   ]

Code expires in 9:41
Resend available in 0:38
Use a backup code instead
```

## Expired Reset Link

1. Say the link expired and why links expire.
2. Offer to send a new one from the same screen, with the email pre-filled if it can be derived from the token.
3. Never dump the user on a generic sign-in screen with no explanation.

```
┌──────────────────────────────────────┐
│ This reset link has expired          │
│                                      │
│ Reset links are valid for 60 minutes │
│ so they cannot be reused by someone  │
│ else later.                          │
│                                      │
│ [ Send a new link ]                  │
└──────────────────────────────────────┘
```

## Setting A New Password

1. One field, with a visibility toggle. Confirmation fields are unnecessary when the value can be revealed.
2. Requirements are listed and tick off as they are met.
3. On success, sign the user in and confirm: "Password updated. You are signed in."
4. Notify the account's email that the password changed, and say on screen that the notification was sent.
5. Offer to sign out other sessions, and state how many exist.

## Social / SSO

1. The button states the provider by name and the action: "Continue with Google".
2. Redirect or popup opens with a visible pending state on the button in case the popup is blocked.
3. If the popup is blocked, fall back to a full redirect automatically and say so.
4. If the provider returns an email that already exists with a password, do not create a duplicate. Explain and offer to link.
5. If the user cancels at the provider, return to the same screen with no error styling and no lost form input.
6. Enterprise SSO is reached by identifier: entering a work email whose domain is configured replaces the password step with a redirect, and the screen states which organisation it is redirecting to.

```
┌──────────────────────────────────────┐
│ An account with this email already   │
│ exists using a password.             │
│                                      │
│ Sign in with your password once, and │
│ we will link Google to your account. │
│                                      │
│ [ Sign in with password ]            │
└──────────────────────────────────────┘
```

## Session Expiry

1. Warn before expiry while the user is still active, at a defined margin.
2. Offer inline extension without leaving the screen.
3. If expiry occurs, preserve unsaved input in local storage keyed to the draft, never to the session.
4. Re-authenticate in a dialog over the current screen, not a redirect.
5. On success, close the dialog and restore the draft. Confirm: "Signed back in. Your draft was kept."

```
┌──────────────────────────────────────┐
│ Your session ended                   │
│                                      │
│ Your changes are saved locally.      │
│ Enter your password to continue      │
│ where you left off.                  │
│                                      │
│ Password  [                        ] │
│ [ Continue ]        Sign out instead │
└──────────────────────────────────────┘
```

---

# States

## Loading — First Visit

The auth card renders as a skeleton only if provider configuration must be fetched.

```
Card frame     → visible immediately
Title          → real text, never a skeleton
Provider row   → 2 button-shaped skeletons
Fields         → rendered and focusable immediately
```

Fields are interactive before providers resolve, so a user who knows their password never waits on a third-party script.

If configuration cannot load within two seconds, show the password form and hide providers rather than blocking.

---

## Loading — Submitting

- The submit button shows a spinner and its label changes to the present participle: "Signing in…", "Creating account…", "Sending link…".
- Fields become read-only, not disabled, so their values are still announced.
- Provider buttons are disabled to prevent a parallel attempt.
- No full-screen overlay. The card is the scope of the operation.
- If the request exceeds five seconds, add a line: "Still working. This can take a moment on a slow connection."

---

## Empty — Untouched Form

The first state every user sees, and it must not look like an error.

- No red styling anywhere before interaction.
- Requirements shown as neutral helper text: "At least 12 characters, including a number."
- The primary action is visible without scrolling on a 320×568 viewport.
- No validation fires on first focus or on first blur of an empty optional field.

---

## Empty — No Methods Available

Reachable when an organisation has disabled every method the user has.

```
┌──────────────────────────────────────┐
│ No sign-in method is available for   │
│ this email                           │
│                                      │
│ Your organisation manages access.    │
│ Ask an administrator to enable       │
│ sign-in for your account.            │
│                                      │
│ [ Contact administrator ]            │
│ Use a different email                │
└──────────────────────────────────────┘
```

---

## Error — Field Level

Field errors appear beneath the field, are announced, and never move the field.

```
Email
┌──────────────────────────────┐
│ user@                        │
└──────────────────────────────┘
⚠ Enter a complete email address.
```

Rules:

- Validate on blur for format, never on every keystroke.
- Once an error is shown, re-validate on input so the message clears the moment it is fixed.
- Reserve vertical space for the message so the layout does not jump.
- Never use red placeholder text as an error.

---

## Error — Form Level

Submission failures appear above the fields, inside the card.

```
┌──────────────────────────────────────┐
│ ⚠ We could not sign you in           │
│   Email or password is incorrect.    │
│   Reset your password                │
└──────────────────────────────────────┘
```

Focus moves to the error container, which is focusable and announced assertively.

The identifier is preserved. The password is cleared.

---

## Error — Network Failure

Distinguish "we rejected you" from "we could not reach the server".

```
┌──────────────────────────────────────┐
│ ⚠ No connection                      │
│   We could not reach our servers.    │
│   Your details were not sent.        │
│   [ Try again ]                      │
└──────────────────────────────────────┘
```

Stating that nothing was sent prevents the user from wondering whether the account was half-created.

---

## Error — Rate Limited

```
┌──────────────────────────────────────┐
│ Too many requests                    │
│                                      │
│ Wait 60 seconds before requesting    │
│ another code. This limit protects    │
│ your account.                        │
│                                      │
│ Resend available in 0:47             │
└──────────────────────────────────────┘
```

---

## Success

Success is a transition, not a destination.

- Sign in routes directly to the intended destination. No interstitial "You are signed in" screen.
- Sign up routes to onboarding or first-run content, already authenticated.
- Password reset shows one confirmation line in the destination, not a separate page.
- Verification confirms and continues automatically.

```
✓ Password updated. You are signed in.
```

---

## Permission-Limited

When authentication succeeds but the account cannot access the requested resource, do not sign the user out.

```
┌──────────────────────────────────────┐
│ You are signed in as a@example.com   │
│                                      │
│ This workspace is not available to   │
│ your account.                        │
│                                      │
│ [ Go to your workspace ]             │
│ [ Request access ]                   │
│ Sign in with a different account     │
└──────────────────────────────────────┘
```

Signing a user out because one resource is forbidden makes a permissions problem look like an authentication bug.

---

# Mobile Behavior

- Touch targets minimum 44×44, including the password visibility toggle and the resend link.
- The submit button remains reachable when the software keyboard is open; the card scrolls, the button is not fixed under the keyboard.
- Correct input types on every field: email, tel, numeric one-time-code.
- Standard autocomplete tokens so password managers and platform autofill work: username, current-password, new-password, one-time-code.
- Biometric unlock, where the platform supports it, is offered after the first successful password sign-in on that device — never as the only option.
- SMS codes autofill; the code field must accept a full paste and must not clear on blur.
- Provider redirects return to the app or tab that started them, preserving the destination.
- Never open authentication in an embedded browser view that has no password manager access.
- Legal links open in place with a back path, not in a new tab that loses the form.

---

# Desktop Expansion

Added space is spent on:

- a static context panel explaining what the account is for
- Enter submitting from any field, and a visible focus ring on every control
- password manager and passkey affordances shown at native size
- device-remembering, so a second factor is not demanded daily on a trusted machine

Added space is never spent on:

- widening the form fields
- animated illustrations beside a password field
- a rotating testimonial carousel
- a second copy of the sign-up link at the bottom of a taller card

---

# Accessibility Requirements

- Tab order is exactly visual order: identifier, password, visibility toggle, recovery link, submit, providers, legal links.
- Every field has a persistent visible label associated programmatically. Placeholder-only labelling is prohibited.
- The password visibility toggle is a button with an accessible name that reflects state: "Show password" / "Hide password", and announces the change.
- Field errors are linked to their field so screen readers announce label, value, and error together.
- Form-level errors live in an assertive live region and receive focus, because the user must stop.
- Status messages such as "Sending code" and "Code sent" use a polite live region.
- One-time-code fields, if segmented visually, expose a single accessible field with one label and one value.
- Focus is trapped in the session expiry dialog, and returns to the originating element on close.
- Autofocus is placed on the first empty field on sign-in and verification screens only, never on a screen the user arrived at to read.
- Contrast: all text 4.5:1, focus indicators 3:1 against both the field and the background, error text 4.5:1 without relying on hue.
- Error state is conveyed by icon and text as well as color, so greyscale rendering still communicates failure.
- Reduced motion: no shake animation on failure, no sliding step transitions; content replaces instantly.
- At 200% zoom the card scrolls vertically with no horizontal scroll and no clipped buttons.
- Timed steps such as code expiry and lockout countdowns are announced at start and completion, not on every tick.
- No CAPTCHA without an accessible alternative path.

---

# Data Requirements

Before implementation, confirm:

```
Identifier type and uniqueness rule


Password minimum length and prohibited-list policy


Credential hashing and storage responsibility


Session lifetime, idle timeout, and absolute maximum


Refresh token rotation and revocation behavior


Reset link lifetime and single-use enforcement


Verification code length, lifetime, and attempt ceiling


Lockout threshold, duration, and unlock paths


Rate limits per identifier and per address


Second factor types supported and enrolment requirement


Backup code count and regeneration rule


Provider list, scopes requested, and account-linking rule


SSO domain mapping and just-in-time provisioning behavior


What is written to the audit log for every attempt


Data retention for failed attempts


Post-authentication destination resolution rule
```

Account linking must be settled before build. Without a rule, one human ends up with two accounts holding half their data each, and no interface can repair that later.

Never ship a flow whose lockout has no documented unlock path.

---

# Performance Requirements

- The sign-in screen is interactive under one second on a cold cache; it is the first screen of the product and must not wait on the application bundle.
- The auth screen ships as a minimal bundle without the main application's dependencies.
- Provider SDKs load lazily and never block the password form.
- Field validation runs client-side without a network request; only uniqueness and credential checks reach the server.
- Submission responses return under two seconds at the median, with a visible extended-wait message beyond five.
- One-time-code delivery targets under thirty seconds, and the resend cooldown is longer than the expected delivery time so users do not stack requests.
- Session refresh happens in the background and never interrupts an in-progress action.
- CAPTCHA and bot-detection scripts load only after a failed attempt, not on first paint.

---

# Anti-Patterns

Never build:

- placeholder text as the only label
- a password confirmation field alongside a visibility toggle
- password rules revealed only after submission fails
- "Invalid email" and "Invalid password" as separate messages, which confirms account existence
- a lockout with no stated duration and no unlock path
- clearing the whole form after a failed attempt
- a reset flow that ends at a sign-in screen instead of a signed-in session
- an expired link screen that only says "invalid token"
- disabling paste in password or code fields
- blocking password managers with custom inputs or autocomplete off
- authentication inside an embedded browser view with no autofill
- a mandatory email verification wall before the user has seen any value
- silent session expiry that discards unsaved work
- signing the user out because one resource was forbidden
- five social buttons and a form crammed into one screen
- a rotating marketing carousel beside the password field
- CAPTCHA on every sign-in attempt
- creating a second account when a provider returns an existing email
- routing every successful sign-in to the home screen, discarding the deep link
- a shake animation as the only indication of failure

---

# Pattern Output Example

```
Product

Multi-Tenant Operations Platform


Primary Goal

Reach the requested workspace on the first attempt


Layout

Centred card, max 420px, static context panel on desktop


Methods

Identifier-first: password, Google, enterprise SSO by email domain


Sign Up Fields

Email and password only; name collected during onboarding


Verification

Email banner in product, not a wall; 6-digit code for second factor


Second Factor

Authenticator app or SMS, device remembered 30 days


Lockout

10 failures, 15 minute pause, password reset unlocks immediately


Reset Link

60 minutes, single use, completes signed in


Session

12 hour absolute, 30 minute idle warning, in-place re-auth dialog


Draft Preservation

Local draft keyed to record, restored after re-auth


Account Linking

Provider email matching an existing password account prompts linking


Mobile

Single column, autofill tokens, SMS code autofill, biometric after first sign-in


Accessibility

Visible labels, assertive form errors, polite status, no motion on failure, 200% zoom verified


Review

Pass
```

---

# QA Checklist

Before approval:

- [ ] Deep link destination is preserved through the entire flow
- [ ] Sign up asks for the minimum and lands signed in
- [ ] Password requirements are visible before typing
- [ ] Failure messages never disclose whether an account exists
- [ ] Failed sign in preserves the identifier and clears only the password
- [ ] Lockout states its duration and offers a working unlock path
- [ ] Expired reset link explains itself and offers a new link in place
- [ ] Reset completion signs the user in and notifies the account email
- [ ] Verification code accepts paste and platform autofill
- [ ] Resend cooldown is visible and longer than expected delivery time
- [ ] Provider cancellation returns cleanly with no error styling
- [ ] Provider email matching an existing account offers linking, never duplication
- [ ] SSO redirect names the organisation before leaving
- [ ] Session expiry warns first, preserves drafts, and re-authenticates in place
- [ ] Forbidden resource does not sign the user out
- [ ] Network failure is distinguished from rejected credentials
- [ ] Every field has a visible label and correct autocomplete token
- [ ] Password managers and autofill work on mobile and desktop
- [ ] Form-level errors receive focus and are announced assertively
- [ ] Error state survives greyscale
- [ ] No shake or motion-only failure feedback under reduced motion
- [ ] 200% zoom produces no horizontal scroll or clipped controls
- [ ] Sign-in screen is interactive in under one second
- [ ] No third-party script blocks the password form

---

# Final Rule

Authentication is a toll gate, and the only acceptable design goal is that legitimate users pass it without noticing.

Every element must justify itself against one question:

Does this help a real user get into their own account, or does it only make the product feel secure?

If it is the second, remove it.
