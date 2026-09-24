import React, { useId } from "react";

import Body from "./Body";
import Head from "./Head";
import Outfit from "./Outfit";
import { CHARACTER_CANVAS as C } from "./bodyPaths";
import { characterManifest, hasRasterBody, layerUrl, tintMatrix } from "./characterLayers";

import styles from "./index.module.scss";

const VIEWBOX = `${C.x} ${C.y} ${C.width} ${C.height}`;
const SLOT_ORDER = ["shirt", "shorts", "boots", "gloves"];

const InkFilter = ({ id }) => (
    <filter id={id} x="-5%" y="-3%" width="110%" height="106%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="1.8" result="grown"/>
        <feFlood floodColor="#16181a"/>
        <feComposite in2="grown" operator="in" result="outline"/>
        <feMerge>
            <feMergeNode in="outline"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
);

const TintFilter = ({ id, color, refLum }) => (
    <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={tintMatrix(color, refLum)}/>
    </filter>
);

const Layer = ({ href, filter }) => (
    <image href={href} x={C.x} y={C.y} width={C.width} height={C.height} filter={filter}/>
);

// outfit: { shirt, shorts, boots, gloves }, each { id, look, tint? } or null.
// tint recolors a neutral layer (the opponents' plain kit) to that color.
const RasterCharacter = ({ id, appearance, outfit }) => {
    const layers = SLOT_ORDER.map((slot) => {
        const item = outfit[slot];
        const href = item ? layerUrl(item.id) : null;
        return { slot, item, href };
    });
    // SVG pieces only for items without a layer; false keeps Outfit from drawing its default shorts.
    const svgFallback = Object.fromEntries(layers.map(({ slot, item, href }) => [slot, item && !href ? item.look : false]));

    const draw = (slot) => layers.filter((l) => l.slot === slot && l.href).map(({ item, href }) => {
        const tint = item.tint ? `${id}-tint-${slot}` : undefined;
        return (
            <g key={slot}>
                {tint ? <defs><TintFilter id={tint} color={item.tint} refLum={characterManifest.layers[item.id]?.refLum ?? 235}/></defs> : null}
                <Layer href={href} filter={tint ? `url(#${tint})` : undefined}/>
            </g>
        );
    });

    return (
        <>
            <defs>
                <TintFilter id={`${id}-skin`} color={appearance.bodyColor} refLum={characterManifest.skinLum}/>
            </defs>
            <Layer href={layerUrl("base")} filter={`url(#${id}-skin)`}/>
            {/* the shirt is tucked in, so shorts (or the grey underwear) go over it */}
            {draw("shirt")}
            {outfit.shorts ? draw("shorts") : <Layer href={layerUrl("underwear")}/>}
            {draw("boots")}
            {draw("gloves")}
            <svg overflow="visible">
                <Outfit {...svgFallback}/>
            </svg>
            <g filter={`url(#${id}-ink)`}>
                <Head {...appearance} className="" x={70} y={-5}/>
            </g>
        </>
    );
};

// The whole character in one SVG. With generated layers (see characterLayers.js) the body
// and clothes are raster art under an SVG head; otherwise everything is SVG and a single
// filter draws the ink outline around the silhouette.
const Character = ({ appearance, outfit = {}, className = styles.character, width = C.width }) => {
    const id = useId();
    const looks = Object.fromEntries(Object.entries(outfit).map(([slot, item]) => [slot, item?.look ?? null]));

    return (
        <svg
            className={className || undefined}
            width={width}
            height={(width * C.height) / C.width}
            viewBox={VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <InkFilter id={`${id}-ink`}/>
            </defs>
            {hasRasterBody ? (
                <RasterCharacter id={id} appearance={appearance} outfit={outfit}/>
            ) : (
                <g filter={`url(#${id}-ink)`}>
                    <Body bodyColor={appearance.bodyColor} className="" x={0} y={0}>
                        <Outfit {...looks}/>
                    </Body>
                    <Head {...appearance} className="" x={70} y={-5}/>
                </g>
            )}
        </svg>
    );
};

export default Character;
