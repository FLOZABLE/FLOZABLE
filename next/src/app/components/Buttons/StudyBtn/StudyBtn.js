"use client";

import Link from "next/link";
import styles from "./StudyBtn.module.css";
import { useTour } from "@reactour/tour";
import { useEffect } from "react";

export default function StudyBtn() {
  const { currentStep, setCurrentStep } = useTour();
  useEffect(() => {
    setCurrentStep(8);
  }, []);
  return (
    <Link
      href={"/dashboard/study"}
      className={styles.StudyBtn}
      data-tutorial={8}
      onClick={() => {
        setCurrentStep(9);
      }}
    >
      <i>Study</i>
    </Link>
  );
}
