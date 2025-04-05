import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the user check-in flow page
  redirect('/checkin');
}
