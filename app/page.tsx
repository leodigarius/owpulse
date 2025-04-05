import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="flex flex-col items-center justify-center text-center max-w-3xl">
        <div className="mb-8">
          <Image 
            src="/owpulse_logo.PNG" 
            alt="OWPulse Logo" 
            width={300} 
            height={150}
            priority
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Welcome to OWPulse
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Your ultimate tool for OW2 player analytics and matchmaking intelligence
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            href="/user/"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-md transition-colors"
          >
            Player Check-In
          </Link>
          
          <Link 
            href="/admin/analytics/"
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-lg font-medium rounded-md transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
