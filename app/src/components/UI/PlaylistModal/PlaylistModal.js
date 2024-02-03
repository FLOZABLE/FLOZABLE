import { useEffect, useState } from "react";
import SpotifyAuthBtn from "../SpotifyAuthBtn/SpotifyAuthBtn";
import styles from "./PlaylistModal.module.css";
import DropDownButton from "../DropDownButton/DropDownButton";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import SpotifyPlayer from "../SpotifyPlayer/SpotifyPlayer";

const appOrigin = process.env.REACT_APP_LOCATION;
const serverOrigin = process.env.REACT_APP_ORIGIN;


function PlaylistModal({ userInfo, setResponse }) {
  const [playlists, setPlaylists] = useState([]);
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [link, setLink] = useState("");
  const [playLink, setPlayLink] = useState(null);

  const submitURL = () => {
    console.log(link);
    try {
      const url = new URL(link);
      if (url.hostname === "open.spotify.com") {
        const urlPaths = url.pathname.split("/");
        if (urlPaths[1] !== "embed") {
          urlPaths.unshift("embed");
          const modifiedURL = "https://open.spotify.com/" + urlPaths.join("/");
          setPlayLink(modifiedURL);
        } else {
          setPlayLink(link);
        };
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
          setPlaylists(data.data);
          setSpotifyLoggedIn(true);
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
      </div>
      {/* <DropDownButton
        options={[
          { name: "Playlist1", value: 0 },
          { name: "Playlist1", value: 1 },
        ]}
        setValue={setPlaylist}
      /> */}
      <CustomInput
        input={link}
        handleInput={handleLinkInput}
        handleEnter={submitURL}
        icon={faLink}
        placeHolder={"or Paste a playlist Link!"}
        type={"text"}
      />
      <div className={styles.spotifyPlayerWrapper}>
        <SpotifyPlayer
          link={playLink}
        />
      </div>
    </div>
  )
};

export default PlaylistModal;