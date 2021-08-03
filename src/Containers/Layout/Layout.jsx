import React from "react";

import Panel from "../../Components/Panel/Panel";
// import { BodyMaker } from "../../Components/BodyMaker";
import MyAwards from "../../Components/MyAwards/MyAwards";

import styles from "./Layout.module.scss";

const Layout = () => {
  return (
    <div className={styles.wrapper}>
      <Panel />
      <div className={styles.content}>
        {/*<BodyMaker />*/}
        <MyAwards />
      </div>
    </div>
  );
};

export default Layout;
