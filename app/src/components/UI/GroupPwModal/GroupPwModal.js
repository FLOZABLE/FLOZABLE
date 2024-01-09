import React, { useState, useEffect } from "react";
import styles from "./GroupPwModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faLock, faXmark } from "@fortawesome/free-solid-svg-icons";
import BlobBtn from "../BlobBtn/BlobBtn";
import CustomInput from "../CustomInput/CustomInput";
import GroupContainer from "../GroupContainer/GroupContainer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupPwModal({
  joinTarget,
  isGroupPwModal,
  setIsGroupPwModal,
  setJoinGroupResponse,
  setOtherGroups,
  groups,
  setMyGroups,
  myGroups,
  group,
  joinByLink,
  setJoinByLink,
  userInfo,
  groupsViewerRef
}) {
  const [pw, setPw] = useState("");
  const [groupDesc, setGroupDesc] = useState(<div></div>);

  useEffect(() => {
    if (joinByLink) {
      setGroupDesc(
        <div className={styles.joinGroupDescription}>
          <GroupContainer
            isSearched={true}
            groupInfo={joinTarget}
            userInfo={userInfo}
            viewOnly={true}
          />
        </div>
      );
    }
    else {
      setGroupDesc(
        <div></div>
      );
    }
  }, [joinByLink])

  const handlePwInput = (e) => {
    setPw(e.target.value);
  };

  const submit = () => {
    fetch(`${serverOrigin}/groups/join/${joinTarget.group_id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: pw }),
    })
      .then((response) => response.json())
      .then((data) => {
        setJoinGroupResponse(data);
        if (data.success) {
          setIsGroupPwModal(false);
          setOtherGroups(
            groups => {
              return groups.filter((group) => {
                return group.group_id != joinTarget.group_id;
              })
            }
          );
          setMyGroups((myGroups) => { return [...myGroups, joinTarget] });
          setTimeout(() => {
            groupsViewerRef.current.swiper.slideTo(myGroups.length);
          }, 1000);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div
      className={`${styles.GroupPwModal} modal ${isGroupPwModal ? "open" : ""}`}
    >
      <div className={styles.header}>
        {!joinByLink ?
          <p>&nbsp;&nbsp;{joinTarget ? joinTarget.name : ''}</p>
          :
          <span></span>
        }
        <i
          onClick={() => {
            setJoinByLink(false);
            setIsGroupPwModal(false);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      {groupDesc}
      {
        (joinTarget && !joinTarget.visibility) ?
          <div className={styles.content}>
            <div>
              <i>
                <FontAwesomeIcon icon={faLock} />
              </i>
              <p>This is a private group</p>
            </div>
            <div>
              <p>Enter the group password to join</p>
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
            <CustomInput
              input={pw}
              handleInput={handlePwInput}
              handleEnter={submit}
              icon={faKey}
              placeHolder={"Password"}
              type={"text"}
            />
            <div className={styles.submitBtnWrapper}>
              <BlobBtn
                name={"SUBMIT"}
                setClicked={submit}
                color1={"#fff"}
                color2={"var(--pink)"}
                delay={-1}
              />
            </div>
          </div>
          :
          <div className={styles.submitBtnWrapper}>
            <BlobBtn
              name={"JOIN"}
              setClicked={submit}
              color1={"#fff"}
              color2={"var(--pink)"}
              delay={-1}
            />
          </div>
      }
    </div>
  );
}

export default GroupPwModal;