import React, { useState } from "react";
import styles from "./PlaylistModal.module.css";
import YouTubePlaylist from "../../Youtube/YouTubePlaylist/YouTubePlaylist";
import SpotifyPlaylist from "../../Spotify/SpotifyPlaylist/SpotifyPlaylist";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";

function PlaylistModal() {
  const [playlistType, setPlaylistType] = useState("spotify");

  return (
    <div className={styles.PlaylistModal}>
      {/* <div style={{ "--hoverTextColor": "#000" }}>
        <DropDownButton
          options={[
            {
              value: "spotify",
              name: "Spotify",
            },
            {
              value: "youtube",
              name: "Youtube",
            },
          ]}
          value={playlistType}
          setValue={setPlaylistType}
        />
      </div>
      {playlistType === "spotify" ? <SpotifyPlaylist /> : <YouTubePlaylist />} */}
    </div>
  );
}

export default PlaylistModal;
