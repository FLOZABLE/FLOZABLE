import styles from "./GoogleLoginBtn.module.css";
import { useGoogleLogin } from '@react-oauth/google';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GoogleLoginBtn() {
  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (response) => {
      console.log(response);
      const {code} = response;
      fetch(`${serverOrigin}/api/account/auth/google`, {
        method: "post",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: code}),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => console.error(error));
    },
    scope: "openid email profile https://www.googleapis.com/auth/calendar"
  });
  
  const onSuccess = (response) => {
    console.log(response);
    fetch(`${serverOrigin}/api/account/auth/google`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({data: response.code}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error(error));
  }

  const onFailure = (err) => {
    console.log(err)
  }


  return (
    <div className={styles.GoogleLoginBtn}>
      <button onClick={() => login()}>
        dcodsofodsf
      </button>
    </div>
  )
}

export default GoogleLoginBtn;