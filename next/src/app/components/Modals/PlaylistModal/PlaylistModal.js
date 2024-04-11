import React, { useState } from "react";
import styles from "./PlaylistModal.module.css";
import YouTubePlaylist from "../../Youtube/YouTubePlaylist/YouTubePlaylist";
import SpotifyPlaylist from "../../Spotify/SpotifyPlaylist/SpotifyPlaylist";

function PlaylistModal() {
  const [playlistType, setPlaylistType] = useState(-1);

  return (
    <div className={styles.PlaylistModal}>
      <table>
        <tbody>
          <tr>
            <td onClick={() => { setPlaylistType(0) }} className={playlistType === 0 ? styles.selectedPlaylist : ''}> Spotify </td>
            <td onClick={() => { setPlaylistType(1) }} className={playlistType === 1 ? styles.selectedPlaylist : ''}> YouTube </td>
            <td onClick={() => { setPlaylistType(2) }} className={playlistType === 2 ? styles.selectedPlaylist : ''}> Apple Music </td>
          </tr>
        </tbody>
      </table>
      {playlistType === 0 ? <SpotifyPlaylist /> : SpotifyPlaylist === 1 ? <YouTubePlaylist /> : null}
    </div>
  )
};

export default PlaylistModal;