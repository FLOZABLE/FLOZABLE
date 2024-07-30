import styles from "./BounceCheckBox.module.css";

export default function BounceCheckBox({ children, id, checked, onClick }) {
  return (
    <div className={styles.BounceCheckBox}>
      <input
        className={styles.inpCbx}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onClick}
      />
      <label className={styles.cbx} for={id}>
        <span>
          <svg width="0.75rem" height="0.563rem" viewbox="0 0 12 9">
            <polyline points="1 5 4 8 11 1"></polyline>
          </svg>
        </span>
        <span>{children}</span>
      </label>
    </div>
  );
}
