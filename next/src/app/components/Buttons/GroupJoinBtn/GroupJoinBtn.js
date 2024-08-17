import styles from "./GroupJoinBtn.module.css";
import { ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import { useContext } from "react";
import Link from "next/link";

export default function GroupJoinBtn({ groupInfo }) {
  const { userInfo } = useContext(UserInfoContext);

  const { setJoinGroupModal } = useContext(ModalsContext);

  return (
    <div className={styles.GroupJoinBtn}>
      {groupInfo.members.includes(userInfo?.user_id) ? (
        <Link
          href={`/dashboard/study?group=${groupInfo.group_id}`}
          className={styles.joinBtn}
        >
          Join the session
        </Link>
      ) : (
        <div
          onClick={() => {
            setJoinGroupModal({
              open: true,
              group: groupInfo,
            });
          }}
          className={styles.joinBtn}
        >
          Join
        </div>
      )}
    </div>
  );
}
