import React, { useState, useCallback, useEffect } from "react";
import styles from "./CreateTemplateModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserGroup, faPalette, faFileLines, faTags, faLock, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import SliderAnimation from "../SliderAnimation/SliderAnimation";
import TextEditor from "../TextEditor/TextEditor";
import CustomInput from "../CustomInput/CustomInput";
import BlobBtn from "../BlobBtn/BlobBtn";
import TagContainerGen from "../TagContainerGen/TagContainerGen";
import OptionToggleBtn from "../OptionToggleBtn/OptionToggleBtn";
import YouTubePlayer from "../YouTubePlayer/YouTubePlayer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function CreateTemplateModal(props) {
  const { isOpen, setIsOpen, setCreateGroupResponse } = props;

  const [name, setName] = useState("");
  const [submit, setSubmit] = useState(false);
  const [maxMembers, setMaxMembers] = useState(10);
  const [color, setColor] = useState('');
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(1);
  const [password, setPassword] = useState("");
  const [goalHr, setGoalHr] = useState(3);

  const handleNameInput = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const handlePwInput = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleCreatedTagsChange = useCallback((tags) => {
    setTags(tags);
  }, []);

  useEffect(() => {
    if (submit) {
      fetch(`${serverOrigin}/api/groups/create-validate`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: name, color: color, tags: tags, explanation: description, max_members: maxMembers, visibility: visibility, password: password, goal_hr: goalHr })
        })
        .then((response) => response.json())
        .then((data) => {
          setCreateGroupResponse(data);
        })
        .catch((error) => console.error(error));
    }
  }, [submit]);

  return (
    <div className={`${styles.CreateTemplateModal} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <i className={styles.closeBtn} onClick={() => { setIsOpen(false) }}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={`${styles.container} customScroll`}>
        <div className={`${styles.wrapper} ${styles.title}`}>
          <div className={styles.iconWrapper}>
          </div>
          <div className={styles.contentWrapper}>
            <CustomInput input={name} handleInput={handleNameInput} icon={null} placeHolder={"Template Name"} type={"text"} />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faTags} />
            <div className={styles.hoverEl}>
              <p>Select Video</p>
            </div>
          </div>
          <div className={`${styles.contentWrapper} ${styles.videoSelector}`}>
          <YouTubePlayer
          height={"100%"}
          width={"100%"}
          videoId={"tvdoDwwSf4Q"}
          volume={100}
        />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faFileLines} />
            <div className={styles.hoverEl}>
              <p>Description</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <TextEditor
              setDescription={setDescription}
              description={description}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faTags} />
            <div className={styles.hoverEl}>
              <p>Tags</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <TagContainerGen maxTags={10}
              setTags={setTags}
              handleCreatedTagsChange={handleCreatedTagsChange} />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faLock} />
            <div className={styles.hoverEl}>
              <p>Visibility</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <OptionToggleBtn opt1={{ val: 0, name: 'PRIVATE' }} opt2={{ val: 1, name: "PUBLIC" }} value={visibility} setValue={setVisibility} />
            <div className={styles.visibilityWrapper}>
            <div className={`${styles.visibility} ${visibility ? '' : styles.open}`}>
              <p>Only you can use this template!</p>
            </div>
            <div className={`${styles.visibility} ${!visibility ? '' : styles.open}`}>
              <p>Everyone can use this template!</p>
            </div>
            </div>
          </div>
        </div>
        <div className={styles.submit}>
          <BlobBtn name={'SUBMIT'} setClicked={setSubmit} color1={'#fff'} color2={"var(--pink)"} />
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateModal;