"use client";

import SlidingOptBtn from "@/app/components/Buttons/SlidingOptBtn/SlidingOptBtn";
import styles from "./page.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { PremiumGold, PremiumPremium } from "@/app/utils/Svg";
import { premiumFeatures } from "@/app/utils/Constant";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";

export default function Premium() {
  const [type, setType] = useState(1);

  return (
    <div>
      <div className={`Main`}>
        {/* <div className="title"></div> */}
        <div className={styles.Premium}>
          <div className={styles.quote}>
            Go Premium. Get Better Productivity.
          </div>
          <div>
            <div className={styles.sliderWrapper}>
              <SlidingOptBtn
                options={{
                  0: `Monthly`,
                  1: `Yearly`,
                }}
                value={type}
                setValue={setType}
              />
            </div>
            <div className={styles.cardContainer}>
              <div className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <i>
                    <PremiumGold />
                  </i>
                  <p className={"jost textGradient"} style={
                    {
                      "--primary": "#517dff",
                      "--secondary": "rgb(66, 186, 255)"
                    }
                  }>
                  Advance
                  </p>
                </div>
                <div className={`${styles.price} jost`}>
                  <small>$</small>
                  2.99
                </div>
                {premiumFeatures[0].map((feature, i) => {
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
                    name={"Get Started"}
                    setClicked={() => {
                    }}
                  />
                </div>
              </div>
              <div className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <i>
                    <PremiumPremium />
                  </i>
                  Premium
                </div>
                {premiumFeatures[0].map((feature, i) => {
                  return (
                    <div className={styles.item} key={i}>
                      <i>
                        <FontAwesomeIcon icon={faCheck} />
                      </i>
                      <p>{feature}</p>
                    </div>
                  );
                })}
                <div className={styles.item}>
                  <i>
                    <FontAwesomeIcon icon={faCheck} />
                  </i>
                  <p>something sdfsdfsd </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
