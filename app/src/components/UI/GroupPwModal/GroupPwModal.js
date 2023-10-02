import React, { useState, useEffect } from "react";
import styles from "./GroupPwModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faLock, faXmark } from "@fortawesome/free-solid-svg-icons";
import BlobBtn from "../BlobBtn/BlobBtn";
import CustomInput from "../CustomInput/CustomInput";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupPwModal(props) {
  const [pwSubmit, setPwSubmit] = useState(false);
  const [pw, setPw] = useState('');

  const handlePwInput = (e) => {
    setPw(e.target.value);
  }
  useEffect(() => {
    const group = props.joinTarget;
    if (pwSubmit) {
      fetch(`${serverOrigin}/api/groups/join/${group.group_id}`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: pw })
        })
        .then((response) => response.json())
        .then((data) => {
          props.setJoinGroupResponse(data);
          if (data.success) {
            props.setOpenGroupPwModal(false);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [pwSubmit]);

  const submit = () => {
    setPwSubmit(true);
    setTimeout(() => {
      setPwSubmit(false);
    }, 2000);
  };

  return (
    <div className={`${styles.GroupPwModal} ${props.openGroupPwModal ? styles.open : ''}`}>
      <div className={styles.header}>
        <i onClick={() => { props.setOpenGroupPwModal(false) }}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.content}>
        <div>
          <i>
            <FontAwesomeIcon icon={faLock} />
          </i>
          <p>This is private group</p>
        </div>
        <div>
          <p>Enter the password to enther this group.</p>
        </div>
        {/* <div className={styles.formGroup}>
          <span className={styles.pwIcon}>
            <i>
              <FontAwesomeIcon icon={faKey} />
            </i>
          </span>
          <input
            className={styles.formField}
            value={pw}
            onChange={handlePwInput}
            type="text"
            placeholder="Password"
          />
        </div> */}
        <CustomInput input={pw} handleInput={handlePwInput} handleEnter={submit} icon={faKey} placeHolder={"Password"} type={"text"} />
        <div className={styles.submitBtnWrapper}>
          <BlobBtn name={'SUBMIT'} setClicked={setPwSubmit} color1={'#fff'} color2={"var(--pink)"} />
        </div>
      </div>
    </div>
  );
};

export default GroupPwModal;