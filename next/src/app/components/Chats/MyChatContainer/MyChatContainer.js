import styles from "./MyChatContainer.module.css";

function MyChatContainer({time, m}) {
  return (
    <li className={styles.MyChatContainer}>
      <p className={styles.time}>{time}</p>
      <p>{m}</p>
    </li>
  );
};

export default MyChatContainer;