import React from 'react';
import styles from './Stuckmodal.module.css';

function StuckModal(props) {
  return (
    <div className={styles.StuckModalContainer}>
      <button>
        <a href="#today">TODAY</a>
      </button>
      <button>
        <a href="#weekly">WEEKLY</a>
      </button>
      <button>
        <a href="#monthly">MONTHLY</a>
      </button>
    </div>
  )
}

export default StuckModal;