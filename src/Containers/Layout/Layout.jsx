import React from "react";

import { BodyMaker } from "../../Components/BodyMaker";
import Panel from "../../Components/Panel/Panel";

import styles from "./Layout.module.scss";

const Layout = () => {
  return (
    <div className={styles.wrapper}>
      <Panel />
      <div className={styles.content}>
        <BodyMaker />
      </div>
    </div>
  );
};

export default Layout;
