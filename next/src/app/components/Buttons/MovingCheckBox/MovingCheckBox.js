import { useEffect, useState } from "react";
import styles from "./MovingCheckBox.module.css";

export default function MovingCheckBox({ checked, onClick, id }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation when checked state changes
    if (checked) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [checked]);
  return (
    <div
      className={`${styles.MovingCheckBox} ${isAnimating  ? styles.checked : ""}`}
    >
      <span className={styles.checkbox}>
        <input type="checkbox" checked={checked} onChange={onClick} />
        <svg>
          <use href={`#${id}`} className={styles.checkbox}></use>
        </svg>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <symbol id={id} viewBox="0 0 22 22">
          <path
            fill="none"
            stroke="currentColor"
            d="M5.5,11.3L9,14.8L20.2,3.3l0,0c-0.5-1-1.5-1.8-2.7-1.8h-13c-1.7,0-3,1.3-3,3v13c0,1.7,1.3,3,3,3h13 c1.7,0,3-1.3,3-3v-13c0-0.4-0.1-0.8-0.3-1.2"
          />
        </symbol>
      </svg>
    </div>
  );
}
