import React, { useId } from "react";

import {
    BOOT_PATH, BOOT_RIGHT, GLOVE_PATH, GLOVE_RIGHT, SHIRT_PATH, SHIRT_TRANSFORM, SHORTS_PATH, TUCK_Y,
} from "./bodyPaths";
import { shade } from "../../utils/color";

// Clothes drawn over the body, in the same 191x532 coordinate space.
// Each slot takes a "look" from the item catalog: colors plus an optional pattern.

const INK = "#16181a";
const RIM = 4;



const DEFAULT_SHORTS = { base: "#CACACA" };

// Fills a clipped area and adds the dark rim on its right edge, like Body does.
const Piece = ({ id, shape, base, children }) => (
    <g>
        <defs>
            <clipPath id={`${id}-clip`}>{shape}</clipPath>
            <mask id={`${id}-rim`}>
                <g fill="#fff">{shape}</g>
                <g fill="#000" transform={`translate(-${RIM} 0)`}>{shape}</g>
            </mask>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
            <rect x="-20" y="-20" width="240" height="580" fill={base}/>
            {children}
            <rect x="-20" y="-20" width="240" height="580" fill="#000" opacity=".22" mask={`url(#${id}-rim)`}/>
        </g>
        <g fill="none" stroke={INK} strokeWidth="1.4" strokeLinejoin="round">{shape}</g>
    </g>
);

const Shirt = ({ id, look }) => {
    const shape = <path d={SHIRT_PATH} transform={SHIRT_TRANSFORM}/>;
    const trim = look.trim ?? shade(look.base, 0.3);
    return (
        <Piece id={id} shape={shape} base={look.base}>
            {look.pattern === "gradient" ? (
                <>
                    <defs>
                        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor={look.base}/>
                            <stop offset="1" stopColor={look.base2 ?? shade(look.base, 0.3)}/>
                        </linearGradient>
                    </defs>
                    <rect x="-20" y="60" width="240" height="260" fill={`url(#${id}-grad)`}/>
                </>
            ) : null}
            {look.pattern === "sideStripes" ? (
                <g fill={look.base2 ?? trim}>
                    <polygon points="48,172 57,172 54,300 43,300"/>
                    <polygon points="136,172 145,172 152,300 141,300"/>
                </g>
            ) : null}
            {look.pattern === "hoops" ? (
                <g fill={look.base2 ?? trim}>
                    <rect x="-20" y="140" width="240" height="16"/>
                    <rect x="-20" y="190" width="240" height="16"/>
                    <rect x="-20" y="240" width="240" height="16"/>
                </g>
            ) : null}
            {/* sleeve cuffs */}
            <g fill={trim}>
                <polygon points="-4,142 38,167 38,184 -10,160"/>
                <polygon points="150,168 195,162 195,186 150,186"/>
            </g>
            {look.armband ? <polygon points="150,139 196,133 196,143 150,150" fill={look.armband}/> : null}
            {look.emblem ? <circle cx="124" cy="126" r="7" fill={look.emblem} stroke={INK} strokeWidth="1"/> : null}
            {/* fold shadow under the chest */}
            <path d="M40 215 Q95 232 150 215 L150 222 Q95 240 40 222 Z" fill="#000" opacity=".06"/>
            {/* collar */}
            <path d="M68 80 Q72 97 97 96 Q121 96 126 80" fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round"/>
        </Piece>
    );
};

const Shorts = ({ id, look }) => {
    const shape = <path d={SHORTS_PATH}/>;
    return (
        <Piece id={id} shape={shape} base={look.base}>
            {look.trim ? <rect x="-20" y="222" width="240" height="12" fill={look.trim}/> : null}
            {look.pattern === "sideStripe" ? (
                <g fill={look.accent ?? look.trim ?? shade(look.base, -0.6)}>
                    <polygon points="40,226 46,226 39,312 33,312"/>
                    <polygon points="141,226 147,226 154,312 148,312"/>
                </g>
            ) : null}
            {look.pattern === "lightning" ? (
                <g fill={look.accent ?? "#F9D34B"}>
                    <polygon points="56,238 70,238 63,262 73,262 50,302 57,272 47,272"/>
                    <polygon points="116,238 130,238 123,262 133,262 110,302 117,272 107,272"/>
                </g>
            ) : null}
        </Piece>
    );
};

const Boot = ({ id, look, transform }) => {
    const shape = <path d={BOOT_PATH} transform={transform}/>;
    return (
        <Piece id={id} shape={shape} base={look.base}>
            <g transform={transform}>
                <rect x="20" y="527" width="52" height="8" fill={look.sole ?? "#F4F4F4"}/>
                {look.accent ? <polygon points="44,513 63,505 64,510 46,518" fill={look.accent}/> : null}
                <path d="M39 506 L66 506" stroke={shade(look.base, 0.35)} strokeWidth="3"/>
            </g>
        </Piece>
    );
};

const Glove = ({ id, look, transform }) => {
    const shape = <path d={GLOVE_PATH} transform={transform}/>;
    return (
        <Piece id={id} shape={shape} base={look.base}>
            <g transform={transform}>
                <rect x="-5" y="278" width="40" height="9" fill={look.accent ?? shade(look.base, 0.3)}/>
                <path d="M9 300 Q14 312 18 318" fill="none" stroke={shade(look.base, 0.3)} strokeWidth="1.5"/>
            </g>
        </Piece>
    );
};


const Outfit = ({ shirt, shorts, boots, gloves }) => {
    const id = useId();
    return (
        <g>
            {shirt ? (
                <>
                    <defs>
                        <clipPath id={`${id}-tuck`}>
                            <rect x="-20" y="-20" width="240" height={TUCK_Y + 20}/>
                        </clipPath>
                    </defs>
                    <g clipPath={`url(#${id}-tuck)`}>
                        <Shirt id={`${id}-shirt`} look={shirt}/>
                        {/* ink line where the cut-off hem shows at the sides */}
                        <g clipPath={`url(#${id}-shirt-clip)`}>
                            <rect x="-20" y={TUCK_Y - 2} width="240" height="2" fill={INK}/>
                        </g>
                    </g>
                </>
            ) : null}
            {/* shorts === false: the caller draws the shorts itself */}
            {shorts === false ? null : <Shorts id={`${id}-shorts`} look={shorts ?? DEFAULT_SHORTS}/>}
            {boots ? (
                <>
                    <Boot id={`${id}-boot-l`} look={boots}/>
                    <Boot id={`${id}-boot-r`} look={boots} transform={BOOT_RIGHT}/>
                </>
            ) : null}
            {gloves ? (
                <>
                    <Glove id={`${id}-glove-l`} look={gloves}/>
                    <Glove id={`${id}-glove-r`} look={gloves} transform={GLOVE_RIGHT}/>
                </>
            ) : null}
        </g>
    );
};

export default Outfit;
