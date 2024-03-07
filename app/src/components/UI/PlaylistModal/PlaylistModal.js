import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./PlaylistModal.module.css";
import SpotifyPlaylist from "../SpotifyPlaylist/SpotifyPlaylist";
import YouTubePlaylist from "../YouTubePlaylist/YouTubePlaylist";

const appOrigin = process.env.REACT_APP_LOCATION;
const serverOrigin = process.env.REACT_APP_ORIGIN;

function PlaylistModal({ userInfo, setResponse }) {

  const [playlistType, setPlaylistType] = useState(-1);
  const [playlistEl, setPlaylistEl] = useState(<div></div>);
  const [urlParams, setUrlParams] = useSearchParams("");

  useEffect(() => {
    if (!userInfo) return;

    const token = urlParams.get("code");
    const redirectURI=`${appOrigin}/dashboard/study`;

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
      setResponse(data);
    })

    setUrlParams("");

  }, [userInfo, urlParams]);

  useEffect(() => {
    if (playlistType === 0) {
      setPlaylistEl(
        <SpotifyPlaylist
          userInfo={userInfo}
          setResponse={setResponse}
        />
      );
    }
    else if (playlistType === 1) {
      setPlaylistEl(
        <YouTubePlaylist />
      );
    }
    else{
      setPlaylistEl(
        <div></div>
      );
    }
  }, [playlistType])

  return (
    <div className={styles.PlaylistModal}>
      <table>
        <tbody>
          <tr>
            <td onClick = {() => {setPlaylistType(0)}} className={playlistType === 0 ? styles.selectedPlaylist : ''}> Spotify </td> 
            <td onClick = {() => {setPlaylistType(1)}} className={playlistType === 1 ? styles.selectedPlaylist : ''}> YouTube </td>
            <td onClick = {() => {setPlaylistType(2)}} className={playlistType === 2 ? styles.selectedPlaylist : ''}> Apple Music </td>
          </tr>
        </tbody>
      </table>
      {playlistEl}
    </div>
  )
};

export default PlaylistModal;