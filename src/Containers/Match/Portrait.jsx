import React from "react";

import {Head} from "../../Components/BodyMaker";

import styles from "./Match.module.scss";

// Head of a character on a round background of their kit color.
const Portrait = ({appearance, kit = "#383B3D", size = 96}) => (
    <div className={styles.portrait} style={{"--kit": kit, width: size, height: size}}>
        <div className={styles.portraitHead} style={{transform: `scale(${size / 110})`}}>
            <Head {...appearance}/>
        </div>
    </div>
);

export default Portrait;
