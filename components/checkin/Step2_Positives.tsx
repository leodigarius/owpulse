import React from 'react';

// Define the props expected by the component
interface Step2PositivesProps {
  data: {
    positiveAspects: string[];
  };
  setData: (field: 'positiveAspects', value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// Define positive driver options based on OW Balance-2.html structure
// Grouping them based on the HTML structure for clarity
const positiveDrivers = {
  top: [
    { id: 'impactful_work', label: 'Impactful / Interesting Work', icon: '💡' },
    { id: 'development_ops', label: 'Development Opportunities', icon: '🌱' },
    { id: 'personal_time', label: 'Time for Personal / Social Commitments', icon: '⏳' },
    { id: 'recognition', label: 'Recognition', icon: '🏆' },
    { id: 'team_culture', label: 'Team Culture', icon: '🤝' },
    { id: 'clear_objectives', label: 'Clear Objectives / Role', icon: '🎯' },
  ],
  workLifeBalance: [
    { id: 'flexibility', label: 'Flexibility of Schedule / Location', icon: '🤸' },
    { id: 'predictability', label: 'Predictability of Schedule / Location', icon: '📅' },
    { id: 'healthy_habits', label: 'Time for Healthy Habits / Self Care', icon: '🧘' },
    { id: 'personal_balance_goals', label: 'Met My Personal Balance Goals', icon: '🏁' },
    { id: 'team_balance_goals', label: 'Met Team Balance Goals', icon: '🚩' },
    { id: 'workspace', label: 'Comfortable Workspace', icon: '🏠' },
    { id: 'travel_commute', label: 'Minimal Time Spent Traveling / Commuting', icon: '🚗' },
  ],
  cultureInclusion: [
     { id: 'internal_relationships', label: 'Opportunity to Build Internal Relationships', icon: '👥' },
     { id: 'office_culture', label: 'Office Culture', icon: '🏢' },
     { id: 'be_myself', label: 'I Can Be Myself', icon: '😊' },
     { id: 'team_respect', label: 'Team Respect / Inclusion', icon: '💖' },
     { id: 'ideas_valued', label: 'My Ideas / Opinions Were Valued', icon: '🗣️' },
  ],
  developmentProductivity: [
     { id: 'collaboration', label: 'Effective Collaboration / Teaming', icon: '🧑‍🤝‍🧑' },
     { id: 'productivity', label: 'Personal / Team Productivity', icon: '🚀' },
     { id: 'mentorship', label: 'Strong Mentorship / Coaching', icon: '👨‍🏫' },
     { id: 'client_success', label: 'Successful Client Meeting / Deliverable', icon: '💼' },
     { id: 'independence', label: 'Independence / Ownership', icon: '🕊️' },
     { id: 'client_relationships', label: 'Opportunities to Build Client Relationships', icon: '📈' },
     { id: 'feedback', label: 'Helpful / Actionable Feedback', icon: '📝' },
     { id: 'learning', label: 'Learned New Content / Skills', icon: '🧠' },
  ],
  projectManagement: [
     { id: 'tools_resources', label: 'Necessary Tools / Resources Available', icon: '🛠️' },
     { id: 'project_kickoff', label: 'Strong Project Kick-Off', icon: '🎉' },
  ]
};

// Combine all drivers into a single list for rendering the grid easily
const allPositiveDrivers = [
    ...positiveDrivers.top,
    ...positiveDrivers.workLifeBalance,
    ...positiveDrivers.cultureInclusion,
    ...positiveDrivers.developmentProductivity,
    ...positiveDrivers.projectManagement
];

export default function Step2_Positives({ data, setData, onNext, onBack }: Step2PositivesProps) {

  const handleSelect = (driverId: string) => {
    const currentSelection = data.positiveAspects;
    let newSelection;
    if (currentSelection.includes(driverId)) {
      // Deselect if already selected
      newSelection = currentSelection.filter(id => id !== driverId);
    } else {
      // Select if not already selected
      newSelection = [...currentSelection, driverId];
    }
    setData('positiveAspects', newSelection);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center text-gray-700">
        That's great! What went well?
      </h2>
      <p className="text-center text-gray-500 text-sm">(Select all that apply)</p>

      {/* Driver Icons Grid */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {allPositiveDrivers.map((driver) => {
          const isSelected = data.positiveAspects.includes(driver.id);
          return (
            <button
              key={driver.id}
              type="button"
              onClick={() => handleSelect(driver.id)}
              className={`flex flex-col items-center text-center p-2 rounded-lg border transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-full mb-1 ${isSelected ? 'bg-indigo-200' : 'bg-gray-200'}`}>
                 <span className="text-xl">{driver.icon}</span>
              </span>
              <span className={`text-xs leading-tight ${isSelected ? 'font-semibold text-indigo-800' : 'text-gray-600'}`}>
                {driver.label}
              </span>
            </button>
          );
        })}
      </div>

       {/* TODO: Add comment box if needed for this step */}

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
