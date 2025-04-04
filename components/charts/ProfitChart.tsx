// owpulse/components/charts/ProfitChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define expected data structure via props
interface FocusGroupSatisfactionProps {
    data: {
        name: string; // Focus Group Name
        value: number; // Average Mood Score
    }[];
}

// Define colors using CSS variables (or provide a specific palette)
// Using HSL values for easier manipulation if needed
const COLORS = [
  'hsl(var(--primary))', // Use primary color
  'hsl(var(--primary) / 0.8)', // Primary with opacity
  'hsl(var(--primary) / 0.6)', // Primary with more opacity
  'hsl(var(--primary) / 0.4)', // Primary with even more opacity
  // Add more colors if needed, potentially using secondary/accent variables
  'hsl(var(--secondary-foreground) / 0.5)',
];

export function ProfitChart({ data = [] }: FocusGroupSatisfactionProps) { // Accept data prop
  const gridColor = 'hsl(var(--border))';
  const tooltipBgColor = 'hsl(var(--card))';
  const tooltipTextColor = 'hsl(var(--card-foreground))';
  const legendTextColor = 'hsl(var(--muted-foreground))';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          // label={renderCustomizedLabel} // Optional: Add custom labels
          outerRadius={80}
          innerRadius={50} // Make it a doughnut chart
          fill="#8884d8" // Default fill, overridden by Cells
          dataKey="value"
          paddingAngle={5} // Add space between segments
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={tooltipBgColor} strokeWidth={2} /> // Add stroke for separation
          ))}
        </Pie>
        <Tooltip
           cursor={{ fill: 'transparent' }}
           contentStyle={{
             backgroundColor: tooltipBgColor,
             borderColor: gridColor,
             borderRadius: 'var(--radius)',
             fontSize: '12px',
             color: tooltipTextColor,
             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
             padding: '8px 12px',
           }}
           formatter={(value: number, name: string) => [`Avg Mood: ${value.toFixed(1)}`, name]} // Format for mood score
        />
         <Legend
            wrapperStyle={{ fontSize: "12px", color: legendTextColor }}
            verticalAlign="bottom"
            align="center"
            iconType="circle" // Use circle icons for legend
            height={36} // Adjust height for legend
         />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Optional: Example for custom labels if needed later
// const RADIAN = Math.PI / 180;
// const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
//   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);

//   return (
//     <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
//       {`${(percent * 100).toFixed(0)}%`}
//     </text>
//   );
// };