"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./AccountModal.module.css";
import {
  faAt,
  faLock,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useEffect, useState } from "react";
import config from "@/app/utils/config";
import { ModalsContext, ResponseContext, UserInfoContext } from "@/app/utils/Contexts";
import ArrowOptionBtn from "@/app/components/Buttons/ArrowOptionBtn/ArrowOptionBtn";
import SigninWithGoogleBtn from "@/app/components/Buttons/SigninWithGoogleBtn/SigninWithGoogleBtn";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import { useRouter } from "next/navigation";

function AccountModal({ }) {
  const {isAccountModal, setIsAccountModal} = useContext(ModalsContext);
  const {bringAccountInfo} = useContext(UserInfoContext);
  const {setResponse} = useContext(ResponseContext);

  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);

  const [signUp, setSignUp] = useState({
    name: "",
    email: "",
    password: "",
    timeZone: null,
  });
  const [login, setLogin] = useState({ email: "", password: "" });

  useEffect(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSignUp((prev) => ({ ...prev, timeZone }));
    } catch (error) {
      console.error("Intl.DateTimeFormat not supported:", error);
      return "UTC";
    }
  }, []);

  return (
    <div className={`${styles.AccountModal} ${isAccountModal ? styles.opened : ""}`}>
      <div className={styles.optionsWrapper}>
        <ArrowOptionBtn clicked={isLogin} setClicked={setIsLogin} />
      </div>
      <div className={`${styles.containers} ${isLogin ? styles.login : ""}`}>
        <div className={styles.container} id={styles.front}>
          <i
            id={styles.closeBtn}
            onClick={() => {
              setIsAccountModal(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
          <div className={styles.contents}>
            <div className={styles.inputWrapper}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faAt} />
              </div>
              <input
                type="text"
                placeholder="Email"
                onChange={(e) => {
                  setLogin((prev) => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>
            <div className={styles.inputWrapper}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faLock} />
              </div>
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => {
                  setLogin((prev) => ({ ...prev, password: e.target.value }));
                }}
              />
            </div>
            <SigninWithGoogleBtn infoText={"Continue With Google"}/>
            <BlobBtn
              name={"SUBMIT"}
              setClicked={() => {
                fetch(`${config.server}/account/signin-authentication`, {
                  method: "post",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(login),
                  credentials:"include"
                })
                  .then((response) => response.json())
                  .then((data) => {
                    setResponse(data);
                    if (data.success) {
                      setIsAccountModal(false);
                      bringAccountInfo();
                    }
                  });
              }}
              color1={"#66c8ff"}
              color2={"#fff"}
            />
          </div>
        </div>
        <div className={styles.container} id={styles.back}>
          <i
            id={styles.closeBtn}
            onClick={() => {
              setIsAccountModal(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
          <div className={styles.contents}>
            <div className={styles.inputWrapper}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faUser} />
              </div>
              <input
                type="text"
                placeholder="Name"
                onChange={(e) => {
                  setSignUp((prev) => ({ ...prev, name: e.target.value }));
                }}
              />
            </div>
            <div className={styles.inputWrapper}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faAt} />
              </div>
              <input
                type="text"
                placeholder="Email"
                onChange={(e) => {
                  setSignUp((prev) => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>
            <div className={styles.inputWrapper}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faLock} />
              </div>
              <input
                type="text"
                placeholder="Password"
                onChange={(e) => {
                  setSignUp((prev) => ({ ...prev, password: e.target.value }));
                }}
              />
            </div>
            <SigninWithGoogleBtn infoText={"Register With Google"}/>
            <BlobBtn
              name={"SUBMIT"}
              setClicked={() => {
                fetch(`${config.server}/account/signup-authentication`, {
                  method: "post",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(signUp),
                  credentials:"include"
                })
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.success) {
                      router.push('/dashboard?welcome=true');
                      setIsLogin(true);
                    }
                  })
                  .catch((error) => console.error(error));
              }}
              color1={"#66c8ff"}
              color2={"#fff"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountModal;