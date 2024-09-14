import React from "react";
import styles from "./LikeBtn.module.css";

const LikeBtn = ({ liked, onClick }) => {
  return (
    <div
      className={`${styles.LikeBtn} ${liked ? styles.liked : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className={styles.likeIcon}>
        <div className={styles.heartAnimation1}></div>
        <div className={styles.heartAnimation2}></div>
      </span>
    </div>
  );
};

export default LikeBtn;
