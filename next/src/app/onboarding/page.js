"use client";

import { useState } from "react";
import styles from "./onboarding.module.css";
import Link from "next/link";
import Image from "next/image";
import DropDownButton from "../components/Buttons/DropDownButton/DropDownButton";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);

  const [info, setInfo] = useState({
    language: "english",
    theme: "system",
    job: "student",
  });

  return (
    <main className={styles.Onboarding}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <Link href="/" id={styles.logo}>
              <Image
                src="/logo.png"
                alt="FLOZABLE"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
              />
            </Link>
            <h3>Welcome to FLOZABLE</h3>
            <div className={styles.progressBar}>fffffffffffffffffffffffff</div>
          </div>
          <div>
            <p>
              Let's help you set-up and customize FLOZABLE, to be your new home
              for learning
            </p>
          </div>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.layer}>
              <p className={styles.title}>
                First, select your preferred language.
              </p>
              <DropDownButton
                options={[{ name: "English", value: "english" }]}
                setValue={(value) => setInfo({ ...info, language: value })}
                value={info.language}
              />
            </div>
            <div className={styles.layer}>
              <p className={styles.title}>Then, select your preferred theme.</p>
              <DropDownButton
                options={[
                  { name: "System", value: "system" },
                  { name: "Light", value: "light" },
                  { name: "Dark", value: "dark" },
                ]}
                setValue={(value) => setInfo({ ...info, theme: value })}
                value={info.theme}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
