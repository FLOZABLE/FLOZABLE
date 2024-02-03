import { useEffect, useState } from "react";
import { SpotifyLogo } from "../../../utils/svgs";
import styles from "./SpotifyAuthBtn.module.css";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code";
const SCOPE = "playlist-read-private";
const serverOrigin = process.env.REACT_APP_ORIGIN;

function SpotifyAuthBtn({ userInfo, redirectURI }) {

  const [token, setToken] = useState("");

  useEffect(() => {
    if (!userInfo) return;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("code");

    if (!token) return;
    console.log(token);

    fetch(`${serverOrigin}/playlists/spotify-login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        redirectURI: redirectURI,
        userId: userInfo.user_id
      })
    });

  }, [userInfo]);

  return (
    <a className={styles.SpotifyAuthBtn} href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${redirectURI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
      <p>Login with Spotify</p>
      <i>
        <SpotifyLogo />
      </i>
    </a>
  )
};

export default SpotifyAuthBtn;