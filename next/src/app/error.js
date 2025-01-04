"use client";
import styles from "./error.module.css";

export default function Error() {
  return (
    <main className={styles.Error}>
      <div className={styles.container}>
        <p id={styles.shoot}>Shoot!!</p>
        <p id={styles.unexpected}>Well, this is unexpected...</p>
        <p id={styles.sorry}>
          Sorry, this is not working properly. We now know about this mistake
          and are working to fix it.
        </p>
        <p id={styles.solutions}>In the mean time, here is what you can do:</p>
        <ul id={styles.solutionsList}>
          <li
            onClick={() => {
              window.location.reload();
            }}
            id={styles.refresh}
          >
            Refresh the page
          </li>
          <li>Try again in 30 minutes</li>
          <li>Email us at support@flozable.com and tell us what happened.</li>
        </ul>
      </div>
    </main>
  );
}
