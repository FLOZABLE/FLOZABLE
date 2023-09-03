import React, { useEffect, useState } from "react";
import styles from "./StudyHeader.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faKey, faLink, faUpRightAndDownLeftFromCenter, faUsers, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { AllThemes } from "../../../utils/Themes";
import CustomInput from "../CustomInput/CustomInput";
import VolumeControl from "../VolumeControl/VolumeControl";
import FullScreenBtn from "../FullScreenBtn/FullScreenBtn";

function StudyHeader(props) {
  const [recommendedThems, setRecommendedThems] = useState([]);
  const [link, setLink] = useState([]);
  const [backgrounBtn, setBackgrounBtn] = useState(false);
  const [volumeBtn, setVolumeBtn] = useState(false);
  const [fullScreeenBtn, setFullScreenBtn] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

  const getRecommendedThems = () => {
    setRecommendedThems(
      AllThemes.map((Theme, i) => {
        return (
          <div className={styles.video} key={i} onClick={() => { props.setVideoId(Theme.id) }}>
            <img src={Theme.img} alt={Theme.id} />
          </div>
        );
      })
    );
  };

  useEffect(() => {
    getRecommendedThems();
  }, []);

  const submit = () => {
    try {
      const videoId = new URLSearchParams(new URL(link).search).get("v");
      props.setVideoId(videoId);
    } catch(error) {
      console.error(error)
    };
  };
  return (
    <header className={styles.StudyHeader}>
      <ul>
        <li className={`${backgrounBtn ? styles.open : ''}`}>
          <button onClick={() => {setBackgrounBtn(!backgrounBtn)}}>
            <FontAwesomeIcon icon={faImage} />
          </button>
          <div className={styles.hoverEl}>
            Background
          </div>
          <div className={styles.clickedEl}>
            <div className={styles.videoContainer}>
              {recommendedThems}
              <CustomInput input={link} handleInput={handleLinkInput} handleEnter={submit} icon={faLink} placeHolder={"Paste a Youtube Link"} type={"text"} />
            </div>
          </div>
        </li>
        <li>
          <button onClick={() => {props.setGroupsBtn(!props.groupsBtn)}}>
            <FontAwesomeIcon icon={faUsers} />
          </button>
          <div className={styles.hoverEl}>
            Show Groups
          </div>
        </li>
        <li className={`${volumeBtn ? styles.open : ''}`}>
          <button onClick={() => {setVolumeBtn(!volumeBtn)}}>
            <FontAwesomeIcon icon={faVolumeHigh} />
          </button>
          <div className={styles.hoverEl}>
            Volume
          </div>
          <div className={styles.clickedEl}>
            <VolumeControl setVolume={props.setVolume} volume={props.volume}/>
          </div>
        </li>
        <li className={`${fullScreeenBtn ? styles.open : ''}`}>
          <button onClick={() => {setFullScreenBtn(!fullScreeenBtn)}}>
          <FullScreenBtn setFullScreen={setFullScreen} fullScreen={fullScreen} />
          </button>
          <div className={styles.hoverEl}>
            Full Screen
          </div>
        </li>
      </ul>
    </header>
  );
};

export default StudyHeader;