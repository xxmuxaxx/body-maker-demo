import React from "react";

import Panel from "../../Components/Panel/Panel";

import styles from "./Layout.module.scss";

const Layout = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <Panel />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Layout;
