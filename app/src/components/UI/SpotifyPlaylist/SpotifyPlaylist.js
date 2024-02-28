import React, { useEffect, useState } from "react";
import SpotifyAuthBtn from "../SpotifyAuthBtn/SpotifyAuthBtn";
import styles from "./SpotifyPlaylist.module.css";
import DropDownButton from "../DropDownButton/DropDownButton";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import SpotifyPlayer from "../SpotifyPlayer/SpotifyPlayer";

const appOrigin = process.env.REACT_APP_LOCATION;
const serverOrigin = process.env.REACT_APP_ORIGIN;


function SpotifyPlaylist({ userInfo, setResponse }) {
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
      };
    } catch (err) {
      console.log(err);
    };
  };

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };


  useEffect(() => {
    fetch(`${serverOrigin}/playlists/spotify-playlists`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
        console.log(data, 'playlist');
        if (data.success) {
          setSpotifyLoggedIn(true);

          const tempOptions = {};
          data.data.map((choice) => {
            const modifiedURL = choice.url.replace("https://open.spotify.com", "https://open.spotify.com/embed");
            tempOptions[modifiedURL] = choice.name;
          });
          setDropDownOptions(tempOptions);

        }
      }).catch((err) => {
        console.log(err);
      })
  }, [userInfo]);

  return (
    <div className={styles.PlaylistModal}>
      <div className={styles.authGuide}>
        {
          spotifyLoggedIn ?
            <div></div>
            :
            <p>Connect your Spotify account to bring your playlists!</p>
        }
        <SpotifyAuthBtn setResponse={setResponse} redirectURI={`${appOrigin}/dashboard/study`} userInfo={userInfo} />
        {
          spotifyLoggedIn ?
            <DropDownButton
              options={dropDownOptions}
              setValue={setPlaylist}
            />
            :
            <div></div>
        }
      </div>
      <div className={styles.spotifyPlayerWrapper}>
        <SpotifyPlayer
          link={playlist}
        />
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
  )
};

export default SpotifyPlaylist;