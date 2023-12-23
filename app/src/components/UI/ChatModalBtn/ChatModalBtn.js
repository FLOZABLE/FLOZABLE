import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatModalBtn.module.css";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";

function ChatModalBtn({setIsChatModal}) {
  return (
    <button className={styles.ChatModalBtn}
      onClick={() => {
        setIsChatModal(prev => !prev)
      }}
    >
      <i>
        <FontAwesomeIcon icon={faCommentDots} bounce={true}/>
      </i>
    </button>
  )
};

export default ChatModalBtn;