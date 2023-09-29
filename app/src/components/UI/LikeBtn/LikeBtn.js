import React, { useEffect, useState } from 'react';
import styles from "./LikeBtn.module.css";

const LikeBtn = (props) => {
  const [liked, setLiked] = useState(false);

  const serverOrigin = process.env.REACT_APP_ORIGIN;

  const handleLike = () => {
    setLiked(!liked);
    fetch(`${serverOrigin}/api/groups/like/${props.id}`, {
      method: 'post'
    })
      .then((response) => response.json())
      .then((data) => {
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    setLiked(props.liked);
  }, [props.liked]);

  return (
    <div className={`${styles.middleWrapper}`}>
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
