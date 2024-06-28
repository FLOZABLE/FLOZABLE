import styles from "./CircularLoading.module.css";

export default function CircularLoading({fontSize = "1rem"}) {
  return (
    <div className={styles.CircularLoading} style={{fontSize}}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
