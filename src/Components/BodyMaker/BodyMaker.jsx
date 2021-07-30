import React, { useState } from "react";

import Head from "./Head";
import Body from "./Body";
import Input from "../utils/Input/Input";
import Radios from "../utils/Radios/Radios";

import styles from "./index.module.scss";
import BodyChangeColor from "./BodyChangeColor";

const BodyMaker = () => {
  const [bodyColor, setBodyColor] = useState("#EDC4B0");
  const [hairColor, setHairColor] = useState("#492B15");
  const [showHair, setShowHair] = useState(true);
  const [beardColor, setBeardColor] = useState("#492B15");
  const [showBeard, setShowBeard] = useState(true);
  const [browsColor, setBrowsColor] = useState("#492B15");
  const [showBrows, setShowBrows] = useState(true);
  const [eyesColor, setEyesColor] = useState("#492B15");
  const [mouthColor, setMouthColor] = useState("#D9A191");

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <div className={styles.block}>
          <Input label="Ваш никнейм" />
        </div>

        <div className={styles.block}>
          <p className={styles.blockTitle}>Настройки персонажа</p>

          <div className={styles.blockGroup}>
            <Radios
              label="Пол"
              name="sex"
              items={[
                { value: "man", name: "мужской" },
                { value: "woman", name: "женский" },
              ]}
            />
          </div>

          <div className={styles.blockGroup}>
            <Radios
              label="Телосложение"
              name="body-type"
              items={[
                { value: "1", name: "мезоморф" },
                { value: "2", name: "эктоморф" },
                { value: "3", name: "эндоморф" },
              ]}
            />
          </div>

          <div className={styles.blockGroup}>
            <BodyChangeColor
              label="Цвет кожи"
              name="body-color"
              items={[
                { value: "#202324" },
                { value: "#492B15" },
                { value: "#AC6948" },
                { value: "#EDC4B0" },
                { value: "#DEDEDE" },
                { value: "#05B517" },
                { value: "#00CFDC" },
                { value: "#1A00B8" },
                { value: "#C406C8" },
              ]}
              defaultValue={bodyColor}
              onChange={(event) => setBodyColor(event.target.value)}
            />
          </div>

          <div className={styles.blockGroup}>
            <BodyChangeColor
              label="Волосы"
              name="hair-color"
              items={[
                { value: "#202324" },
                { value: "#492B15" },
                { value: "#C60000" },
                { value: "#DE5D00" },
                { value: "#CD9607" },
                { value: "#05B517" },
                { value: "#00CFDC" },
                { value: "#1A00B8" },
                { value: "#C406C8" },
              ]}
              defaultValue={hairColor}
              checked={showHair}
              onCheck={(event) => setShowHair(event.target.checked)}
              onChange={(event) => setHairColor(event.target.value)}
            />
          </div>

          <div className={styles.blockGroup}>
            <BodyChangeColor
              label="Брови"
              name="brows-color"
              items={[
                { value: "#202324" },
                { value: "#492B15" },
                { value: "#C60000" },
                { value: "#DE5D00" },
                { value: "#CD9607" },
                { value: "#05B517" },
                { value: "#00CFDC" },
                { value: "#1A00B8" },
                { value: "#C406C8" },
              ]}
              defaultValue={browsColor}
              checked={showBrows}
              onCheck={(event) => setShowBrows(event.target.checked)}
              onChange={(event) => setBrowsColor(event.target.value)}
            />
          </div>

          <div className={styles.blockGroup}>
            <BodyChangeColor
              label="Борода"
              name="beard-color"
              items={[
                { value: "#202324" },
                { value: "#492B15" },
                { value: "#C60000" },
                { value: "#DE5D00" },
                { value: "#CD9607" },
                { value: "#05B517" },
                { value: "#00CFDC" },
                { value: "#1A00B8" },
                { value: "#C406C8" },
              ]}
              defaultValue={beardColor}
              checked={showBeard}
              onCheck={(event) => setShowBeard(event.target.checked)}
              onChange={(event) => setBeardColor(event.target.value)}
            />
          </div>

          <div className={styles.blockGroup}>
            <BodyChangeColor
              label="Глаза"
              name="eyes-color"
              items={[
                { value: "#202324" },
                { value: "#492B15" },
                { value: "#C60000" },
                { value: "#DE5D00" },
                { value: "#CD9607" },
                { value: "#05B517" },
                { value: "#00CFDC" },
                { value: "#1A00B8" },
                { value: "#C406C8" },
              ]}
              defaultValue={eyesColor}
              onChange={(event) => setEyesColor(event.target.value)}
            />
          </div>

          <div className={styles.blockGroup}>
            <BodyChangeColor
              label="Губы"
              name="eyes-color"
              items={[
                { value: "#202324" },
                { value: "#D9A191" },
                { value: "#703001" },
                { value: "#C60000" },
                { value: "#DE5D00" },
                { value: "#CD9607" },
                { value: "#05B517" },
                { value: "#00CFDC" },
                { value: "#C406C8" },
              ]}
              defaultValue={mouthColor}
              onChange={(event) => setMouthColor(event.target.value)}
            />
          </div>

          <button className={styles.save} type="button">
            Сохранить
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <Body bodyColor={bodyColor} />
        <Head
          bodyColor={bodyColor}
          hairColor={hairColor}
          showHair={showHair}
          beardColor={beardColor}
          showBeard={showBeard}
          browsColor={browsColor}
          showBrows={showBrows}
          eyesColor={eyesColor}
          mouthColor={mouthColor}
        />
      </div>
    </div>
  );
};

export default BodyMaker;
