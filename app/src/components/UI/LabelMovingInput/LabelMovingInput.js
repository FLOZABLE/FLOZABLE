import styles from "./LabelMovingInput.module.css";

function LabelMovingInput({ title, type, value, setValue }) {
  return (
    <div className={styles.LabelMovingInput}>
      <input type={type} defaultValue={value} onChange={(e) => {setValue(e.target.value)}}/>
      <label className={styles.label}>{title}</label>
    </div>
  );
};

export default LabelMovingInput;