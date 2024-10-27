import React, { useCallback, useContext, useEffect, useState } from "react";
import styles from "./YouTubePlaylist.module.css";
import {
  usePlaylistsYoutube,
  usePlaylistsYoutubeItems,
} from "@/Hooks/playlistHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import GoogleLoginBtn from "../../Buttons/GoogleLoginBtn/GoogleLoginBtn";
import { ResponseContext } from "@/app/utils/Contexts";
import CustomInput from "../../Inputs/CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function YouTubePlaylist({}) {
  const { setResponse } = useContext(ResponseContext);
  const { playlistsYoutubeData, playlistsYoutubeIsLoading } =
    usePlaylistsYoutube();

  const [playlist, setPlaylist] = useState(null);
  const { playlistsYoutubeItemsData, playlistsYoutubeItemsIsLoading } =
    usePlaylistsYoutubeItems(playlist);
  const [videos, setVideos] = useState([]);
  const [link, setLink] = useState("");

  useEffect(() => {
    if (!playlistsYoutubeItemsData?.data?.items?.length) return;

    setVideos(
      playlistsYoutubeItemsData?.data?.items
        .map((item) => item.snippet.resourceId.videoId)
        .join()
    );
  }, [playlistsYoutubeItemsData]);

  const submitURL = useCallback(() => {
    try {
      const url = new URL(link);
      const params = url.searchParams;
      const playlist = params.get("list");
      if (!playlist) {
        setResponse({ success: false, reason: "Invalid playlist" });
      }
      setPlaylist(playlist);
    } catch (err) {
      console.log(err);
      setResponse({ success: false, reason: "Invalid playlist" });
    } finally {
      setLink("");
    }
  }, [link]);

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
      {playlistsYoutubeItemsIsLoading ? (
        <div className={styles.player}>
          <CircularLoading />
        </div>
      ) : videos.length ? (
        <div className={styles.player}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/VIDEO_ID?playlist=${videos}`}
            allowFullScreen
          ></iframe>
        </div>
      ) : null}
      <div className={`customScroll ${styles.playlists}`}>
        {playlistsYoutubeData?.data?.playlists.map((playlist, i) => {
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

export default YouTubePlaylist;
