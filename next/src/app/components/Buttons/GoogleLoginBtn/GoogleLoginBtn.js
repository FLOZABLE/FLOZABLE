import { Google } from "@/app/utils/Svg";
import styles from "./GoogleLoginBtn.module.css";
import { useGoogleLogin } from '@react-oauth/google';
import React from 'react';
import config from "@/app/utils/config";

function GoogleLoginBtn({ scope = "openid email profile https://www.googleapis.com/auth/calendar" }) {

  const login = useGoogleLogin({
    flow: 'auth-code',
    select_account: true,
    onSuccess: (response) => {
      const { code } = response;
      fetch(`${config.server}/account/auth/google`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: code }),
        credentials:"include"
      })
        .then((response) => response.json())
        .then((data) => {
        })
        .catch((error) => console.error(error));
    },
    scope
  });

  return (
    <div className={styles.GoogleLoginBtn} onClick={login}>
      <p>Login with Google</p>
      <Google />
    </div>
  )
}

export default GoogleLoginBtn;