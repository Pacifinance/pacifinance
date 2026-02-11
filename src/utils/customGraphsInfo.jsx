import React, { useContext } from "react";
import { PrivacyContext } from "../contexts/PrivacyContext";

export const CustomTick = ({x, y, payload, textAnchor, fill, angle, fontSize, dx, dy }) => {
    const { isHidden } = useContext(PrivacyContext);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={dy}
          dx={dx}
          textAnchor={textAnchor}
          fill={fill}
          fontSize={fontSize}
          transform={angle ? `rotate(${angle})` : ''}
        >
          {isHidden ? '****' : payload.value}
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