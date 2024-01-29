import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BlobBtn from "../BlobBtn/BlobBtn";
import styles from "./AccountModal.module.css";
import { faAt, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import ArrowOptionBtn from "../ArrowOptionBtn/ArrowOptionBtn";
import { useState } from "react";

function AccountModal() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className={styles.AccountModal}>
      <div className={styles.optionsWrapper}>
      <ArrowOptionBtn clicked={isLogin} setClicked={setIsLogin} />
      </div>
      <div className={styles.container}>
      <div className={styles.contents}>
        <div className={styles.inputWrapper}>
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <input type="text" />
        </div>
        <div className={styles.inputWrapper}>
        <div className={styles.icon}>
            <FontAwesomeIcon icon={faAt} />
          </div>
          <input type="text" />
        </div>
        <div className={styles.inputWrapper}>
        <div className={styles.icon}>
            <FontAwesomeIcon icon={faLock} />
          </div>
          <input type="text" />
        </div>
        <BlobBtn
          name={"SUBMIT"}
          setClicked={() => {

          }}
          color1={"#fff"}
          color2={"var(--pink)"}
          delay={-1}
        />
      </div>
      </div>
    </div>
  )
};

export default AccountModal;