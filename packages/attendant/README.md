# `@sleeklybuilt/attendant`

Shared SleeklyBuilt site attendant (provider, panel, launcher, API client).

Governing pattern: `design-os/patterns/attendant.md`.

## Install

```json
"@sleeklybuilt/attendant": "file:../packages/attendant"
```

Peers: `react`, `react-dom`, `react-router-dom`, `react-icons`, `@sleeklybuilt/design-foundation`.

## Mount

```jsx
import { AttendantProvider, AttendantRoot, useAttendant } from '@sleeklybuilt/attendant'
import '@sleeklybuilt/attendant/styles/highlight.css'

<AttendantProvider
  host="portfolio"          // marketing | portfolio | blog
  basePath="/portfolio-app" // public path prefix for basename routers
  site={{
    name: 'SleeklyBuilt',
    whatsapp: 'https://wa.me/…',
    primaryPhone: '+256…',
  }}
>
  <AppShell />
  <AttendantRoot />
</AttendantProvider>
```

Session keys (`sb_attendant_session`, `sb_attendant_conversation`, `sb_attendant_recent_pages`) are shared so same-origin apps keep one conversation across marketing → portfolio → blog.

## Launcher

Closed and minimized states always show the **message** icon. Minimize control (chevron-down) lives only in `AttendantHeader`.

## Tailwind

Include package sources in the host app `content` globs:

```js
'./node_modules/@sleeklybuilt/attendant/src/**/*.{js,jsx}'
```
