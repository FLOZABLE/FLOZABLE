import React, { useEffect, useState } from "react";
import styles from "./SpotifyAuthBtn.module.css";
import { SpotifyLogo } from "@/app/utils/Svg";
import config from "@/app/utils/config";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code";
const SCOPE = "playlist-read-private";

function SpotifyAuthBtn({ redirectURI }) {

  const [spotifyInfo, setSpotifyInfo] = useState({})

  useEffect(() => {
    fetch(`${config.server}/playlists/spotify-logged-in`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
    }).then((response) => response.json())
      .then((data) => {
        setSpotifyInfo({ name: data.name });
      })
  }, []);

  return (
    <a className={styles.SpotifyAuthBtn} href={`${AUTH_ENDPOINT}?client_id=${config.spotify_client_id}&redirect_uri=${redirectURI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
      {
        spotifyInfo.name ?
        <p>Logged in as {spotifyInfo.name}</p>
        :
        <p>Login with Spotify</p>
      }
      <i className={styles.LogoSize}>
        <SpotifyLogo />
      </i>
    </a>
  )
};

export default SpotifyAuthBtn;