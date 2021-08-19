import React from 'react';

const CircularProgressBar = ({sqSize, percentage, strokeWidth, }) => {
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - dashArray * percentage / 100;

    return (
        <svg
            width={sqSize}
            height={sqSize}
            viewBox={viewBox} className='circle-progress'>
            <circle
                className="circle-progress__background"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}/>
            <circle
                className="circle-progress__progress"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
                stroke="url(#MyGradient)"
                transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                style={{
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset
                }}/>
            <text
                className="circle-progress__text"
                x="50%"
                y="50%"
                dy=".3em"
                textAnchor="middle">
                {`${percentage}%`}
            </text>
            <defs>
                <linearGradient id="MyGradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="18.87%"  stopColor="#96C83C"/>
                    <stop offset="78.51%" stopColor="#26C273"/>
                </linearGradient>
            </defs>
        </svg>
    );
};

export default CircularProgressBar;