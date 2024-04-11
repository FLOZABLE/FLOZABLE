import styles from "./FriendsViewer.module.css";
import React from 'react';
import ProfileImage from "../../Users/ProfileImage/ProfileImage";
import Link from "next/link";

function FriendsViewer({ friends }) {
  return (
    <div className={styles.FriendsViewer}>
      {friends.map((friend, i) => {
        const { user_id, name } = friend;
        return (
          <Link href={`/dashboard/user/${user_id}`} key={i}>
            <div className={styles.profileWrapper}>
              <ProfileImage userId={user_id}/>
              <div className={styles.name}>
                {name}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  );
};

export default FriendsViewer;