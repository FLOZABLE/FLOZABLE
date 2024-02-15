import { useEffect, useState } from "react";
import styles from "./YouTubePlaylist.module.css";
import DropDownButton from "../DropDownButton/DropDownButton";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { GoogleOAuthProvider } from "@react-oauth/google";
import YouTubeLoginBtn from "../YouTubeLoginBtn/YouTubeLoginBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;
const googleClientId = process.env.REACT_APP_CLIENT_ID;


function YouTubePlaylist({ }) {
  const [youtubePlaylist, setYoutubePlaylist] = useState([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
  const [link, setLink] = useState("");

  const submitURL = () => {
    
  };

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

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
        <GoogleOAuthProvider clientId={googleClientId}>
          <YouTubeLoginBtn />
        </GoogleOAuthProvider>

        <CustomInput
          input={link}
          handleInput={handleLinkInput}
          handleEnter={submitURL}
          icon={faLink}
          placeHolder={"or Paste a playlist Link!"}
          type={"text"}
        />

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
    </div>
  )
};

export default YouTubePlaylist;