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
  setJoinByLink = () => { },
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
          if (groupsViewerRef) {
            document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              groupsViewerRef.current.swiper.slideTo(myGroups.length);
            }, 1000);
          };
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div
      className={`${styles.GroupPwModal} modal ${isGroupPwModal ? "open" : ""} hiddenScroll`}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setJoinByLink(false);
            setIsGroupPwModal(false);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div>
        <div className={styles.groupWrapper}>
          {groupDesc}
        </div>
        {
          (joinTarget && !joinTarget.visibility) ?
            <div>
              <div className={styles.description}>
                <i>
                  <FontAwesomeIcon icon={faLock} />
                </i>
                {joinTarget.name} is a private group
              </div>
              <div className={styles.inputWrapper}>
                <CustomInput
                  input={pw}
                  handleInput={handlePwInput}
                  handleEnter={submit}
                  icon={faKey}
                  placeHolder={"Enter the group password to join"}
                  type={"text"}
                />
              </div>
              <div className={styles.joinBtnWrapper}>
                <BlobBtn
                  name={"Join"}
                  setClicked={submit}
                  color1={"#fff"}
                  color2={"var(--pink)"}
                  delay={-1}
                />
              </div>
            </div>
            :
            <div className={styles.joinBtnWrapper}>
              <BlobBtn
                name={"Join"}
                setClicked={submit}
                color1={"#fff"}
                color2={"var(--pink)"}
                delay={-1}
              />
            </div>
        }
      </div>
    </div>
  );
}

export default GroupPwModal;