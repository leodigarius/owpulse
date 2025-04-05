import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">OWPulse</h1>
      <p className="text-xl mb-8">Welcome to OWPulse - Share your feedback</p>
      <Link 
        href="/checkin"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Check-in
      </Link>
    </div>
  );
}
