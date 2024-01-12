import styles from "./LabelMovingInput.module.css";

function LabelMovingInput({ title, type, value, setValue }) {
  return (
    <div className={styles.LabelMovingInput}>
      <form onKeyDown={function (e) {
        if (e.key == "Enter") {
          e.preventDefault();
        }
      }}>
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