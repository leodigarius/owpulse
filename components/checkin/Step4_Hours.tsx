import React, { useEffect } from 'react';

// Define the props expected by the component
interface Step4HoursProps {
  data: {
    hoursWorked: number | null;
    didNotWork: boolean;
    comment: string; // Comment is collected here
    // email: string; // Email is no longer handled in this step
  };
  // Update setData to only include relevant keys for this step
  setData: (field: 'hoursWorked' | 'comment', value: number | string | null) => void;
  onNext: () => void; // This will trigger the final submit
  onBack: () => void;
}

export default function Step4_Hours({ data, setData, onNext, onBack }: Step4HoursProps) {
  const { didNotWork, hoursWorked } = data;

  // If user indicated they didn't work in Step 1, skip this step's input
  // and proceed to submit with hoursWorked as null (handled by API).
  // Removed useEffect hook - skipping logic is now handled in the parent page component

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData('hoursWorked', parseInt(event.target.value, 10));
  };

   // Handle comment changes if the comment box is part of this step
   const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
     setData('comment', event.target.value);
   };

   // Removed handleEmailChange as email is handled in parent


  // Render nothing or a loading message while the effect redirects/submits
  // Removed conditional rendering based on didNotWork - parent component handles skipping this step

  // Render the slider and comment input if the user worked
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-center text-gray-700">
        Approximately how many hours did you work this week?
      </h2>

      {/* Hours Worked Slider */}
      <div className="space-y-4">
        <input
          type="range"
          id="hoursWorked"
          name="hoursWorked"
          min="0"
          max="80" // Max value for the slider range
          step="5" // Increment value
          value={hoursWorked ?? 0} // Default to 0 if null
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="text-center text-2xl font-bold text-indigo-700">
          {/* Display 80+ if slider is at max */}
          {/* Display 80+ if slider is at max, otherwise show the number or 0 if null */}
          {hoursWorked === 80 ? '80+' : hoursWorked ?? 0} hours
        </div>
      </div>

      {/* Final Comment Box */}
       <div className="pt-6 border-t mt-6">
         <label htmlFor="finalComment" className="block text-sm font-medium text-gray-700 mb-1">
           Any final comments? (Optional)
         </label>
         <textarea
           id="finalComment"
           rows={4}
           value={data.comment}
           onChange={handleCommentChange}
           className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           placeholder="Add any overall thoughts here..."
         />
       </div>

       {/* Removed Optional Email Input section */}


      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext} // onNext now triggers the final submit in the parent
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
