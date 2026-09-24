import React, { useId } from "react";

import { SHORTS_PATH } from "./bodyPaths";
import { shade } from "../../utils/color";

// Clothes drawn over the body, in the same 191x532 coordinate space.
// Each slot takes a "look" from the item catalog: colors plus an optional pattern.

const INK = "#16181a";
const RIM = 4;

// Shirt silhouette (from shirt2.svg) placed onto the body.
const SHIRT_PATH = "M140.14 61.0956C140.055 62.6085 140.055 64.2379 139.97 65.7897C139.886 67.6906 139.631 68.0397 137.513 68.2337C133.955 68.544 130.821 68.8156 127.474 69.7079C125.314 70.2898 122.222 71.6864 120.104 71.182C119.553 71.0269 117.322 72.1167 116.941 71.6512C115.501 69.8666 117.266 65.6345 116.249 63.9275C115.529 66.1776 114.767 68.3113 114.047 70.4838C112.564 74.9839 111.251 79.4064 110.785 84.2557C110.743 84.7988 110.7 85.3031 110.658 85.8462C110.404 89.9972 111.632 94.4973 112.522 98.5707C113.284 102.14 113.919 105.631 114.512 109.2C114.512 109.317 114.555 109.394 114.555 109.511C115.783 116.92 115.487 124.446 116.376 131.856C116.842 135.658 117.096 139.343 118.071 143.106C118.537 144.968 118.918 146.792 119.257 148.654C119.384 149.546 120.697 152.417 120.443 153.076C120.4 153.154 120.57 153.348 120.612 153.426C117.689 153.076 113.369 154.163 110.446 154.706C105.914 155.598 101.974 156.025 97.2724 156.219C92.1893 156.413 87.1062 156.025 81.9808 156.025C78.5074 156.025 75.2457 156.529 72.0688 156.219C68.8919 156.568 65.6726 156.025 62.1568 156.025C57.0314 156.025 51.9059 156.413 46.8652 156.219C42.1634 156.025 38.224 155.598 33.6916 154.706C30.8112 154.124 26.4482 153.038 23.5254 153.426C23.5678 153.348 23.7372 153.154 23.6949 153.076C23.4407 152.417 24.7115 149.546 24.8809 148.654C25.2198 146.792 25.601 144.968 26.067 143.106C26.9989 139.305 27.2954 135.658 27.7613 131.856C28.6509 124.485 28.3543 116.92 29.5828 109.511C29.6251 109.278 29.6675 109.006 29.7098 108.774C30.3029 105.398 30.8959 102.023 31.6583 98.6095C32.5479 94.5749 33.7339 90.036 33.5221 85.885C33.1833 80.415 31.7854 75.527 30.1334 70.5225C29.8369 69.5915 29.498 68.6992 29.2015 67.7294C28.7779 66.488 28.3543 65.2077 27.9308 63.9275C27.253 65.1302 27.0412 66.8759 26.4906 68.4277C17.0445 69.8242 9.25045 60.3585 3.99794 53.9187C3.99794 52.9488 -2.22897 52.5784 2.31251 50.6546C2.31251 44.0596 5.18399 38.5562 5.81938 32.2328C6.45476 25.9869 9.92819 19.7798 15.5196 15.9004C16.4091 15.2797 17.2987 14.6202 18.1458 13.9607C18.4424 13.728 18.7389 13.534 19.0354 13.34C20.5603 12.2538 22.1699 11.2451 24.0761 10.6244C28.1849 9.30543 32.3361 8.10282 36.4025 6.51226C40.0031 5.11567 43.7307 4.06823 47.2041 2.51646C48.3901 1.97335 49.8303 1.43023 51.2282 0.731934C53.4309 13.8831 72.5348 17.0643 83.7599 11.3615C88.377 9.07267 91.0456 5.15446 93.5025 1.00349C94.7309 1.5854 95.9593 2.05093 96.9759 2.51646C100.449 4.02943 104.177 5.11567 107.777 6.51226C111.844 8.10282 115.995 9.30543 120.104 10.6244C121.671 11.1288 123.069 11.9046 124.382 12.7969C124.721 13.0297 125.06 13.2624 125.399 13.4952C126.5 14.2711 127.559 15.1246 128.703 15.9004C134.294 19.7411 137.768 25.9869 138.403 32.2328C139.038 38.5562 140.224 44.3753 140.224 50.9703C140.182 54.3454 140.267 57.7593 140.14 61.0956Z";
const SHIRT_TRANSFORM = "translate(-2.5 75) scale(1.3758)";

const BOOT_PATH = "M40 505 L66 505 L66 520 Q69 527 66 532 L31 532 Q25 531 25.5 526 Q26 520 34 518 Q40 515 41 510 Z";
const BOOT_RIGHT = "translate(174 0) scale(-1 1)";
const GLOVE_PATH = "M3 280 L25 280 L27 298 Q29 316 17 322 Q6 324 2 309 Q-1 294 3 280 Z";
const GLOVE_RIGHT = "translate(184.5 -2) scale(-1 1)";

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

// Everything below this line is hidden when the shirt is tucked into the shorts.
const TUCK_Y = 234;

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
            <Shorts id={`${id}-shorts`} look={shorts ?? DEFAULT_SHORTS}/>
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
