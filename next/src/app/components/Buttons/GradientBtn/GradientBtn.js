import styles from "./GradientBtn.module.css";

export default function GradientBtn({ children, onClick }) {
  return (
    <div className={styles.GradientBtn} onClick={onClick}>
      {children}
    </div>
  );
}
