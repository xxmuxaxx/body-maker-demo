import React from "react";

import {HeadAvatar} from "../../Components/BodyMaker";

import styles from "./Match.module.scss";

// Round avatar on the kit color: generated art when there is one, otherwise the SVG head.
const Portrait = ({appearance, sex = "man", art, kit = "#383B3D", size = 96}) => (
    <div className={styles.portrait} style={{"--kit": kit, width: size, height: size}}>
        {art ? (
            <img src={art} className={styles.portraitArt} alt=""/>
        ) : (
            <div className={styles.portraitHead} style={{transform: `scale(${size / 110})`}}>
                <HeadAvatar appearance={appearance} sex={sex}/>
            </div>
        )}
    </div>
);

export default Portrait;
