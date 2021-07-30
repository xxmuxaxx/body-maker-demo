import React from "react";

import styles from "../utils/Radios/Radios.module.scss";

const BodyChangeColor = ({
  label,
  name,
  items,
  checked,
  defaultValue,
  onCheck,
  onChange,
}) => {
  return (
    <div className={styles.label}>
      <div className={styles.top}>
        {label && <p className={styles.text}>{label}</p>}
        {onCheck && (
          <label className={styles.checkbox}>
            <input
              className={styles.checkboxInput}
              type="checkbox"
              onChange={onCheck}
              checked={checked}
            />
            <span className={styles.checkboxBox}></span>
          </label>
        )}
      </div>
      <div className={styles.flex}>
        {items &&
          items.map((item, index) => (
            <label className={styles.radioLabel} key={`${label}-${index}`}>
              <input
                className={styles.radioInput}
                type="radio"
                name={name}
                value={item.value}
                onChange={onChange}
                checked={defaultValue === item.value}
              />
              <span
                className={styles.colorBox}
                style={{ "--color": item.value }}
              ></span>
              <span className={styles.radioText}>{item.name}</span>
            </label>
          ))}
      </div>
    </div>
  );
};

export default BodyChangeColor;
