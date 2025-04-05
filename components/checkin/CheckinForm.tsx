'use client';

import { useState } from 'react';

interface CheckinFormProps {
  playerInfo: any;
  token: string;
}

interface FormData {
  mood: number;
  positives: string[];
  negatives: string[];
  hours: number;
  didNotPlay: boolean;
  comment: string;
}

export default function CheckinForm({ playerInfo, token }: CheckinFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    mood: 3,
    positives: [],
    negatives: [],
    hours: 0,
    didNotPlay: false,
    comment: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleMoodChange = (value: number) => {
    setFormData(prev => ({ ...prev, mood: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In static export mode, make a direct API call
      const response = await fetch(`${window.location.origin}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          token
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If submission was successful, show thank you screen
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <img 
            src="/owpulse_logo.PNG" 
            alt="OWPulse Logo" 
            className="w-48 h-auto mx-auto mb-8" 
          />
          
          <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
          <p className="mb-6">Your feedback has been submitted successfully.</p>
          
          <button
            onClick={() => window.location.reload()}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Start New Check-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-lg">
        <img 
          src="/owpulse_logo.PNG" 
          alt="OWPulse Logo" 
          className="w-48 h-auto mx-auto mb-8" 
        />
        
        <div className="w-full bg-gray-700 h-2 rounded-full mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <h1 className="text-2xl font-bold mb-6">
          {step === 1 && "How do you feel today?"}
          {step === 2 && "What went well?"}
          {step === 3 && "What challenges did you face?"}
          {step === 4 && "Additional Information"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleMoodChange(value)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
                      formData.mood === value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Very Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <textarea
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white h-32"
                placeholder="What aspects of your gaming experience went well? (Optional)"
                value={formData.positives.join('\n')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  positives: e.target.value.split('\n').filter(Boolean) 
                }))}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <textarea
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white h-32"
                placeholder="What challenges did you encounter? (Optional)"
                value={formData.negatives.join('\n')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  negatives: e.target.value.split('\n').filter(Boolean) 
                }))}
              />
              <div className="flex items-center gap-2">
                <input
                  id="didNotPlay"
                  type="checkbox"
                  checked={formData.didNotPlay}
                  onChange={(e) => setFormData(prev => ({ ...prev, didNotPlay: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="didNotPlay">I didn't play since my last check-in</label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {!formData.didNotPlay && (
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium mb-2">
                    How many hours did you play?
                  </label>
                  <input
                    id="hours"
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                    value={formData.hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              )}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                  Any additional comments?
                </label>
                <textarea
                  id="comment"
                  className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white h-24"
                  placeholder="Additional comments (Optional)"
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2 px-4 bg-gray-700 text-white rounded-md"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 