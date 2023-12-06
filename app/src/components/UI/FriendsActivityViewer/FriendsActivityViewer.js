import {useState} from "react";
import { Link } from "react-router-dom";
import styles from "./FriendsActivityViewer.module.css";
import CountryViewer from "../CountryViewer/CountryViewer";
import { Punch } from "../../../utils/svgs";
import DmBtn from "../DmBtn/DmBtn";
import ChallengeBtn from "../ChallengeBtn/ChallengeBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendsActivityViewer({setResponse}) {
  const [friendsEl, setFriendsEl] = useState([]);
  
  return (
    <div className={styles.FriendsActivityViewer}>
      <Link className={styles.friend}>
        <div className={styles.userInfo}>
        <div className={styles.profileImg}
          style={{
            backgroundImage: `url("${serverOrigin}/profile-images/{user_id}.jpeg")`, backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
        </div>
        <div className={styles.name}>
          Jason
        </div>
        <div className={styles.flagWrapper}>
          <CountryViewer timezone={'America/Los_Angeles'}/>
        </div>
        </div>
        <div className={styles.subject}>
          studying math (0:00:00)
        </div>
        <div className={styles.group}>
          <p>inside <strong>Math club</strong></p> 
        </div>
        <div className={styles.buttons}>
          <ChallengeBtn />
          <DmBtn />
        </div>
      </Link>
      {friendsEl}
    </div>
  )
};

export default FriendsActivityViewer;