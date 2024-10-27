import React, { useEffect, useState } from "react";
import styles from "./SpotifyAuthBtn.module.css";
import { SpotifyLogo } from "@/app/utils/Svg";
import config from "@/app/utils/config";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { useSpotifyInfo } from "@/Hooks/playlistHooks";

function SpotifyAuthBtn() {
  const { spotifyInfoIsLoading, spotifyInfo } = useSpotifyInfo();

  return (
    <a
      className={styles.SpotifyAuthBtn}
      href={`${config.server}/auth/signin/spotify`}
    >
      {spotifyInfoIsLoading ? (
        <CircularLoading />
      ) : spotifyInfo ? (
        <p>Logged in as {spotifyInfo.display_name}</p>
      ) : (
        <p>Login with Spotify</p>
      )}
      <i className={styles.LogoSize}>
        <SpotifyLogo />
      </i>
    </a>
  );
}

export default SpotifyAuthBtn;
