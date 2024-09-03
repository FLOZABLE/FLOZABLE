import React, { useEffect, useState } from "react";
import styles from "./YouTubePlaylist.module.css";
import {
  usePlaylistsYoutube,
  usePlaylistsYoutubeItems,
} from "@/Hooks/playlistHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import GoogleLoginBtn from "../../Buttons/GoogleLoginBtn/GoogleLoginBtn";

function YouTubePlaylist({}) {
  const { playlistsYoutubeData, playlistsYoutubeIsLoading } =
    usePlaylistsYoutube();

  const [playlist, setPlaylist] = useState("");
  const { playlistsYoutubeItemsData, playlistsYoutubeItemsIsLoading, error } =
    usePlaylistsYoutubeItems(playlist);

  useEffect(() => {
    if (!playlistsYoutubeItemsData?.success) return;
    console.log(
      playlistsYoutubeItemsData.items
        .map((item) => item.snippet.resourceId.videoId)
        .join()
    );
  }, [playlistsYoutubeItemsData]);

  if (playlistsYoutubeIsLoading) {
    return <CircularLoading />;
  }

  if (!playlistsYoutubeData?.success) {
    return (
      <GoogleLoginBtn
        scope="https://www.googleapis.com/auth/youtube.force-ssl"
        required="youtube"
      />
    );
  }

  return (
    <div className={styles.YouTubePlaylist}>
      {/* {playlist ? (
        <iframe
          width="720"
          height="405"
          src={`https://www.youtube.com/embed/VIDEO_ID?playlist=${playlist}`}
          allowFullScreen
        ></iframe>
      ) : null} */}
      {playlistsYoutubeItemsData?.items?.length ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/VIDEO_ID?playlist=${playlistsYoutubeItemsData.items
            .map((item) => item.snippet.resourceId.videoId)
            .join()}`}
          allowFullScreen
        ></iframe>
      ) : null}
      <div className={`customScroll ${styles.playlists}`}>
        {playlistsYoutubeData.playlists.map((playlist, i) => {
          const { thumbnails, title } = playlist.snippet;
          return (
            <div
              onClick={() => {
                setPlaylist(playlist.id);
              }}
              className={styles.playlist}
              key={i}
              style={{
                backgroundImage: `url(${thumbnails.high.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <p className={`overflowDot ${styles.name}`}>{title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default YouTubePlaylist;
