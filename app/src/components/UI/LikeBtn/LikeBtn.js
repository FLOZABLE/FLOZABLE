import React, { useEffect, useState } from "react";
import styles from "./LikeBtn.module.css";

const LikeBtn = ({id, liked}) => {
  const [likedBtn, setLikedBtn] = useState(false);

  const serverOrigin = process.env.REACT_APP_ORIGIN;

  const handleLike = () => {
    setLikedBtn(!likedBtn);
    fetch(`${serverOrigin}/api/groups/like/${id}`, {
      method: "post",
    })
      .then((response) => response.json())
      .then(() => {})
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    setLikedBtn(liked);
  }, [liked]);

  return (
    <div className={`${styles.middleWrapper}`}>
      <div className={styles.likeWrapper}>
        <a
          className={`${styles.likeButton} ${likedBtn ? styles.liked : ""}`}
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