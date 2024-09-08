import React, { useEffect, useState } from "react";
import styles from "./LikeBtn.module.css";

const LikeBtn = ({ liked, onClick }) => {
  const [likedBtn, setLikedBtn] = useState(false);

  useEffect(() => {
    setLikedBtn(liked);
  }, [liked]);

  return (
    <div
      className={`${styles.LikeBtn} ${likedBtn ? styles.liked : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        setLikedBtn(!likedBtn);
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
