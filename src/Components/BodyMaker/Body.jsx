import React, { useId } from "react";

import { shade } from "../../utils/color";
import { BODY_PATHS, NECK_PATH } from "./bodyPaths";

import styles from "./index.module.scss";

// Cel shading: a dark rim on the right edge of every part (light comes from the upper left).
const RIM = 4;

const Body = ({ bodyColor = "#EDC4B0", className = styles.body, x, y, children }) => {
  const clipId = useId();

  return (
    <svg
      className={className || undefined}
      x={x}
      y={y}
      width="191"
      height="532"
      viewBox="0 0 191 532"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
    >
      <defs>
        <clipPath id={clipId}>
          {BODY_PATHS.map((d) => <path key={d.slice(0, 16)} d={d} />)}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="-10" y="0" width="211" height="540" fill={shade(bodyColor, 0.22)} />
        <g transform={`translate(-${RIM} 0)`}>
          {BODY_PATHS.map((d) => <path key={d.slice(0, 16)} d={d} fill={bodyColor} />)}
        </g>
      </g>
      <path d={NECK_PATH} fill={shade(bodyColor, 0.15)} />
      {children}
    </svg>
  );
};

export default Body;
