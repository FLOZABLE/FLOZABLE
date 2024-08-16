import { Google } from "@/app/utils/Svg";
import styles from "./GoogleLoginBtn.module.css";
import { useGoogleLogin } from "@react-oauth/google";
import React, { useContext } from "react";
import config from "@/app/utils/config";
import { useAccount, useAccountGoogle } from "@/Hooks/accountHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { usePlans } from "@/Hooks/plansHooks";
import { ResponseContext } from "@/app/utils/Contexts";

function GoogleLoginBtn({ scope, required }) {
  const {userInfo,useAccountRefetch} = useAccount();
  const { googleInfo, useAccountGoogleIsLoading, useAccountGoogleRefetch } =
    useAccountGoogle();
  const { plansRefetch } = usePlans();

  const { setResponse } = useContext(ResponseContext);


  const login = useGoogleLogin({
    flow: "auth-code",
    select_account: true,
    /* redirect_uri: `${config.server}/auth/signin/google/callback`, */
    onSuccess: (response) => {
      const { code } = response;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      fetch(`${config.server}/auth/signin/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, timezone }),
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          if (data.success) {
            if (!userInfo) {
              useAccountRefetch();
            }
            useAccountGoogleRefetch();
            plansRefetch();
          }
        })
        .catch((error) => console.error(error));
    },
    scope,
  });

  return (
    <div className={styles.GoogleLoginBtn} onClick={login}>
      {useAccountGoogleIsLoading ? (
        <CircularLoading />
      ) : !googleInfo ||
        !googleInfo?.scopes?.some((scope) => scope.includes(required)) ? (
        <p>Login with Google</p>
      ) : (
        <p>Logged in as {googleInfo.name}</p>
      )}
      <Google />
    </div>
  );
}

export default GoogleLoginBtn;
