import React from 'react';

export const CustomTick = ({x, y, payload, textAnchor, fill, angle, fontSize, dx, dy }) => {
    if (!payload || !payload.value) return null;
    
    return (
        <g transform={`translate(${x + (dx || 0)}, ${y + (dy || 0)})`}>
            <text 
                x={0} 
                y={0} 
                dy={16} 
                textAnchor={textAnchor || "middle"} 
                fill={fill} 
                transform={angle ? `rotate(${angle})` : undefined}
                fontSize={fontSize || 12}
            >
                {payload.value}
            </text>
        </g>
    );
};