import React, { useState } from "react";

import Head from "./Head";
import Body from "./Body";

import styles from "./BodyMaker.module.scss";

const BodyMaker = () => {
  const [bodyColor, setBodyColor] = useState("#EDC4B0");
  const [hairColor, setHairColor] = useState("#492B15");
  const [beardColor, setBeardColor] = useState("#492B15");
  const [browsColor, setBrowsColor] = useState("#442A17");
  const [eyesColor, setEyesColor] = useState("#91462D");

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <input
          type="color"
          value={bodyColor}
          onChange={(event) => setBodyColor(event.target.value)}
        />
        <input
          type="color"
          value={hairColor}
          onChange={(event) => setHairColor(event.target.value)}
        />
        <input
          type="color"
          value={beardColor}
          onChange={(event) => setBeardColor(event.target.value)}
        />
        <input
          type="color"
          value={browsColor}
          onChange={(event) => setBrowsColor(event.target.value)}
        />
        <input
          type="color"
          value={eyesColor}
          onChange={(event) => setEyesColor(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Body bodyColor={bodyColor} />
        <Head
          bodyColor={bodyColor}
          hairColor={hairColor}
          beardColor={beardColor}
          browsColor={browsColor}
          eyesColor={eyesColor}
        />
      </div>
    </div>
  );
};

export default BodyMaker;
