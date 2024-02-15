import { useEffect, useState } from "react";
import styles from "./PlaylistModal.module.css";
import SpotifyPlaylist from "../SpotifyPlaylist/SpotifyPlaylist";
import YouTubePlaylist from "../YouTubePlaylist/YouTubePlaylist";

function PlaylistModal({ userInfo, setResponse }) {

  const [playlistType, setPlaylistType] = useState(-1);
  const [playlistEl, setPlaylistEl] = useState(<div></div>);

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