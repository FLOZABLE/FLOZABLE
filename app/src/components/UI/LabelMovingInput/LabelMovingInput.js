import styles from "./LabelMovingInput.module.css";

function LabelMovingInput({ title, type, value, setValue }) {
  return (
    <div className={styles.LabelMovingInput}>
      <form>
        <input
          type={type}
          defaultValue={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <label className={styles.label}>{title}</label>
      </form>
    </div>
  );
}

export default LabelMovingInput;