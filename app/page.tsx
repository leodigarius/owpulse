import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggleButton } from '@/components/ThemeToggleButton';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic gradient background with animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-950 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 animate-gradient-shift"></div>
      
      {/* Animated orbs/blobs for visual interest */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl animate-float-delayed"></div>
      <div className="absolute top-2/3 left-1/3 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl animate-float-slow"></div>
      
      {/* Subtle particle overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-soft-light pointer-events-none bg-noise"></div>
      
      {/* Top right login links and theme toggle */}
      <div className="absolute top-0 right-0 p-6 flex items-center gap-4 z-10">
        <ThemeToggleButton />
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
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center z-10">
        {/* Logo with subtle animation */}
        <div className="mb-12 animate-pulse-subtle">
          <Image 
            src="/owpulse_logo.PNG" 
            alt="OWPulse Logo" 
            width={400} 
            height={200}
            priority
            className="drop-shadow-glow"
          />
        </div>
        
        {/* Main heading with text animation */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-text-glow">
          How was your week?
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/80 mb-12">
          Share your vibe and let us know how things are going.
        </p>
        
        {/* Check-in button with hover effects */}
        <Link 
          href="/user/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white text-xl font-medium rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-glow"
        >
          Check In
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-bounce-x" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(15px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-15px) translateX(-15px);
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }
        
        @keyframes text-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
          }
        }
        
        @keyframes bounce-x {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 12s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        
        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }
        
        .animate-bounce-x {
          animation: bounce-x 1s ease-in-out infinite;
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
        }
        
        .hover\\:shadow-glow:hover {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}
