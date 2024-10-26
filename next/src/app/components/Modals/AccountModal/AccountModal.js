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
import { ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import ArrowOptionBtn from "@/app/components/Buttons/ArrowOptionBtn/ArrowOptionBtn";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import { useRouter } from "next/navigation";
import GoogleLoginBtn from "../../Buttons/GoogleLoginBtn/GoogleLoginBtn";
import { postAuthSignin, postAuthSignup } from "@/Api/authApi";
import { toast } from "react-toastify";

function AccountModal({}) {
  const { isAccountModal, setIsAccountModal } = useContext(ModalsContext);
  const { accountRefetch } = useContext(UserInfoContext);

  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);

  const [signUp, setSignUp] = useState({
    name: "",
    email: "",
    password: "",
    timeZone: null,
  });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [isNew, setIsNew] = useState(false);

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
    <>
      <div
        className={`${styles.touchBlocker} ${
          isAccountModal ? styles.opened : ""
        }`}
      ></div>
      <div
        className={`${styles.AccountModal} ${
          isAccountModal ? styles.opened : ""
        }`}
      >
        <div className={styles.optionsWrapper}>
          <ArrowOptionBtn clicked={isLogin} setClicked={setIsLogin} />
        </div>
        <div className={`${styles.containers} ${isLogin ? styles.login : ""}`}>
          <form className={styles.container} id={styles.front}>
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
                  autoComplete="current-password"
                  onChange={(e) => {
                    setLogin((prev) => ({ ...prev, password: e.target.value }));
                  }}
                />
              </div>
              <GoogleLoginBtn scope={"email profile"} required={"email"} />
              <BlobBtn
                onClick={async () => {
                  const response = await postAuthSignin(login);
                  toast(response.message, { type: response.status });
                  if (response.success) {
                    setIsAccountModal(false);
                    accountRefetch();
                    if (isNew) {
                      router.push("/dashboard?welcome=true");
                    }
                  }
                }}
              >
                SUBMIT
              </BlobBtn>
            </div>
          </form>
          <form className={styles.container} id={styles.back}>
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
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  onChange={(e) => {
                    setSignUp((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }));
                  }}
                />
              </div>
              <GoogleLoginBtn scope={"email profile"} required={"email"} />
              <BlobBtn
                onClick={async () => {
                  const response = await postAuthSignup(signUp);
                  toast(response.message, { type: response.status });
                  if (response.success) {
                    setIsLogin(false);
                    setIsNew(true);
                  }
                }}
              >
                SUBMIT
              </BlobBtn>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AccountModal;
