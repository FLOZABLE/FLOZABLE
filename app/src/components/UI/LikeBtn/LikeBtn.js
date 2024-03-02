import React, { useEffect, useState } from "react";
import styles from "./LikeBtn.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

const LikeBtn = ({id, liked, setResponse, url=`${serverOrigin}/groups/like/${id}`}) => {
  const [likedBtn, setLikedBtn] = useState(false);

  const handleLike = () => {
    fetch(url, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ liked: !likedBtn }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success){
          setResponse(data);
        }
        else{
          setLikedBtn(!likedBtn);
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    setLikedBtn(liked);
  }, [liked]);

  return (
    <div className={`${styles.middleWrapper}`}>
      <div className={styles.likeWrapper}>
        <div
          className={`${styles.likeButton} ${likedBtn ? styles.liked : ""}`}
          onClick={handleLike}
        >
          <span className={styles.likeIcon}>
            <div className={styles.heartAnimation1}></div>
            <div className={styles.heartAnimation2}></div>
          </span>
          {/* Favorite */}
        </div>
      </div>
    </div>
  );
};

export default LikeBtn;