import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CreateChallengeModal.module.css";
import { faXmark, faFileLines, faClock } from "@fortawesome/free-solid-svg-icons";
import TextEditor from "../TextEditor/TextEditor";
import DateSelector from "../DateSelector/DateSelector";
import BlobBtn from "../BlobBtn/BlobBtn";
import { DateTime } from "luxon";
import React, { useRef } from 'react';
import Draggable from "react-draggable";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function CreateChallengeModal({
  isModalOpen,
  setIsModalOpen,
  title,
  setTitle,
  description,
  setDescription,
  start,
  setStart,
  end,
  setEnd,
  setResponse,
  challenges,
  setChallenges,
  userInfo,
}) {

  const modalRef = useRef(null);

  const submit = () => {

    const reqBody = { title, description, startDate: DateTime.fromJSDate(start).toSeconds() };
    fetch(`${serverOrigin}/challenges/create-challenge`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setIsModalOpen(false);
          setChallenges([...challenges,
          {
            description,
            hostId: userInfo.user_id,
            id: data.challengeId,
            name: title,
            startDate: DateTime.fromJSDate(start).toSeconds(),
            userInfo
          }]);
        };
      });
  }
  return (
    <Draggable nodeRef={modalRef} handle=".header">
      <div className={`${styles.CreateChallengeModal} modal ${isModalOpen ? "open" : ""}`} ref={modalRef}>
        <div className={`${styles.modalHeader} header`}>
          <i onClick={() => { setIsModalOpen(false) }}>
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <div className={styles.container}>
          <div className={`${styles.wrapper} ${styles.title}`}>
            <div className={styles.contentWrapper}>
              <input
                type="text"
                placeholder="Enter Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon icon={faFileLines} />
              <div className={styles.hoverEl}>
                <p>Add Description</p>
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
              <FontAwesomeIcon icon={faClock} />
              <div className={styles.hoverEl}>
                <p>Select Time</p>
              </div>
            </div>
            <div className={styles.contentWrapper}>
              <DateSelector
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
              />
            </div>
          </div>

          <div className={styles.submit}>
            <BlobBtn name={"SUBMIT"} setClicked={submit} delay={-1} />
          </div>
        </div>
      </div>
    </Draggable>
  );
}

export default CreateChallengeModal;