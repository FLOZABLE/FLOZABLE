import BlobBtn from "../BlobBtn/BlobBtn";
import styles from "./DmBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function DmBtn({userInfo, setResponse}) {
  const requestChat = () => {
    fetch(`${serverOrigin}/api/chat/chat-request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {

        }
      })
      .catch((error) => console.error(error));
  }

  return (
    <div className={styles.DmBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn delay={-1} name={<FontAwesomeIcon icon={faComments} />} setClicked={() => { requestChat() }} opt={2} />
      </div>
      <div className={styles.hoverEl}>
        <p>Chat with {userInfo ? userInfo.name : ''}!</p>
      </div>
    </div>
  );
};

export default DmBtn;