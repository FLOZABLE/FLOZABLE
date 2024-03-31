"use client";

import { GroupsContext, ModalsContext, ResponseContext } from "@/utils/Contexts";
import styles from "./JoinGroupModal.module.css";
import { faKey, faLock, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import GroupContainer from "@/Components/Groups/GroupContainer/GroupContainer";
import CustomInput from "@/Components/Inputs/CustomInput/CustomInput";
import BlobBtn from "@/Components/Buttons/BlobBtn/BlobBtn";
import config from "@/utils/config";
import { useRouter } from "next/navigation";

function JoinGroupModal() {
  const { setResponse } = useContext(ResponseContext);
  const { joinGroupModal, setJoinGroupModal } = useContext(ModalsContext);
  const { setMyGroups, setOtherGroups, otherGroups } = useContext(GroupsContext);

  const router = useRouter();

  const [pw, setPw] = useState("");

  const handlePwInput = (e) => {
    setPw(e.target.value);
  };

  const submit = () => {
    if (!joinGroupModal.group) return;

    const groupId = joinGroupModal.group.group_id;

    fetch(`${config.server}/groups/join/${groupId}`, {
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
          setJoinGroupModal({
            open: false,
            group: null
          });

          setPw("");

          setMyGroups(
            prev => {
              return [...prev, joinGroupModal.group]
            }
          );

          setOtherGroups(
            prev => {
              return prev.filter((group) => {
                return group.group_id != groupId;
              })
            }
          );

          router.replace(window.location.pathname, { scroll: false });

          document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const groupId = searchParams.get('groupId');

    if (!groupId || !otherGroups.length) return;

    const groupInfo = otherGroups.find(group => group.group_id === groupId);
    
    if (!groupInfo) {
      setResponse({ success: false, reason: 'Group not found' });
      return;
    };

    setJoinGroupModal({
      open: true,
      group: groupInfo
    });

    /* const params = new URLSearchParams(searchParams);
    params.delete('groupId');

    replace(`${pathname}?${params.toString()}`);
 */
  }, [otherGroups]);

  return (
    <div
      className={`${styles.JoinGroupModal} modal ${joinGroupModal.open ? "open" : ""}`}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setJoinGroupModal(prev => { return { ...prev, open: false } })
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      {joinGroupModal?.group ?
        <div className={styles.contents}>
          <div className={styles.text}>Join this group?</div>
          <div className={styles.groupWrapper}>
            <GroupContainer
              groupInfo={joinGroupModal.group}
            />
          </div>
          {
            (!joinGroupModal.group.visibility) ?
              <div>
                <CustomInput
                  input={pw}
                  handleInput={handlePwInput}
                  handleEnter={submit}
                  icon={faKey}
                  placeHolder={"Enter the group password to join"}
                  type={"text"}
                />
              </div>
              :
              null
          }
          <div className={styles.blobWrapper}>
            <BlobBtn
              name={"Join"}
              setClicked={submit}
              color1={"#fff"}
              color2={"var(--pink)"}
            />
          </div>
        </div>
        :
        null
      }
    </div>
  )
};

export default JoinGroupModal;