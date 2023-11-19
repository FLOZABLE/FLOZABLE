import React from "react";
import { Link } from "react-router-dom";
import styles from "./Stuckmodal.module.css";

function StuckModal() {
  return (
    <div className={styles.StuckModalContainer}>
      <Link to="/dashboard/study">
        <button>
          <p>Go Study</p>
        </button>
      </Link>
    </div>
  );
}

export default StuckModal;
