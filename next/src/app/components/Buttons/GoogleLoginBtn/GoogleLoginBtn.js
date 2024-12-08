import { Google } from "@/app/utils/Svg";
import styles from "./GoogleLoginBtn.module.css";
import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import config from "@/app/utils/config";
import { useAccountGoogle } from "@/Hooks/accountHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { getTimezone } from "@/app/utils/Tool";

const redirect_uri = config.server + "/auth/signin/google";

function GoogleLoginBtn({ scope, required }) {
  const { accountGoogleData, accountGoogleIsLoading } = useAccountGoogle();

  const timezone = getTimezone();

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
      {accountGoogleIsLoading ? (
        <CircularLoading />
      ) : !accountGoogleData ||
        !accountGoogleData?.scopes?.some((scope) => scope.includes(required)) ? (
        <p>Login with Google</p>
      ) : (
        <p>Logged in as {accountGoogleData.name}</p>
      )}
      <Google />
    </div>
  );
}

export default GoogleLoginBtn;
