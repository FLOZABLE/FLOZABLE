import styles from "./SimpleToggleBtn.module.css";
import generateRandomId from "../../../utils/RandomId";


function SimpleToggleBtn({ clicked, setClicked, id=generateRandomId(10) }) {
  return (
    <div className={styles.SimpleToggleBtn}>
      <input className={`${styles.tgl} ${styles.tglIos}`} id={id} type="checkbox" />
      <label className={styles.tglBtn} htmlFor={id} />
    </div>
  );
};

export default SimpleToggleBtn;