import { redirect } from 'next/navigation';

const PERFORMANTE_URL =
  process.env.PERFORMANTE_URL?.trim() || 'https://sleeklybuilt.pro/performante';

/** Clerk sign-in removed — operators authenticate at Performante. */
export default function SignInPage() {
  redirect(PERFORMANTE_URL);
}
