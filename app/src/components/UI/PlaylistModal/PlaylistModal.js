import { useEffect, useState } from "react";
import SpotifyAuthBtn from "../SpotifyAuthBtn/SpotifyAuthBtn";
import styles from "./PlaylistModal.module.css";
import DropDownButton from "../DropDownButton/DropDownButton";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import SpotifyPlayer from "../SpotifyPlayer/SpotifyPlayer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import YouTubeLoginBtn from "../YouTubeLoginBtn/YouTubeLoginBtn";

const appOrigin = process.env.REACT_APP_LOCATION;
const serverOrigin = process.env.REACT_APP_ORIGIN;
const googleClientId = process.env.REACT_APP_CLIENT_ID;


function PlaylistModal({ userInfo, setResponse }) {
  const [playlists, setPlaylists] = useState([]);
  const [playlist, setPlaylist] = useState("");
  const [youtubePlaylist, setYoutubePlaylist] = useState([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
  const [link, setLink] = useState("");
  const [playLink, setPlayLink] = useState(null);
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

  useEffect(() => {
    fetch(`${serverOrigin}/playlists/youtube-playlists`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
        console.log(data, 'playlist youtube');
        if (data.success !== false) {
          const playlistOpts = {};
          data.map((playlist) => {
            playlistOpts[playlist.slice(1, playlist.length).join(",")] = playlist[0];
          });
          setYoutubePlaylists(playlistOpts);
          console.log("Auth success");
          setYoutubeLoggedIn(true);
        }
      }).catch((err) => {
        console.log(err);
      })
  }, []);

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
        <GoogleOAuthProvider
          clientId={googleClientId}
        >
          <YouTubeLoginBtn />
        </GoogleOAuthProvider>
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
          link={playlist}
        />
      </div>
      {
        youtubeLoggedIn ?
          <div>
            <DropDownButton
              options={youtubePlaylists}
              setValue={setYoutubePlaylist}
            />
            <iframe width="720" height="405" src={`https://www.youtube.com/embed/VIDEO_ID?playlist=${youtubePlaylist}`} allowFullScreen></iframe>
          </div>
          :
          <div></div>
      }
    </div>
  )
};

export default PlaylistModal;