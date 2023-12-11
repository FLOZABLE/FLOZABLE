import React from "react";
import styles from "./TemplateBox.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faDownLeftAndUpRightToCenter,
  faHeart,
  faLink,
  faPeopleGroup,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../../UI/LikeBtn/LikeBtn";
import BlobBtn from "../../UI/BlobBtn/BlobBtn";
import { useState } from "react";

function TemplateBox({ }) {
  const [expand, setExpand] = useState(false);

  return (
    <div className={`${styles.TemplateBox} ${expand ? styles.small : styles.large}`}>
      <div className={styles.photo}>
        <button className={styles.expand} onClick={() => {setExpand(!expand)}}>
          <i>
            {expand ? (
              <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />
            ) : (
              <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
            )}
          </i>
        </button>
      </div>
      <ul className={styles.reactions}>
        <li className={styles.reaction}>
          <FontAwesomeIcon icon={faPeopleGroup} />
          <p>100</p>
          <div className={styles.hoverEl}>
            100 people are using this theme!
          </div>
        </li>
        <li className={styles.reaction}>
          <FontAwesomeIcon icon={faHeart} />
          <p>100</p>
          <div className={styles.hoverEl}>100 people liked this theme!</div>
        </li>
      </ul>
      <div className={styles.info}>
        <div className={styles.name}>
          <p>Nature</p>
        </div>
        <div className={styles.description}>
          <p>Nature Music To Help You Study</p>
          <div className={styles.expandInfo}>
            <i>
              <FontAwesomeIcon icon={faAngleDown} />
            </i>
          </div>
        </div>
        <div className={styles.bottom}>
          <ul className={styles.tags}>
            <li className={styles.tag}>fff</li>
            <li className={styles.tag}>fff</li>
          </ul>
          <div className={styles.buttons}>
            <LikeBtn liked={true} />
            <BlobBtn
              name={"USE THIS TEMPLATE"}
              setClicked={() => {}}
              color1={"var(--pink)"}
              color2={"#fff"}
              opt={1}
            />
            <BlobBtn
              name={<FontAwesomeIcon icon={faLink} />}
              setClicked={() => {}}
              color1={"var(--pink)"}
              color2={"#fff"}
              opt={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateBox;
