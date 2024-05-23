"use client";

import SlidingOptBtn from "@/app/components/Buttons/SlidingOptBtn/SlidingOptBtn";
import styles from "./page.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { PremiumGold, PremiumPremium } from "@/app/utils/Svg";
import { PREMIUM } from "@/app/utils/Constant";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import { useRouter } from "next/navigation";

export default function Premium() {

  const router = useRouter();

  const [type, setType] = useState(1);

  return (
    <div>
      <div className={`Main`}>
        {/* <div className="title"></div> */}
        <div className={styles.Premium}>
          <div
            className={`${styles.quote} jost textGradient`}
            style={{
              "--primary": "#517dff",
              "--secondary": "rgb(66, 186, 255)",
            }}
          >
            Go Premium. Get Better Productivity.
          </div>
          <div>
            <div className={styles.sliderWrapper}>
              <RadioBtn
                items={[
                  { view: "Monthly", value: 0 },
                  { view: "Yearly", value: 1 },
                ]}
                changeEvent={setType}
                defaultViewer={1}
              />
            </div>
            <div className={styles.cardContainer}>
              <div className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <i>
                    <PremiumGold />
                  </i>
                  <p
                    className={"jost textGradient"}
                    style={{
                      "--primary": "#517dff",
                      "--secondary": "rgb(66, 186, 255)",
                    }}
                  >
                    Advance
                  </p>
                </div>
                <div className={`${styles.price} jost`}>
                  <small>$</small>
                  {type ? 29.99 : 3.99}
                </div>
                {PREMIUM[0].features.map((feature, i) => {
                  return (
                    <div className={styles.item} key={i}>
                      <p>{feature}</p>
                      <i>
                        <FontAwesomeIcon icon={faCheck} />
                      </i>
                    </div>
                  );
                })}
                <div className={styles.blobWrapper}>
                  <BlobBtn
                  onClick={() => {
                    router.push("/payment?product=")
                  }}
                  >Get Started</BlobBtn>
                </div>
              </div>
              <div className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <i>
                    <PremiumPremium />
                  </i>
                  <p
                    className={"jost textGradient"}
                    style={{
                      "--primary": "#517dff",
                      "--secondary": "rgb(66, 186, 255)",
                    }}
                  >
                    Pro
                  </p>
                </div>
                <div className={`${styles.price} jost`}>
                  <small>$</small>
                  {type ? 39.99 : 5.99}
                </div>
                {PREMIUM[0].features.map((feature, i) => {
                  return (
                    <div className={styles.item} key={i}>
                      <p>{feature}</p>
                      <i>
                        <FontAwesomeIcon icon={faCheck} />
                      </i>
                    </div>
                  );
                })}
                <div className={styles.blobWrapper}>
                  <BlobBtn>Get Started</BlobBtn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
