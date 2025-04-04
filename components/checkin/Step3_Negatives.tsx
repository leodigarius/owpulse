import React from 'react';

// Define the props expected by the component
interface Step3NegativesProps {
  data: {
    negativeAspects: string[];
    didNotWork: boolean; // Added didNotWork flag
    // Assuming comment is handled in Step 4 based on current implementation
  };
  // Ensure setData expects only the 'negativeAspects' key
  // Updated setData to handle both negativeAspects and didNotWork
  setData: (field: 'negativeAspects' | 'didNotWork', value: string[] | boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

// Define negative driver options based on OW Balance-2.html structure
// Grouping them based on the HTML structure for clarity
const negativeDrivers = {
  top: [
    { id: 'unimpactful_work', label: 'Unimpactful / Uninteresting Work', icon: ' बोरियत' }, // Example icons
    { id: 'lack_development', label: 'Lack of Development Opportunities', icon: '📉' },
    { id: 'limited_personal_time', label: 'Limited Time for Personal / Social Commitments', icon: '😩' },
    { id: 'lack_recognition', label: 'Lack of Recognition', icon: '💔' },
    { id: 'challenging_dynamics', label: 'Challenging Team Dynamics', icon: '😠' },
    { id: 'high_intensity', label: 'High Work Intensity', icon: '🔥' },
    // Added more common challenges
    { id: 'unclear_expectations', label: 'Unclear Expectations', icon: '❓' },
    { id: 'work_life_balance', label: 'Work-Life Balance Issues', icon: '⚖️' },
    { id: 'communication_issues', label: 'Communication Issues', icon: '🗣️' },
    // Counters to Positives from Step 2
    { id: 'lack_flexibility', label: 'Lack of Flexibility', icon: '⛓️' },
    { id: 'lack_predictability', label: 'Lack of Predictability', icon: '🎲' },
    { id: 'no_time_healthy_habits', label: 'No Time for Healthy Habits', icon: '🚫🧘' },
    { id: 'missed_personal_balance_goals', label: 'Missed Personal Balance Goals', icon: '🥅❌' },
    { id: 'missed_team_balance_goals', label: 'Missed Team Balance Goals', icon: '🚩❌' },
    { id: 'uncomfortable_workspace', label: 'Uncomfortable Workspace', icon: '😖🏠' },
    { id: 'excessive_travel_commute', label: 'Excessive Travel/Commute', icon: '😩🚗' },
    { id: 'poor_internal_relationships', label: 'Poor Internal Relationships', icon: '👥⚡' },
    { id: 'negative_office_culture', label: 'Negative Office Culture', icon: '🏢⛈️' },
    { id: 'cannot_be_myself', label: 'Cannot Be Myself', icon: '🎭' },
    { id: 'lack_team_respect', label: 'Lack of Team Respect/Inclusion', icon: '💔🤝' },
    { id: 'ideas_not_valued', label: 'Ideas/Opinions Not Valued', icon: '🗣️🚫' },
    { id: 'ineffective_collaboration', label: 'Ineffective Collaboration', icon: '🧑‍🤝‍🧑🚧' },
    { id: 'low_productivity', label: 'Low Productivity', icon: '🐌' },
    { id: 'lack_mentorship', label: 'Lack of Mentorship/Coaching', icon: '🚫👨‍🏫' },
    { id: 'client_challenges', label: 'Client Challenges/Difficulties', icon: '💼🔥' },
    { id: 'lack_independence', label: 'Lack of Independence/Ownership', icon: '🚫🕊️' },
    { id: 'poor_client_relationships', label: 'Poor Client Relationships', icon: '📉🤝' },
    { id: 'unhelpful_feedback', label: 'Unhelpful/Lack of Feedback', icon: '📝❌' },
    { id: 'lack_learning_opportunities', label: 'Lack of Learning Opportunities', icon: '🚫🧠' },
    { id: 'lack_tools_resources', label: 'Lack of Tools/Resources', icon: '🚫🛠️' },
    { id: 'poor_project_kickoff', label: 'Poor Project Kick-Off', icon: '👎🎉' },
  ],
  // Add more categories if needed
};

// Combine all drivers into a single list for rendering
const allNegativeDrivers = [...negativeDrivers.top]; // Add other groups if implemented

export default function Step3_Negatives({ data, setData, onNext, onBack }: Step3NegativesProps) {

  const handleSelect = (driverId: string) => {
    const currentSelection = data.negativeAspects;
    let newSelection;
    if (currentSelection.includes(driverId)) {
      newSelection = currentSelection.filter(id => id !== driverId);
    } else {
      newSelection = [...currentSelection, driverId];
    }
    setData('negativeAspects', newSelection);
  };

  // Handle comment changes if the comment box is part of this step
  // const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setData('comment', event.target.value);
  // };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center text-gray-700">
        Any challenges?
      </h2>
      <p className="text-center text-gray-500 text-sm">(Select all that apply)</p>

      {/* Driver Icons Grid */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {allNegativeDrivers.map((driver) => {
          const isSelected = data.negativeAspects.includes(driver.id);
          return (
            <button
              key={driver.id}
              type="button"
              onClick={() => handleSelect(driver.id)}
              className={`flex flex-col items-center text-center p-2 rounded-lg border transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 ${
                isSelected
                  ? 'border-red-500 bg-red-50 ring-1 ring-red-500' // Use red theme for negatives
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-full mb-1 ${isSelected ? 'bg-red-200' : 'bg-gray-200'}`}>
                 <span className="text-xl">{driver.icon}</span>
              </span>
              <span className={`text-xs leading-tight ${isSelected ? 'font-semibold text-red-800' : 'text-gray-600'}`}>
                {driver.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* "I didn't work" Checkbox */}
      <div className="pt-6 border-t mt-6">
        <div className="flex items-center">
          <input
            id="didNotWork"
            name="didNotWork"
            type="checkbox"
            checked={data.didNotWork}
            onChange={(e) => setData('didNotWork', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="didNotWork" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            I didn't work this past week
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Checking this will skip the remaining questions.
        </p>
      </div>

      {/* Comment Box (Assuming the main comment is collected here or in a final step) */}
       {/* If comment is collected here: */}
       {/* <div className="pt-6 border-t mt-6">
         <label htmlFor="step3Comment" className="block text-sm font-medium text-gray-700 mb-1">
           Additional comments (Optional)
         </label>
         <textarea
           id="step3Comment"
           rows={3}
           value={data.comment || ''} // Assuming comment is part of data prop
           onChange={handleCommentChange}
           className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           placeholder="Share more details about the challenges..."
         />
       </div> */}


      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t mt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Next
        </button>
      </div>
    </div>
  );
}
