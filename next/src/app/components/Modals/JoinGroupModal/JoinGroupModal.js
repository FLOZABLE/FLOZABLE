"use client";

import {
  GroupsContext,
  ModalsContext,
  ResponseContext,
} from "@/app/utils/Contexts";
import styles from "./JoinGroupModal.module.css";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useEffect, useState } from "react";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import { useRouter } from "next/navigation";
import DraggableModal from "../DraggableModal/DraggableModal";
import { postGroupJoin } from "@/Api/groupsApi";

function JoinGroupModal() {
  const { setResponse } = useContext(ResponseContext);
  const { joinGroupModal, setJoinGroupModal } = useContext(ModalsContext);
  const { setMyGroups, groups } = useContext(GroupsContext);

  const router = useRouter();

  const [password, setPassword] = useState("");

  const handlePwInput = (e) => {
    setPassword(e.target.value);
  };

  const submit = useCallback(() => {
    if (!joinGroupModal.group) return;

    const groupId = joinGroupModal.group.group_id;

    (async () => {
      const data = await postGroupJoin(groupId, password);
      setResponse(data);

      if (data.success) {
        setJoinGroupModal({
          open: false,
          group: null,
        });

        setPassword("");

        setMyGroups((prev) => {
          return [...prev, joinGroupModal.group];
        });

        router.push(window.location.pathname, { scroll: false });

        document.body.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    })();
  }, [password, joinGroupModal]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const groupId = searchParams.get("groupId");

    if (!groupId || !groups.length) return;

    const groupInfo = groups.find((group) => group.group_id === groupId);

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
  }, [groups]);

  return (
    <DraggableModal
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
                  input={password}
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
