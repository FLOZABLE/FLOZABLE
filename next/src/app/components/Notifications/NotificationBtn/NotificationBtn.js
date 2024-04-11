import styles from "./NotificationBtn.module.css";

function NotificationBtn({onClick, children, hoverText}) {
  return (
    <div className={styles.NotificationBtn}>
    <button
      onClick={onClick}
    >
      {children}
    </button>
    <div className={styles.hoverDisp}>{hoverText}</div>
  </div>
  );
};

export default NotificationBtn;