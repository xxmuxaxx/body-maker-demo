import React from "react";

import styles from "./Input.module.scss";

const Input = ({ label, value, onChange, placeholder, maxLength }) => {
  return (
    <label className={styles.label}>
      {label && <p className={styles.text}>{label}</p>}
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </label>
  );
};

export default Input;
