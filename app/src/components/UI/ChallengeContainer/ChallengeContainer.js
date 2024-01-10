import styles from "./ChallengeContainer.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeContainer({challenge, setChallenges, challenges, setResponse}) {

  function joinChallenge() {
    console.log(challenge);
    const {id} = challenge;
    setChallenges(challenges.filter((challenge) => challenge.id !== id));
    fetch(`${serverOrigin}/challenges/join-challenge`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
  }


  return (
    <div className={styles.ChallengeContainer}>
      <div className={styles.imgWrapper}
      >
        <Link
          to="/dashboard/user${gd}"
          className={styles.profileImg}
          style={{
            backgroundImage: `url("${serverOrigin}/profile-images/{data.data.first_user_id}.jpeg")`, backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
        </Link>
      </div>
      <div className={styles.info}>
        <p className={styles.name}>Jason</p>
        <div className={styles.stat}>
          <p>3</p>/
          <p>0</p>/
          <p>2</p>
        </div>
        <div className={styles.description}>
          description
        </div>
        <div className={styles.start}>
          Dec 17 4PM
        </div>
      </div>
      <div className={styles.button} onClick={() => {joinChallenge()}}>
        <i>
          <FontAwesomeIcon icon={faCheck} />
        </i>
      </div>
    </div>
  )
};

export default ChallengeContainer;