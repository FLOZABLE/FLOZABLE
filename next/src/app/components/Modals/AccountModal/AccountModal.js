"use client";

import styles from "./AccountModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useEffect, useState } from "react";
import LineInput from "../../Inputs/LineInput/LineInput";
import ShowPasswordBtn from "../../Buttons/ShowPasswordBtn/ShowPasswordBtn";
import { AccountModalContext } from "@/app/utils/Contexts";
import { postAuthSignin, postAuthSignup } from "@/Api/authApi";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import { getTimezone } from "@/app/utils/Tool";
import { useAccount } from "@/Hooks/accountHooks";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleLoginBtn from "../../Buttons/GoogleLoginBtn/GoogleLoginBtn";

export default function AccountModal() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { accountRefetch } = useAccount();

  const { isAccountModal, setIsAccountModal } = useContext(AccountModalContext);

  const [isSignIn, setIsSignIn] = useState(true);

  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({
    email: "",
    password: "",
    name: "",
    timezone: "",
  });

  const [isShowPassword, setIsShowPassword] = useState(false);

  const submitSignIn = useCallback(async () => {
    const response = await postAuthSignin(signIn);
    if (!response.success) return;

    setIsAccountModal(false);
    accountRefetch();
  }, [signIn]);

  const submitSignUp = useCallback(async () => {
    const response = await postAuthSignup(signUp);
    if (!response.success) return;

    accountRefetch();
    setIsSignIn(false);

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("welcome", "true");
    router.replace(`/dashboard?${newSearchParams.toString()}`, {
      scroll: false,
    });
  }, [signUp]);

  useEffect(() => {
    try {
      const timezone = getTimezone();
      setSignUp((prev) => ({ ...prev, timezone }));
    } catch (error) {
      console.error("Intl.DateTimeFormat not supported:", error);
      return "UTC";
    }
  }, []);

  if (isSignIn) {
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
          <div className={styles.header}>
            <h3>Login</h3>
            <i
              className={styles.closeBtn}
              onClick={() => {
                setIsAccountModal(false);
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </i>
          </div>
          <div className={styles.input}>
            <LineInput
              title={"Email"}
              type={"email"}
              value={signIn.email}
              setValue={(email) => setSignIn((prev) => ({ ...prev, email }))}
              icon={<FontAwesomeIcon icon={faUser} />}
            />
          </div>
          <div className={styles.input}>
            <LineInput
              type={isShowPassword ? "text" : "password"}
              title={"Password"}
              value={signIn.password}
              setValue={(password) =>
                setSignIn((prev) => ({ ...prev, password }))
              }
              icon={<FontAwesomeIcon icon={faLock} />}
            />
            <div className={styles.showPasswordBtn}>
              <ShowPasswordBtn
                isShowPassword={isShowPassword}
                setIsShowPassword={setIsShowPassword}
              />
            </div>
          </div>
          <div className={styles.buttons}>
            <BlobBtn onClick={submitSignIn}>Login</BlobBtn>
          </div>
          <div className={styles.options}>
            <GoogleLoginBtn scope={"email profile"} required={"email"} />
            <p
              className={styles.noAccount}
              onClick={() => {
                setIsSignIn(false);
              }}
            >
              {"Don't have an account?"}
            </p>
          </div>
        </div>
      </>
    );
  } else {
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
          <div className={styles.header}>
            <h3>Sign Up</h3>
            <i
              className={styles.closeBtn}
              onClick={() => {
                setIsAccountModal(false);
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </i>
          </div>
          <div className={styles.input}>
            <LineInput
              title={"Name"}
              type={"name"}
              value={signUp.name}
              setValue={(name) => setSignUp((prev) => ({ ...prev, name }))}
              icon={<FontAwesomeIcon icon={faUser} />}
            />
          </div>
          <div className={styles.input}>
            <LineInput
              title={"Email"}
              type={"email"}
              value={signUp.email}
              setValue={(email) => setSignUp((prev) => ({ ...prev, email }))}
              icon={<FontAwesomeIcon icon={faEnvelope} />}
            />
          </div>
          <div className={styles.input}>
            <LineInput
              type={isShowPassword ? "text" : "password"}
              title={"Password"}
              value={signUp.password}
              setValue={(password) =>
                setSignUp((prev) => ({ ...prev, password }))
              }
              icon={<FontAwesomeIcon icon={faLock} />}
            />
            <div className={styles.showPasswordBtn}>
              <ShowPasswordBtn
                isShowPassword={isShowPassword}
                setIsShowPassword={setIsShowPassword}
              />
            </div>
          </div>
          <div className={styles.buttons}>
            <BlobBtn onClick={submitSignUp}>Sign Up</BlobBtn>
          </div>
          <div className={styles.options}>
            <GoogleLoginBtn scope={"email profile"} required={"email"} />
            <p
              className={styles.noAccount}
              onClick={() => {
                setIsSignIn(true);
              }}
            >
              {"Already have an account?"}
            </p>
          </div>
        </div>
      </>
    );
  }
}
