"use client";

import { JoinGroupModalContext, GroupsContext } from "@/app/utils/Contexts";
import styles from "./JoinGroupModal.module.css";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useEffect, useState } from "react";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import { useRouter } from "next/navigation";
import DraggableModal from "../DraggableModal/DraggableModal";
import { postGroupJoin } from "@/Api/groupsApi";
import { toast } from "react-toastify";
import { MittInstance } from "@/app/utils/mittInstance";

function JoinGroupModal() {
  const { joinGroupModal, setJoinGroupModal } = useContext(JoinGroupModalContext);
  const { setMyGroups, groups } = useContext(GroupsContext);

  const router = useRouter();

  const [password, setPassword] = useState("");

  const submit = useCallback(async () => {
    try {
      if (!joinGroupModal.group) return;
      const groupId = joinGroupModal.group.group_id;

      const response = await postGroupJoin(groupId, password);
      if (!response.success) return;

      setJoinGroupModal({
        open: false,
        group: null,
      });

      setPassword("");

      setMyGroups((prev) => {
        return [...prev, joinGroupModal.group];
      });

      setTimeout(() => {
        MittInstance.emit("moveMyGroupsViewer", { groupId });
      }, 100);

      router.push(window.location.pathname, { scroll: false });

      document.body.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.log(err);
    }
  }, [password, joinGroupModal]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const groupId = searchParams.get("groupId");

    if (!groupId || !groups.length) return;

    const groupInfo = groups.find((group) => group.group_id === groupId);

    if (!groupInfo) {
      return toast.error("Group not found");
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
    <div className={styles.JoinGroupModal}>
      <DraggableModal
        isOpen={joinGroupModal.open}
        setIsOpen={() => {
          setJoinGroupModal((prev) => {
            return { ...prev, open: false };
          });
        }}
      >
        <div className={`${styles.inner}`}>
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
                    handleInput={(e) => setPassword(e.target.value)}
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
    </div>
  );
}

export default JoinGroupModal;
