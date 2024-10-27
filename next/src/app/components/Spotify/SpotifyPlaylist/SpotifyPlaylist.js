import React, { useState } from "react";
import styles from "./SpotifyPlaylist.module.css";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import SpotifyAuthBtn from "../SpotifyAuthBtn/SpotifyAuthBtn";
import SpotifyPlayer from "../SpotifyPlayer/SpotifyPlayer";
import CustomInput from "../../Inputs/CustomInput/CustomInput";
import { usePlaylistsSpotify } from "@/Hooks/playlistHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function SpotifyPlaylist() {
  const { playlistsSpotifyData, playlistsSpotifyIsLoading } =
    usePlaylistsSpotify();

  const [playlist, setPlaylist] = useState(null);
  const [link, setLink] = useState("");

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
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.SpotifyPlaylist}>
      <SpotifyPlayer link={playlist} />
      {playlistsSpotifyIsLoading ? (
        <CircularLoading />
      ) : !playlistsSpotifyData?.data?.playlists ? (
        <SpotifyAuthBtn />
      ) : (
        <div className={`customScroll ${styles.playlists}`}>
          {playlistsSpotifyData.playlists.map((playlist, i) => {
            return (
              <div
                onClick={() => {
                  const embedUrl = playlist.external_urls.spotify.replace(
                    "https://open.spotify.com",
                    "https://open.spotify.com/embed"
                  );

                  setPlaylist(embedUrl);
                }}
                className={styles.playlist}
                key={i}
                style={{
                  backgroundImage: `url(${playlist.images?.[0].url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <p className={`overflowDot ${styles.name}`}>{playlist.name}</p>
              </div>
            );
          })}
        </div>
      )}
      <CustomInput
        input={link}
        handleInput={(e) => {
          setLink(e.target.value);
        }}
        handleEnter={submitURL}
        placeHolder={"or Paste a playlist Link!"}
        type={"text"}
      >
        <FontAwesomeIcon icon={faLink} />
      </CustomInput>
    </div>
  );
}

export default SpotifyPlaylist;
