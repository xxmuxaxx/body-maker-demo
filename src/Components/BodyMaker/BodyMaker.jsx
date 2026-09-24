import React, { useState } from "react";
import { useNavigate } from "react-router";

import Character from "./Character";
import Input from "../utils/Input/Input";
import Radios from "../utils/Radios/Radios";

import styles from "./index.module.scss";
import BodyChangeColor from "./BodyChangeColor";
import { useGameStore } from "../../store/gameStore";
import { outfitLooks } from "../../game/stats";

const BodyMaker = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);
  const saveProfile = useGameStore((state) => state.saveProfile);
  const inventory = useGameStore((state) => state.inventory);
  const equipped = useGameStore((state) => state.equipped);

  const [nickname, setNickname] = useState(profile.nickname);
  const [sex, setSex] = useState(profile.sex);
  const [bodyType, setBodyType] = useState(profile.bodyType);
  const [appearance, setAppearance] = useState(profile.appearance);
  const [saved, setSaved] = useState(false);

  const update = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setAppearance((old) => ({ ...old, [key]: value }));
    setSaved(false);
  };

  const onSave = () => {
    const isFirstSave = !profile.created;
    saveProfile({ nickname: nickname.trim() || "Игрок", sex, bodyType, appearance });
    if (isFirstSave) {
      navigate("/cloakroom");
    } else {
      setSaved(true);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <div className={styles.block}>
          <Input
            label="Ваш никнейм"
            value={nickname}
            maxLength={24}
            placeholder="Например, Richard Braveheart"
            onChange={(event) => setNickname(event.target.value)}
          />
        </div>

        <div className={styles.block}>
          <p className={styles.blockTitle}>Настройки персонажа</p>

          <div className={styles.blockGroup}>
            <Radios
              label="Пол"
              name="sex"
              value={sex}
              onChange={(event) => setSex(event.target.value)}
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
              value={bodyType}
              onChange={(event) => setBodyType(event.target.value)}
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
              defaultValue={appearance.bodyColor}
              onChange={update("bodyColor")}
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
              defaultValue={appearance.hairColor}
              checked={appearance.showHair}
              onCheck={update("showHair")}
              onChange={update("hairColor")}
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
              defaultValue={appearance.browsColor}
              checked={appearance.showBrows}
              onCheck={update("showBrows")}
              onChange={update("browsColor")}
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
              defaultValue={appearance.beardColor}
              checked={appearance.showBeard}
              onCheck={update("showBeard")}
              onChange={update("beardColor")}
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
              defaultValue={appearance.eyesColor}
              onChange={update("eyesColor")}
            />
          </div>

          <div className={styles.blockGroup}>
            <BodyChangeColor
              label="Губы"
              name="mouth-color"
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
              defaultValue={appearance.mouthColor}
              onChange={update("mouthColor")}
            />
          </div>

          <button className={styles.save} type="button" onClick={onSave}>
            {profile.created ? (saved ? "Сохранено ✓" : "Сохранить") : "Сохранить и в раздевалку"}
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <Character appearance={appearance} outfit={outfitLooks({ inventory, equipped })} />
      </div>
    </div>
  );
};

export default BodyMaker;
