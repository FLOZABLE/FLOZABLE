import React from "react";
import styles from "./TemplateBox.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faBullseye, faDownLeftAndUpRightToCenter, faHeart, faLink, faPeopleGroup, faPlus, faStopwatch, faTags, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import LikeBtn from '../../UI/LikeBtn/LikeBtn';
import BlobBtn from '../../UI/BlobBtn/BlobBtn';

function TemplateBox(props) {
  const { expand, expandInfo, templateId } = props;

  return (
    <div className={styles.TemplateBox}>
      <div className={styles.photo}>
        <button className={styles.expand}><i>{expand ? <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} /> : <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />}</i></button>
      </div>
      <ul className={styles.reactions}>
        <li className={styles.reaction}>
          <FontAwesomeIcon icon={faPeopleGroup} />
          <p>100</p>
          <div className={styles.hoverEl}>
            100 people are using this template!
          </div>
        </li>
        <li className={styles.reaction}>
          <FontAwesomeIcon icon={faHeart} />
          <p>100</p>
          <div className={styles.hoverEl}>
            100 people liked this template!
          </div>
        </li>
      </ul>
      <div className={styles.info}>
        <div className={styles.name}>
          <p>Something</p>
        </div>
        <div className={styles.description}>
          <p>this is something</p>
          <div className={styles.expandInfo}>
            <i>
              <FontAwesomeIcon icon={faAngleDown} />
            </i>
          </div>
        </div>
        <div className={styles.bottom}>
          <ul className={styles.tags}>
            <li className={styles.tag} >fff</li>
            <li className={styles.tag} >fff</li>
          </ul>
          <div className={styles.buttons}>
            <LikeBtn liked={true} />
            <BlobBtn name={'USE THIS TEMPLATE'} setClicked={() => { }} color1={'var(--pink)'} color2={"#fff"} opt={1} />
            <BlobBtn name={<FontAwesomeIcon icon={faLink} />} setClicked={() => { }} color1={'var(--pink)'} color2={"#fff"} opt={1} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateBox;