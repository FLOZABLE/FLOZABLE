import React, { useContext, useEffect, useState } from "react";
import styles from "./PlaylistModal.module.css";
import config from "@/app/utils/config";
import { ResponseContext } from "@/app/utils/Contexts";
import { useRouter, useSearchParams } from "next/navigation";
import YouTubePlaylist from "../../Youtube/YouTubePlaylist/YouTubePlaylist";
import SpotifyPlaylist from "../../Spotify/SpotifyPlaylist/SpotifyPlaylist";

function PlaylistModal() {
  const { setResponse } = useContext(ResponseContext);

  const router = useRouter();

  const [playlistType, setPlaylistType] = useState(-1);
  //const searchParams = useSearchParams();

  /* useEffect(() => {
    const token = searchParams.get("code");
    const redirectURI = `${config.location}/dashboard/study`;

    if (!token) return;

    fetch(`${config.server}/playlists/spotify-login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        redirectURI: redirectURI,
      }),
      credentials: 'include'
    }).then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })

    router.replace(window.location.pathname, { scroll: false });

  }, [searchParams]); */

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