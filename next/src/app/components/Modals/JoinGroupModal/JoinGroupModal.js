"use client";

import {
  GroupsContext,
  ModalsContext,
  ResponseContext,
} from "@/app/utils/Contexts";
import styles from "./JoinGroupModal.module.css";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import config from "@/app/utils/config";
import { useRouter } from "next/navigation";
import DraggableModal from "../DraggableModal/DraggableModal";

function JoinGroupModal() {
  const { setResponse } = useContext(ResponseContext);
  const { joinGroupModal, setJoinGroupModal } = useContext(ModalsContext);
  const { setMyGroups, setOtherGroups, otherGroups } =
    useContext(GroupsContext);

  const modalRef = useRef(null);

  const router = useRouter();

  const [pw, setPw] = useState("");

  const handlePwInput = (e) => {
    setPw(e.target.value);
  };

  const submit = () => {
    if (!joinGroupModal.group) return;

    const groupId = joinGroupModal.group.group_id;

    fetch(`${config.server}/groups/join/${groupId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: pw }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setJoinGroupModal({
            open: false,
            group: null,
          });

          setPw("");

          setMyGroups((prev) => {
            return [...prev, joinGroupModal.group];
          });

          setOtherGroups((prev) => {
            return prev.filter((group) => {
              return group.group_id != groupId;
            });
          });

          router.push(window.location.pathname, { scroll: false });

          document.body.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const groupId = searchParams.get("groupId");

    if (!groupId || !otherGroups.length) return;

    const groupInfo = otherGroups.find((group) => group.group_id === groupId);

    if (!groupInfo) {
      setResponse({ success: false, reason: "Group not found" });
      return;
    }

    setJoinGroupModal({
      open: true,
      group: groupInfo,
    });

    const params = new URLSearchParams(searchParams);
    params.delete("groupId");

    router.push(window.location.pathname, { scroll: false });
  }, [otherGroups]);

  return (
    <DraggableModal
      refProp={modalRef}
      isOpen={joinGroupModal.open}
      setIsOpen={() => {
        setJoinGroupModal((prev) => {
          return { ...prev, open: false };
        });
      }}
    >
      <div className={`${styles.JoinGroupModal}`}>
        {joinGroupModal?.group ? (
          <div className={`${styles.contents} customScroll`}>
            <div className={styles.text}>Join this group?</div>
            <div className={styles.groupWrapper}>
              <GroupContainer groupInfo={joinGroupModal.group} />
            </div>
            {!joinGroupModal.group.visibility ? (
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
            ) : null}
            <div className={styles.blobWrapper}>
              <BlobBtn onClick={submit}>Join</BlobBtn>
            </div>
          </div>
        ) : null}
      </div>
    </DraggableModal>
  );
}

export default JoinGroupModal;
