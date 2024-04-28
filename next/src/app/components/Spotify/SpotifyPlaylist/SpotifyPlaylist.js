import React, { useContext, useEffect, useState } from "react";
import styles from "./SpotifyPlaylist.module.css";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { ResponseContext } from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import SpotifyAuthBtn from "../SpotifyAuthBtn/SpotifyAuthBtn";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";
import SpotifyPlayer from "../SpotifyPlayer/SpotifyPlayer";
import CustomInput from "../../Inputs/CustomInput/CustomInput";

function SpotifyPlaylist() {
  const { setResponse } = useContext(ResponseContext);

  const [playlist, setPlaylist] = useState("");
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [link, setLink] = useState("");
  const [dropDownOptions, setDropDownOptions] = useState({});

  const submitURL = () => {
    try {
      const url = new URL(link);
      if (url.hostname === "open.spotify.com") {
        const urlPaths = url.pathname.split("/");
        if (urlPaths[1] !== "embed") {
          urlPaths.unshift("embed");
          const modifiedURL = "https://open.spotify.com/" + urlPaths.join("/");
          setPlaylist(modifiedURL);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

  useEffect(() => {
    fetch(`${config.server}/playlists/spotify-playlists`, {
      method: "get",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSpotifyLoggedIn(true);

          const tempOptions = {};
          data.data.map((choice) => {
            const modifiedURL = choice.url.replace(
              "https://open.spotify.com",
              "https://open.spotify.com/embed"
            );
            tempOptions[modifiedURL] = choice.name;
          });
          setDropDownOptions(tempOptions);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className={styles.PlaylistModal}>
      <div className={styles.authGuide}>
        {spotifyLoggedIn ? (
          <div></div>
        ) : (
          <p>Connect your Spotify account to bring your playlists!</p>
        )}
        <SpotifyAuthBtn redirectURI={`${config.location}/dashboard/study`} />
        {spotifyLoggedIn ? (
          <DropDownButton options={dropDownOptions} setValue={setPlaylist} />
        ) : (
          <div></div>
        )}
      </div>
      <div className={styles.spotifyPlayerWrapper}>
        <SpotifyPlayer link={playlist} />
      </div>
      <CustomInput
        input={link}
        handleInput={handleLinkInput}
        handleEnter={submitURL}
        icon={faLink}
        placeHolder={"or Paste a playlist Link!"}
        type={"text"}
      />
    </div>
  );
}

export default SpotifyPlaylist;
