import styles from "./ModalLayer.module.css";

export default function ModalLayer({ children, icon, hoverText }) {
  return (
    <div className={styles.ModalLayer}>
      <div className={styles.iconWrapper}>
        {icon}
        {hoverText ? (
          <div className={`HoverText ${styles.hoverText}`}>{hoverText}</div>
        ) : null}
      </div>
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
}
