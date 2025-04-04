// owpulse/components/charts/TrafficChart.tsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// No longer need to import/resolve tailwind config here
// import { useTheme } from 'next-themes'; // Keep useTheme if needed for other logic, but not for colors directly

// Define expected data structure via props
interface TrafficChartProps {
    data: { name: string; submissions: number }[];
}

export function TrafficChart({ data = [] }: TrafficChartProps) { // Accept data prop, provide default
  // Define colors using CSS variables defined in globals.css
  // Recharts components will inherit these via CSS
  const gridColor = 'hsl(var(--border))';
  const textColor = 'hsl(var(--muted-foreground))';
  const barColor = 'hsl(var(--primary))';
  const tooltipBgColor = 'hsl(var(--card))';
  const tooltipTextColor = 'hsl(var(--card-foreground))';


  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 0, // Adjust right margin if labels get cut off
          left: -20, // Adjust left margin to pull Y-axis labels closer
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} /> {/* Remove k formatter */}
        <Tooltip
           cursor={{ fill: 'transparent' }}
           contentStyle={{
             backgroundColor: tooltipBgColor,
             borderColor: gridColor, // Use border color for tooltip border
             borderRadius: 'var(--radius)', // Use radius variable
             fontSize: '12px',
             color: tooltipTextColor,
             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Basic shadow
             padding: '8px 12px',
           }}
        />
        {/* <Legend wrapperStyle={{ fontSize: "12px" }} /> */}
        <Bar dataKey="submissions" fill={barColor} name="Submissions" radius={[4, 4, 0, 0]} />
        {/* <Bar dataKey="uv" fill="#82ca9d" name="Unique Visitors" radius={[4, 4, 0, 0]} /> */}
      </BarChart>
    </ResponsiveContainer>
  );
}