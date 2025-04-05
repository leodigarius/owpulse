import React from 'react';
import { Heading } from '@/components/ui/heading';

// Define the props expected by the component
interface Step1MoodProps {
  data: {
    overallMood: number | null;
    didNotWork: boolean;
    focusGroup: string; // Added focus group
  };
  // Update setData to expect only the relevant keys from CheckInData
  // Update setData to expect focusGroup as well
  setData: (field: 'overallMood' | 'didNotWork' | 'focusGroup', value: any) => void;
  onNext: () => void;
  onBack: () => void; // Added for consistency even though not used on first step
}

// Define the mood options with improved icons and descriptive labels
const moodOptions = [
  { value: 1, label: 'Terrible', icon: '😫', description: 'Had a very difficult week', bgClass: 'bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600', shadowClass: 'shadow-red-500/30 dark:shadow-red-600/20' },
  { value: 2, label: 'Poor', icon: '😔', description: 'Mostly challenging', bgClass: 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600', shadowClass: 'shadow-orange-500/30 dark:shadow-orange-600/20' },
  { value: 3, label: 'Okay', icon: '😐', description: 'Mixed feelings', bgClass: 'bg-gradient-to-r from-yellow-400 to-amber-400 dark:from-yellow-500 dark:to-amber-500', shadowClass: 'shadow-yellow-400/30 dark:shadow-yellow-500/20' },
  { value: 4, label: 'Good', icon: '😊', description: 'Mostly positive', bgClass: 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600', shadowClass: 'shadow-green-500/30 dark:shadow-green-600/20' },
  { value: 5, label: 'Amazing', icon: '🤩', description: 'Had a fantastic week', bgClass: 'bg-gradient-to-r from-blue-500 to-violet-500 dark:from-blue-600 dark:to-violet-600', shadowClass: 'shadow-blue-500/30 dark:shadow-violet-600/20' },
];

export default function Step1_Mood({ data, setData, onNext }: Step1MoodProps) {
  const handleMoodSelect = (value: number) => {
    setData('overallMood', value);
    // Automatically proceed to next step after selection
    setTimeout(() => onNext(), 500); // Slight delay for better visual feedback
  };

  const handleDidNotWorkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const didNotWork = event.target.checked;
    setData('didNotWork', didNotWork);
    if (didNotWork) {
      setData('overallMood', null); // Clear mood if they didn't work
      setTimeout(() => onNext(), 500); // Slight delay for better visual feedback
    }
  };

  const focusGroups = ["Operations", "Accounting", "Sales", "IT"]; // Defined focus groups

  const handleFocusGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setData('focusGroup', event.target.value);
    // Do not automatically proceed on focus group change, wait for mood selection
  };

  // Disable mood selection until a focus group is chosen
  const isMoodSelectionDisabled = !data.focusGroup || data.didNotWork;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <Heading
          size="h3"
          variant="default"
          align="center"
          className="animate-fade-in-up"
        >
          How was your week?
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 animate-fade-in-up opacity-0 animation-delay-100">
          Select the mood that best reflects your week
        </p>
      </div>

      {/* Focus Group Dropdown */}
      <div className="animate-fade-in-up opacity-0 animation-delay-50">
        <label htmlFor="focusGroup" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">
          Select your Focus Group (Required)
        </label>
        <select
          id="focusGroup"
          name="focusGroup"
          value={data.focusGroup}
          onChange={handleFocusGroupChange}
          required // Make selection mandatory
          className="w-full max-w-xs mx-auto block p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 backdrop-blur-sm"
          disabled={data.didNotWork} // Disable if they didn't work
        >
          <option value="" disabled>-- Select your group --</option>
          {focusGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      {/* Mood Selection - Enhanced Grid Layout with animation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 mt-8">
        {moodOptions.map((mood, index) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => handleMoodSelect(mood.value)}
            disabled={isMoodSelectionDisabled} // Disable mood if no focus group or didn't work
            className={`
              relative flex flex-col items-center p-5 rounded-xl transition-all duration-300
              animate-fade-in-up opacity-0 overflow-hidden group
              ${`animation-delay-${(index + 1) * 100}`}
              ${data.overallMood === mood.value 
                ? `${mood.bgClass} text-white scale-105 shadow-lg ${mood.shadowClass}` 
                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md hover:shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 hover:border-blue-500/30 dark:hover:border-blue-400/30'}
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
          >
            {/* Background effect - only visible on hover and active state */}
            <div className={`absolute inset-0 ${mood.bgClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${data.overallMood === mood.value ? 'opacity-100' : ''}`}></div>
            
            {/* Icon with glow effect */}
            <div className={`relative text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110 ${data.overallMood === mood.value ? 'scale-110' : ''}`}>
              {mood.icon}
              {data.overallMood === mood.value && (
                <div className="absolute inset-0 blur-md opacity-50 animate-pulse">{mood.icon}</div>
              )}
            </div>
            
            {/* Label with transition effect */}
            <span className={`font-semibold text-lg mb-1 ${data.overallMood === mood.value ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
              {mood.label}
            </span>
            
            {/* Description with transition effect */}
            <span className={`text-xs text-center ${data.overallMood === mood.value ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
              {mood.description}
            </span>
          </button>
        ))}
      </div>

      {/* Divider with enhanced styling */}
      <div className="relative my-8 animate-fade-in-up opacity-0 animation-delay-600">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/50 dark:border-slate-700/50"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-sm rounded-full border border-slate-200/50 dark:border-slate-700/50">
            or
          </span>
        </div>
      </div>

      {/* Didn't Work Option with Enhanced Styling and animation */}
      <div className="flex items-center justify-center p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 animate-fade-in-up opacity-0 animation-delay-700 shadow-sm hover:shadow transition-all duration-300">
        <label className="relative flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.didNotWork}
            onChange={handleDidNotWorkChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/40 dark:peer-focus:ring-blue-800/40 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
            I didn&apos;t work this past week
          </span>
        </label>
      </div>
    </div>
  );
}
