import AttendantLauncher from './AttendantLauncher'
import AttendantPanel from './AttendantPanel'

/** Site-resident attendant — replaces the floating WhatsApp/call cluster. */
export default function AttendantRoot() {
  return (
    <>
      <AttendantLauncher />
      <AttendantPanel />
    </>
  )
}
