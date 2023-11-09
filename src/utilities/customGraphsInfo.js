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
          transform={`rotate(${angle})`}
        >
          {isHidden ? '****' : payload.value}
        </text>
      </g>
    );
  };