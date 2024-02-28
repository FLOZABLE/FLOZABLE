import { Link } from "react-router-dom";
import styles from "./StudyBtn.module.css";
import React from 'react';

function StudyBtn() {
  return (
    <Link
      to="/dashboard/study"
      className={styles.StudyBtn}
    >
      <h3>Study Now</h3>
    </Link>
  );
};

export default StudyBtn;