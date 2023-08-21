import React from 'react';
import styles from './Stuckmodal.module.css';

function StuckModal(props) {
  return (
    <div className={styles.StuckModalContainer}>
      <button>
        <a href="#today">Go <br />Study</a>
      </button>
    </div>
  )
}

export default StuckModal;