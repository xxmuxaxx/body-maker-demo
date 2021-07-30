import React from "react";

import styles from "./Input.module.scss";

const Input = ({ label }) => {
  return (
    <label className={styles.label}>
      {label && <p className={styles.text}>{label}</p>}
      <input className={styles.input} type="text" />
    </label>
  );
};

export default Input;
