import React from "react";

import { CHARACTER_CANVAS as C } from "./bodyPaths";
import { headInfo, headUrl, tintMatrix } from "./characterLayers";

// The generated head's three layers in body coordinates: skin and hair are recolored
// from the appearance, the ink (outlines, eyes) stays as generated.
const GeneratedHead = ({ id, headKey, appearance }) => {
    const info = headInfo(headKey);
    const layer = (part, filter) => (
        <image href={headUrl(headKey, part)} x={C.x} y={C.y} width={C.width} height={C.height} filter={filter}/>
    );
    return (
        <g>
            <defs>
                <filter id={`${id}-head-skin`} colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values={tintMatrix(appearance.bodyColor, info.skinLum)}/>
                </filter>
                <filter id={`${id}-head-hair`} colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values={tintMatrix(appearance.hairColor, info.hairLum)}/>
                </filter>
            </defs>
            {layer("skin", `url(#${id}-head-skin)`)}
            {layer("hair", `url(#${id}-head-hair)`)}
            {layer("ink")}
        </g>
    );
};

export default GeneratedHead;
