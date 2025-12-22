import React from 'react';
import { motion } from 'framer-motion';

const PerformanceGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No performance data available</p>
      </div>
    );
  }

  // Prepare data for graph
  const maxPercentage = Math.max(...data.map(d => d.percentage), 100);
  const minPercentage = 0;
  const range = maxPercentage - minPercentage || 100;

  // Calculate points for line graph
  const width = 100;
  const height = 200;
  const padding = 20;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const points = data.map((item, index) => {
    const x = padding + (data.length > 1 ? (index / (data.length - 1)) * graphWidth : graphWidth / 2);
    const y = padding + graphHeight - ((item.percentage - minPercentage) / range) * graphHeight;
    return { x, y, ...item };
  });

  // Create path for line
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Format month labels
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = padding + graphHeight - ((value - minPercentage) / range) * graphHeight;
            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-slate-500"
                >
                  {value}%
                </text>
              </g>
            );
          })}

          {/* Area under curve - only if we have points */}
          {points.length > 0 && (
            <path
              d={`${pathData} L ${points[points.length - 1].x} ${padding + graphHeight} L ${padding} ${padding + graphHeight} Z`}
              fill="url(#gradient)"
              opacity="0.2"
            />
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Line - only if we have points */}
          {points.length > 0 && (
            <motion.path
              d={pathData}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          )}

          {/* Data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#0ea5e9"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-4">
        {data.map((item, index) => (
          <span
            key={index}
            className="text-xs text-slate-500"
          >
            {formatMonth(item.month)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PerformanceGraph;

