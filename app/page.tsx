import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-950 to-blue-950">
      {/* Top right login links */}
      <div className="absolute top-0 right-0 p-6 flex items-center gap-4 z-10">
        <Link 
          href="/api/auth/signin?callbackUrl=/manager" 
          className="text-white/80 hover:text-white transition-colors"
        >
          Manager Login
        </Link>
        <Link 
          href="/api/auth/signin?callbackUrl=/admin" 
          className="text-white/80 hover:text-white transition-colors"
        >
          Admin Login
        </Link>
      </div>
      
      {/* Main content centered */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo */}
        <div className="mb-12">
          <Image 
            src="/owpulse_logo.PNG" 
            alt="OWPulse Logo" 
            width={400} 
            height={200}
            priority
          />
        </div>
        
        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          How was your week?
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/80 mb-12">
          Share your vibe and let us know how things are going.
        </p>
        
        {/* Check-in button */}
        <Link 
          href="/user/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white text-xl font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          Check In
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
