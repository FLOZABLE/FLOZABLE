import React, { useCallback, useEffect, useState } from "react";
import styles from "./YouTubePlaylist.module.css";
import DropDownButton from "../DropDownButton/DropDownButton";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginBtn from "../GoogleLoginBtn/GoogleLoginBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;
const googleClientId = process.env.REACT_APP_CLIENT_ID;


function YouTubePlaylist({ }) {
  const [youtubePlaylist, setYoutubePlaylist] = useState("");
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
  const [link, setLink] = useState("");
  const [playingFromLink, setPlayingFromLink] = useState(false);
  const [playLink, setPlayLink] = useState("");
  const [videoIds, setVideoIds] = useState([]);

  const submitURL = () => {
    const searchParams = new URL(link);
    if (searchParams.searchParams.get('list')) {
      setPlayLink(`https://www.youtube.com/embed/videoseries?list=${searchParams.searchParams.get('list')}&autoplay=1`);
      setPlayingFromLink(true);
    }
    else if (searchParams.searchParams.get('v')) {
      setPlayLink(`https://www.youtube.com/embed/${searchParams.searchParams.get('v')}?autoplay=1`);
      setPlayingFromLink(true);
    }
  };

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

  const randomizeVideos = useCallback(() => {
    if (!videoIds.length) return;
    const shuffleVids = shuffle([...videoIds]);
    console.log(shuffleVids);
    setYoutubePlaylist(shuffleVids.join(","));
  }, [videoIds]);

  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

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

  useEffect(() => {
    console.log("Playlist: ", `https://www.youtube.com/embed/VIDEO_ID?playlist=${youtubePlaylist}`);
    setPlayingFromLink(false);
    if (youtubePlaylist.length) {
      const videoIdString = youtubePlaylist
      setVideoIds(videoIdString.split(','));
    }
  }, [youtubePlaylist]);

  return (
    <div className={styles.PlaylistModal}>
      <div className={styles.authGuide}>
        <GoogleOAuthProvider
          clientId={googleClientId}
        >
          <GoogleLoginBtn scope="https://www.googleapis.com/auth/youtube.force-ssl" />
        </GoogleOAuthProvider>
        {
          youtubeLoggedIn ?
            <div>
              <DropDownButton
                options={youtubePlaylists}
                setValue={setYoutubePlaylist}
              />
              <button onClick={() => { randomizeVideos() }}>Shuffle</button>
            </div>
            :
            <div></div>
        }
        {
          youtubeLoggedIn && !playingFromLink ?
            <div>
              {
                youtubePlaylist.length ?
                  <iframe width="720" height="405" src={`https://www.youtube.com/embed/VIDEO_ID?playlist=${youtubePlaylist}`} allowFullScreen></iframe>
                  :
                  <div></div>
              }
            </div>
            :
            <div>
              {
                playingFromLink ?
                  <iframe width="720" height="405" src={playLink} allowFullScreen></iframe>
                  :
                  <span></span>
              }
            </div>
        }
        <CustomInput
          input={link}
          handleInput={handleLinkInput}
          handleEnter={submitURL}
          icon={faLink}
          placeHolder={"or Paste a playlist Link!"}
          type={"text"}
        />
      </div>
    </div>
  )
};

export default YouTubePlaylist;