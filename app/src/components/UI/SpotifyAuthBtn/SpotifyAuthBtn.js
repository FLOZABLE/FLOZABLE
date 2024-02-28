import React, { useEffect, useState } from "react";
import { SpotifyLogo, SpotifyLogoSmall } from "../../../utils/svgs";
import styles from "./SpotifyAuthBtn.module.css";
import { useSearchParams } from 'react-router-dom';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code";
const SCOPE = "playlist-read-private";
const serverOrigin = process.env.REACT_APP_ORIGIN;

function SpotifyAuthBtn({ userInfo, redirectURI, setResponse }) {

  const [token, setToken] = useState("");
  const [spotifyInfo, setSpotifyInfo] = useState({})
  const [urlParams, setUrlParams] = useSearchParams("");

  useEffect(() => {
    if (!userInfo) return;

    const token = urlParams.get("code");

    if (!token) return;

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
    }).then((response) => response.json())
    .then((data) => {
      if (data.success){
        setSpotifyInfo({ name: data.name });
      }
      setResponse(data);
    })

    setUrlParams("");

  }, [userInfo, urlParams]);

  useEffect(() => {
    fetch(`${serverOrigin}/playlists/spotify-logged-in`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((response) => response.json())
      .then((data) => {
        setSpotifyInfo({ name: data.name });
      })
  }, []);

  return (
    <a className={styles.SpotifyAuthBtn} href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${redirectURI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
      {
        spotifyInfo.name ?
        <p>Logged in as {spotifyInfo.name}</p>
        :
        <p>Login with Spotify</p>
      }
      <i className={styles.LogoSize}>
        <SpotifyLogoSmall />
      </i>
    </a>
  )
};

export default SpotifyAuthBtn;