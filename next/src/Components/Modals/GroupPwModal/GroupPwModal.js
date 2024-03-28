import React, { useState, useEffect, useContext } from "react";
import styles from "./GroupPwModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faLock, faXmark } from "@fortawesome/free-solid-svg-icons";
import config from "@/utils/config";
import GroupViewer from "@/Components/Groups/GroupViewer/GroupViewer";
import { GroupsContext, ResponseContext } from "@/utils/Contexts";
import CustomInput from "@/Components/Inputs/CustomInput/CustomInput";
import BlobBtn from "@/Components/Buttons/BlobBtn/BlobBtn";

function GroupPwModal({
  groupInfo,
  isOpen,
  setIsOpen,
  joinByLink,
  setJoinByLink = () => { },
  groupsViewerRef
}) {
  const { setResponse } = useContext(ResponseContext);
  const { setMyGroups, myGroups, setOtherGroups } = useContext(GroupsContext);

  const [pw, setPw] = useState("");

  const handlePwInput = (e) => {
    setPw(e.target.value);
  };

  const submit = () => {
    fetch(`${config.server}/groups/join/${groupInfo.group_id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: pw }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setIsOpen(false);
          setOtherGroups(
            groups => {
              return groups.filter((group) => {
                return group.group_id != groupInfo.group_id;
              })
            }
          );
          setMyGroups((myGroups) => { return [...myGroups, groupInfo] });
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
      className={`${styles.GroupPwModal} modal ${isOpen ? "open" : ""} hiddenScroll`}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setJoinByLink(false);
            setIsOpen(false);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div>
        <div className={styles.groupWrapper}>
          {
            joinByLink ?
              <></>
              :
              <GroupViewer
                groupInfo={groupInfo}
              />
          }
        </div>
        {
          (groupInfo && !groupInfo.visibility) ?
            <div>
              <div className={styles.description}>
                <i>
                  <FontAwesomeIcon icon={faLock} />
                </i>
                {groupInfo.name} is a private group
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
              />
            </div>
        }
      </div>
    </div>
  );
}

export default GroupPwModal;