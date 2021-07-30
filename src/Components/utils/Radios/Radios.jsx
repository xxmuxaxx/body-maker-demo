import React from "react";

import styles from "./Radios.module.scss";

const Radios = ({ label, name, items }) => {
  return (
    <div className={styles.label}>
      {label && <p className={styles.text}>{label}</p>}
      {items.map((item, index) => (
        <label className={styles.radioLabel} key={`${label}-${index}`}>
          <input
            className={styles.radioInput}
            type="radio"
            name={name}
            value={item.value}
          />
          <span className={styles.radioBox}></span>
          <span className={styles.radioText}>{item.name}</span>
        </label>
      ))}
    </div>
  );
};

export default Radios;
