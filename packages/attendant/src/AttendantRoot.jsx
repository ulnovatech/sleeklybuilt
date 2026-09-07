import AttendantLauncher from './AttendantLauncher.jsx'
import AttendantPanel from './AttendantPanel.jsx'

/** Site-resident attendant — replaces the floating WhatsApp/call cluster. */
export default function AttendantRoot() {
  return (
    <>
      <AttendantLauncher />
      <AttendantPanel />
    </>
  )
}
