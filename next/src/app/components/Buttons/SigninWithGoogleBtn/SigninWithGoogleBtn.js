import React, { useContext } from "react";
import styles from "./SigninWithGoogleBtn.module.css";
import { useGoogleLogin } from "@react-oauth/google";
import config from "@/app/utils/config";
import { Google } from "@/app/utils/Svg";
import {
  ResponseContext,
  TutorialsContext,
  ModalsContext,
  UserInfoContext,
} from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";

function SigninWithGoogleBtn({ infoText }) {
  const { setResponse } = useContext(ResponseContext);
  const { setTutorial } = useContext(TutorialsContext);
  const { useAccountRefetch } = useContext(UserInfoContext);
  const { setIsAccountModal } = useContext(ModalsContext);

  const router = useRouter();

  const login = useGoogleLogin({
    select_account: true,
    onSuccess: (response) => {
      const { access_token } = response;
      fetch(`${config.server}/auth/signin/google`, {
        method: "POST",
        body: JSON.stringify({
          access_token,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          if (data.success) {
            if (data.newUser) {
              router.push("/dashboard?welcome=true");
              setTutorial(1);
            }
            setTimeout(() => {
              setIsAccountModal(false);
              useAccountRefetch();
            }, 100);
          }
        });
    },
  });

  return (
    <div className={styles.SigninWithGoogleBtn}>
      <div onClick={login} className={styles.googleBtnWrapper}>
        <Google />
        <div className={styles.textWrapper}>{infoText}</div>
      </div>
    </div>
  );
}

export default SigninWithGoogleBtn;
