import { AttendantProvider } from './AttendantProvider'
import AttendantLauncher from './AttendantLauncher'
import AttendantPanel from './AttendantPanel'

/** Site-resident attendant — replaces the floating WhatsApp/call cluster. */
export default function AttendantRoot() {
  return (
    <AttendantProvider>
      <AttendantLauncher />
      <AttendantPanel />
    </AttendantProvider>
  )
}
