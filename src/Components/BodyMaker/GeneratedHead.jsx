import React from "react";

import { CHARACTER_CANVAS as C } from "./bodyPaths";
import { headInfo, headUrl, tintMatrix } from "./characterLayers";

// The generated head's layers in body coordinates: skin, hair and the optional beard are
// recolored from the appearance, the ink (outlines, eyes) stays as generated.
const GeneratedHead = ({ id, headKey, beardKey, appearance }) => {
    const info = headInfo(headKey);
    const beard = headInfo(beardKey);
    const layer = (part, filter, key = headKey) => (
        <image href={headUrl(key, part)} x={C.x} y={C.y} width={C.width} height={C.height} filter={filter}/>
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
                {beard ? (
                    <filter id={`${id}-head-beard`} colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values={tintMatrix(appearance.beardColor ?? appearance.hairColor, beard.beardLum)}/>
                    </filter>
                ) : null}
            </defs>
            {layer("skin", `url(#${id}-head-skin)`)}
            {layer("hair", `url(#${id}-head-hair)`)}
            {layer("ink")}
            {beard ? layer("beard", `url(#${id}-head-beard)`, beardKey) : null}
        </g>
    );
};

export default GeneratedHead;
