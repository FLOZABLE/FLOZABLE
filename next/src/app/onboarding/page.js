"use client";

import { useState } from "react";
import styles from "./onboarding.module.css";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <main className={styles.Onboarding}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
          <h3>Welcome to FLOZABLE</h3>
          <div className={styles.progressBar}></div>

          </div>
          <p>Let's help you set-up and customize FLOZABLE, to be your new home for learning</p>
        </div>
        <div className={styles.steps}>
          ggd
        </div>
      </div>
    </main>
  );
}
