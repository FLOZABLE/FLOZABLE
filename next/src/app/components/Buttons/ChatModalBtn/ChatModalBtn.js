import { faComment } from "@fortawesome/free-solid-svg-icons";
import styles from "./ChatModalBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChatModalContext } from "@/app/utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useChatRooms } from "@/Hooks/chatHooks";

export default function ChatModalBtn({ chatroomId }) {
  const { setChatModal } = useContext(ChatModalContext);
  const { chatrooms } = useChatRooms();

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!chatroomId) {
      const count = chatrooms.reduce(
        (acc, chatroom) => acc + chatroom.unreads || 0,
        0
      );
      setCount(count);
    }

    const chatroom = chatrooms.find(
      (chatroom) => chatroom.chatroom_id === chatroomId
    );
    const count = chatroom?.unreads || 0;
    setCount(count);
  }, [chatrooms, chatroomId]);

  return (
    <div
      className={styles.ChatModalBtn}
      onClick={() => {
        setChatModal((prev) => ({
          ...prev,
          chatroom: null,
          opened: !prev.opened,
          chatroom: chatroomId ? chatroomId : prev.chatroom,
        }));
      }}
    >
      <i>
        <FontAwesomeIcon icon={faComment} bounce={!!count} />
      </i>
      {count ? <div className={styles.count}>{count}</div> : null}
    </div>
  );
}
