import React, { useEffect, useRef } from "react";
import styles from "./UserCamDisp.module.css";
import Webcam from "react-webcam";

function UserCamDisp(props) {
  return (
    <div className={styles.UserCamDisp}>
      <Webcam audio={false}/>
    </div>
  );
};

export default UserCamDisp;