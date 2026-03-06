import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color = '#2ed573',
  strokeWidth = 2,
  className = '',
}: SparklineProps) {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return '';

    const max = Math.max(...data);
    const min = Math.min(...data);

    // If all values are the same, draw a straight line in the middle
    const range = max === min ? 1 : max - min;

    // Calculate padding so stroke doesn't get cut off
    const padding = strokeWidth;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * drawWidth;
      // SVG y-axis is inverted (0 is top)
      const y = padding + drawHeight - ((value - min) / range) * drawHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, width, height, strokeWidth]);

  if (!data || data.length < 2) {
    return null;
  }

  // Determine trend color if not explicitly provided
  // (In many cases we might want it red if going down, green if going up)
  const isTrendingUp = data[data.length - 1] >= data[0];
  const trendColor = color !== '#2ed573' ? color : (isTrendingUp ? '#2ed573' : '#ff4757');

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={pathData}
        stroke={trendColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
