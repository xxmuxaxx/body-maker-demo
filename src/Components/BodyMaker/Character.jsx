import React, { useId } from "react";

import Body from "./Body";
import Head from "./Head";
import Outfit from "./Outfit";

import styles from "./index.module.scss";

// Whole character in one SVG, so a single filter can draw the ink outline
// around the silhouette like on the generated art.
// outfit: { shirt, shorts, boots, gloves } with item "look" objects (or null).
const Character = ({ appearance, outfit = {}, className = styles.character, width = 207 }) => {
    const id = useId();
    return (
        <svg
            className={className || undefined}
            width={width}
            height={(width * 548) / 207}
            viewBox="-8 -10 207 548"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id={`${id}-ink`} x="-5%" y="-3%" width="110%" height="106%">
                    <feMorphology in="SourceAlpha" operator="dilate" radius="1.8" result="grown"/>
                    <feFlood floodColor="#16181a"/>
                    <feComposite in2="grown" operator="in" result="outline"/>
                    <feMerge>
                        <feMergeNode in="outline"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <g filter={`url(#${id}-ink)`}>
                <Body bodyColor={appearance.bodyColor} className="" x={0} y={0}>
                    <Outfit {...outfit}/>
                </Body>
                <Head {...appearance} className="" x={70} y={-5}/>
            </g>
        </svg>
    );
};

export default Character;
