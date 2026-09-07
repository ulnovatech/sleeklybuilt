import { redirect } from 'next/navigation';

/** Single-operator console — no public sign-up. */
export default function SignUpPage() {
  redirect('/sign-in');
}
