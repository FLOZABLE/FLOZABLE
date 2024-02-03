import { useEffect, useState } from "react";
import { SpotifyLogo } from "../../../utils/svgs";
import styles from "./SpotifyAuthBtn.module.css";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code";
const SCOPE = "playlist-read-private";
const serverOrigin = process.env.REACT_APP_ORIGIN;

function SpotifyAuthBtn({ userInfo }) {

  const [token, setToken] = useState("");

  useEffect(() => {
    if (!userInfo) return;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("code");

    if (!token) return;

    fetch(`${serverOrigin}/playlists/spotify-refresh-token`, {
      method: 'get',
    }).then((response) => response.json())
      .then((data) => {
        if (data.success) return; //user already authenticated
        fetch(`${serverOrigin}/playlists/spotify-login`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: token,
            redirectURI: window.location.href,
            userId: userInfo.user_id
          })
        });
        setToken(token);
      })
  }, [userInfo]);

  return (
    <a className={styles.SpotifyAuthBtn} href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
      <p>Login with Spotify</p>
      <i>
        <SpotifyLogo />
      </i>
    </a>
  )
};

export default SpotifyAuthBtn;