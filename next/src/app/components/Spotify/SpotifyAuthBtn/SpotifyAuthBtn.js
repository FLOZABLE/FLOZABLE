import React, { useEffect, useState } from "react";
import styles from "./SpotifyAuthBtn.module.css";
import { SpotifyLogo } from "@/app/utils/Svg";
import config from "@/app/utils/config";
import { useSpotifyInfo } from "@/Hooks/accountHooks copy";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";

function SpotifyAuthBtn() {
  const { useSpotifyInfoData, useSpotifyInfoDataIsLoading } = useSpotifyInfo();

  const [spotifyInfo, setSpotifyInfo] = useState(null);

  console.log(useSpotifyInfoData);
  useEffect(() => {
    if (!useSpotifyInfoData) return;

    setSpotifyInfo(useSpotifyInfoData.spotifyInfo);
  }, [useSpotifyInfoData]);
  return (
    <a
      className={styles.SpotifyAuthBtn}
      href={`${config.server}/auth/signin/spotify`}
    >
      {useSpotifyInfoDataIsLoading ? (
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
