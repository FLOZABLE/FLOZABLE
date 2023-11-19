import React from "react";
import styles from "./SmallPlanner.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import SwitchToggleBtn from "../SwitchToggleBtn/SwitchToggleBtn";

function SmallPlanner({ setPlannerBtn, plannerBtn }) {
  return (
    <div className={styles.SmallPlanner}>
      <div className={styles.header}>
        <i
          onClick={() => {
            setPlannerBtn(!plannerBtn);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.inner}>
        <div className={styles.planCount}>
          <div className={styles.done}>
            <p>
              7 <strong>finished</strong>
            </p>
          </div>
          <span className={styles.comma}>,</span>
          <div className={styles.todo}>
            <p>
              7 <strong>to go</strong>
            </p>
          </div>
        </div>
        <SwitchToggleBtn />
        <ul className={`${styles.plans} customScroll`}>
          <li className={styles.plan}>
            <div className={styles.TaskCheckBoxWrapper}>
              <input id={"1"} type="checkbox" name="r" value="2" />
              <label id={"1"}>{"dfdf"}</label>
              <div className={styles.info}>
                <p className={styles.time}>Eng, 12:45-1:30</p>
                <div className={`${styles.description} customScroll`}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Deleniti sunt fugiat ad asperiores, reprehenderit expedita
                  ducimus enim veniam commodi explicabo aliquam ipsa natus atque
                  autem quaerat tenetur accusamus dignissimos amet.
                </div>
              </div>
            </div>
          </li>
          <li className={styles.plan}>
            <div className={styles.TaskCheckBoxWrapper}>
              <input id={"1"} type="checkbox" name="r" value="2" />
              <label id={"1"}>{"dfdf"}</label>
              <div className={styles.info}>
                <p className={styles.time}>Eng, 12:45-1:30</p>
                <div className={`${styles.description} customScroll`}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Deleniti sunt fugiat ad asperiores, reprehenderit expedita
                  ducimus enim veniam commodi explicabo aliquam ipsa natus atque
                  autem quaerat tenetur accusamus dignissimos amet.
                </div>
              </div>
            </div>
          </li>
          <li className={styles.plan}>
            <div className={styles.TaskCheckBoxWrapper}>
              <input id={"1"} type="checkbox" name="r" value="2" />
              <label id={"1"}>{"dfdf"}</label>
              <div className={styles.info}>
                <p className={styles.time}>Eng, 12:45-1:30</p>
                <div className={`${styles.description} customScroll`}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Deleniti sunt fugiat ad asperiores, reprehenderit expedita
                  ducimus enim veniam commodi explicabo aliquam ipsa natus atque
                  autem quaerat tenetur accusamus dignissimos amet.
                </div>
              </div>
            </div>
          </li>
          <li className={styles.plan}>
            <div className={styles.TaskCheckBoxWrapper}>
              <input id={"1"} type="checkbox" name="r" value="2" />
              <label id={"1"}>{"dfdf"}</label>
              <div className={styles.info}>
                <p className={styles.time}>Eng, 12:45-1:30</p>
                <div className={`${styles.description} customScroll`}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Deleniti sunt fugiat ad asperiores, reprehenderit expedita
                  ducimus enim veniam commodi explicabo aliquam ipsa natus atque
                  autem quaerat tenetur accusamus dignissimos amet.
                </div>
              </div>
            </div>
          </li>
          <li className={styles.plan}>
            <div className={styles.TaskCheckBoxWrapper}>
              <input id={"1"} type="checkbox" name="r" value="2" />
              <label id={"1"}>{"dfdf"}</label>
              <div className={styles.info}>
                <p className={styles.time}>Eng, 12:45-1:30</p>
                <div className={`${styles.description} customScroll`}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Deleniti sunt fugiat ad asperiores, reprehenderit expedita
                  ducimus enim veniam commodi explicabo aliquam ipsa natus atque
                  autem quaerat tenetur accusamus dignissimos amet.
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SmallPlanner;
