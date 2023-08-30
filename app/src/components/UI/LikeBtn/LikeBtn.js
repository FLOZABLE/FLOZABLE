import React, { useState } from 'react';
import styles from "./LikeBtn.module.css";

const LikeBtn = () => {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {

    setLiked(!liked);
    /* setTimeout(() => {
      setLiked(false);
    }, 1000); */
  };

  return (
    <div className={styles.middleWrapper}>
      <div className={styles.likeWrapper}>
        <a
          className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
          onClick={handleLike}
        >
          <span className={styles.likeIcon}>
            <div className={styles.heartAnimation1}></div>
            <div className={styles.heartAnimation2}></div>
          </span>
          {/* Favorite */}
        </a>
      </div>
    </div>
  );
};

export default LikeBtn;
