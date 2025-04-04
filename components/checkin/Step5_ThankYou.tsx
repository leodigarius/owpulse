import React, { useEffect, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';

// Define the props expected by the component
interface Step5ThankYouProps {
  data: {
    // Include any data needed for stats display, e.g., overallMood, hoursWorked
    overallMood: number | null;
    hoursWorked: number | null;
    didNotWork: boolean;
  };
  onReset: () => void; // Function to reset the form/flow
}

// Confetti particle component
const Confetti = () => {
  const [particles, setParticles] = useState<Array<{
    left: number;
    size: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    // Generate random confetti particles
    const colors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      left: Math.random() * 100,
      size: Math.random() * 1 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute top-0 animate-fall"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}rem`,
            height: `${particle.size * 0.4}rem`,
            backgroundColor: particle.color,
            opacity: 0.8,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default function Step5_ThankYou({ data, onReset }: Step5ThankYouProps) {
  // Get mood emoji
  const getMoodEmoji = () => {
    if (data.didNotWork) return '🏖️';
    
    switch(data.overallMood) {
      case 1: return '😫';
      case 2: return '😔';
      case 3: return '😐';
      case 4: return '😊';
      case 5: return '🤩';
      default: return '👍';
    }
  };

  // Custom animation for the success icon
  useEffect(() => {
    // Add any animations or effects you want to run when this component mounts
    const timer = setTimeout(() => {
      // Any delayed animations
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative space-y-8 text-center z-10">
      {/* Confetti animation */}
      <Confetti />
      
      {/* Success icon with pulsing effect */}
      <div className="flex justify-center mb-6 animate-fade-in-up">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse-slow">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          {/* Background glow */}
          <div className="absolute inset-0 rounded-full bg-green-400/20 blur-xl -z-10 animate-pulse-slow"></div>
        </div>
      </div>
      
      {/* Thank you heading */}
      <div className="space-y-4">
        <Heading 
          size="h2" 
          variant="gradient" 
          align="center" 
          className="animate-fade-in-up animation-delay-100"
        >
          Thank You for Your Feedback!
        </Heading>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto animate-fade-in-up opacity-0 animation-delay-200">
          Your anonymous feedback has been successfully submitted and will help improve the workplace for everyone.
        </p>
      </div>

      {/* Submission summary in a stylish card */}
      <div className="max-w-md mx-auto rounded-xl overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-6 animate-fade-in-up opacity-0 animation-delay-300">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Submission Summary</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm">
            <div className="text-3xl mb-2">{getMoodEmoji()}</div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {data.didNotWork 
                ? "Not Working" 
                : data.overallMood 
                  ? `Mood: ${["Terrible", "Poor", "Okay", "Good", "Amazing"][data.overallMood - 1]}` 
                  : "Mood: N/A"}
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 backdrop-blur-sm">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {data.didNotWork 
                ? "Time Off" 
                : data.hoursWorked !== null 
                  ? `${data.hoursWorked} Hours` 
                  : "Hours: N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-4 animate-fade-in-up opacity-0 animation-delay-500">
        <Button 
          onClick={onReset} 
          variant="gradient" 
          size="lg" 
          rounded="full"
          className="px-8 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Submit Another Response
        </Button>
      </div>
      
      {/* Inspirational quote */}
      <div className="mt-8 italic text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto animate-fade-in-up opacity-0 animation-delay-700">
        "Your feedback helps create a better work environment for everyone. Thank you for contributing!"
      </div>
    </div>
  );
}
