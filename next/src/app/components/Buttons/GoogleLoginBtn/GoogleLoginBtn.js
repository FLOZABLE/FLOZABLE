import { Google } from "@/app/utils/Svg";
import styles from "./GoogleLoginBtn.module.css";
import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import config from "@/app/utils/config";
import { useAccountGoogle } from "@/Hooks/accountHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";

const redirect_uri = config.server + "/auth/signin/google";

function GoogleLoginBtn({ scope, required }) {
  const { googleInfo, useAccountGoogleIsLoading } = useAccountGoogle();

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const login = useGoogleLogin({
    flow: "auth-code",
    select_account: true,
    redirect_uri,
    ux_mode: "redirect",
    scope,
    state: JSON.stringify({ timezone }),
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
