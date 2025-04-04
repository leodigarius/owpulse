// owpulse/components/charts/SalesChart.tsx
'use client';

import React from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define expected data structure via props
interface SentimentChartProps {
    data: {
        name: string; // e.g., Week start date 'YYYY-MM-DD'
        avgMood: number;
        prevAvgMood?: number; // Optional previous period data
    }[];
}

export function SalesChart({ data = [] }: SentimentChartProps) { // Accept data prop
  // Define colors using CSS variables defined in globals.css
  const gridColor = 'hsl(var(--border))';
  const textColor = 'hsl(var(--muted-foreground))';
  const primaryColor = 'hsl(var(--primary))';
  const secondaryColor = 'hsl(var(--secondary-foreground) / 0.6)'; // Use secondary color for previous period line
  const tooltipBgColor = 'hsl(var(--card))';
  const tooltipTextColor = 'hsl(var(--card-foreground))';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 5, // Add slight right margin
          left: -20, // Adjust left margin
          bottom: 5,
        }}
      >
        <defs>
          {/* Gradient for current period */}
          <linearGradient id="colorCurrentMood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4}/> {/* Lighter opacity */}
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        {/* Format XAxis to show dates better if needed */}
        <XAxis dataKey="name" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} dy={5} />
        <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} domain={[1, 5]} tickCount={5} /> {/* Mood scale 1-5 */}
        <Tooltip
           cursor={{ stroke: primaryColor, strokeWidth: 1, strokeDasharray: '3 3' }}
           contentStyle={{
             backgroundColor: tooltipBgColor,
             borderColor: gridColor,
             borderRadius: 'var(--radius)',
             fontSize: '12px',
             color: tooltipTextColor,
             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
             padding: '8px 12px',
           }}
           formatter={(value: number, name: string) => {
               const formattedValue = typeof value === 'number' ? value.toFixed(1) : 'N/A';
               if (name === 'avgMood') return [formattedValue, 'Avg Mood (Current)'];
               if (name === 'prevAvgMood') return [formattedValue, 'Avg Mood (Previous)'];
               return [formattedValue, name];
           }}
        />
        {/* Current Period Area */}
        <Area type="monotone" dataKey="avgMood" stroke={primaryColor} fillOpacity={1} fill="url(#colorCurrentMood)" strokeWidth={2} name="avgMood" />
        {/* Previous Period Line (Optional) */}
        <Line type="monotone" dataKey="prevAvgMood" stroke={secondaryColor} strokeWidth={2} strokeDasharray="5 5" name="prevAvgMood" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}