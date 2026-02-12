import React, { useContext } from "react";
import { PrivacyContext } from "../contexts/PrivacyContext";

/**
 * Abbreviates large numbers for chart axis readability.
 * e.g. 1500 → "1.5K", 2300000 → "2.3M", 500 → "500"
 */
export const compactNumber = (value) => {
  if (value == null || isNaN(value)) return '';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(abs % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
  if (abs >= 10_000) return `${sign}${(abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}K`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${abs}`;
};

export const CustomTick = ({x, y, payload, textAnchor, fill, angle, fontSize, dx, dy }) => {
    const { isHidden } = useContext(PrivacyContext);
    // Auto-reduce font size for long values
    const displayValue = isHidden ? '****' : payload.value;
    const len = String(displayValue).length;
    const autoFontSize = len > 8 ? Math.max(8, (fontSize || 14) - (len - 8) * 0.8) 
                        : len > 6 ? Math.max(9, (fontSize || 14) - 1) 
                        : (fontSize || 14);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={dy}
          dx={dx}
          textAnchor={textAnchor}
          fill={fill}
          fontSize={autoFontSize}
          transform={angle ? `rotate(${angle})` : ''}
        >
          {displayValue}
        </text>
      </g>
    );
};

//used for render the label in the pie chart as a percentage inside the pie
export const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const { isHidden } = useContext(PrivacyContext);
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const labelValue = isHidden ? '****' : `${(percent * 100).toFixed(0)}%`;
  
  //if is 0 don't render the label
  if (percent !== 0) {
      return (
          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
              {labelValue}
          </text>
      );
  } else {
      return null; //don't render the label
  }
};