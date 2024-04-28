import React, { useContext } from "react";
import styles from "./SigninWithGoogleBtn.module.css";
import { useGoogleLogin } from "@react-oauth/google";
import config from "@/app/utils/config";
import { Google } from "@/app/utils/Svg";
import {
  ResponseContext,
  TutorialsContext,
  UserInfoContext,
} from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";

function SigninWithGoogleBtn({ infoText }) {
  const { setResponse } = useContext(ResponseContext);
  const { setTutorial } = useContext(TutorialsContext);
  const { bringAccountInfo } = useContext(UserInfoContext);

  const router = useRouter();

  const login = useGoogleLogin({
    select_account: true,
    onSuccess: (response) => {
      const { access_token } = response;
      console.log(response);
      fetch(`${config.server}/account/signin-with-google`, {
        method: "POST",
        body: JSON.stringify({
          access_token,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          if (data.success) {
            router.push("/dashboard?welcome=true");
            setTutorial(1);
            setTimeout(() => {
              bringAccountInfo();
            }, 100)
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
