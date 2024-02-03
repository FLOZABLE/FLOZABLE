import { useEffect, useState } from "react";
import SpotifyAuthBtn from "../SpotifyAuthBtn/SpotifyAuthBtn";
import styles from "./PlaylistModal.module.css";
import DropDownButton from "../DropDownButton/DropDownButton";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import SpotifyPlayer from "../SpotifyPlayer/SpotifyPlayer";

const playlists = [
  {
    id: 1,
    name: 'playlist1',
    songs: [
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      }
    ]
  },
  {
    id: 1,
    name: 'playlist1',
    songs: [
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      }
    ]
  },
  {
    id: 1,
    name: 'playlist1',
    songs: [
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      },
      {
        name: 'song1',
        image: 'https://',
        url: 'https://',
        author: 'ong'
      }
    ]
  }
]
function PlaylistModal({userInfo}) {
  const [playlist, setPlaylist] = useState([]);
  const [link, setLink] = useState("");
  const [playLink, setPlayLink] = useState(null);

  useEffect(() => {
    if (playlist.length) {
      setPlaylist([playlists]);
    }
  }, []);

  const submitURL = () => {
    console.log(link);
    try {
      const url = new URL(link);
      if (url.hostname === "open.spotify.com") {
        const urlPaths = url.pathname.split("/");
        if (urlPaths[1] !== "embed") {
          urlPaths.unshift("embed");
          const modifiedURL = "https://open.spotify.com/" + urlPaths.join("/");
          setPlayLink(modifiedURL);
        } else {
          setPlayLink(link);
        };
      };  
    } catch (err) {
      console.log(err);
    };
  };

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

  return (
    <div className={styles.PlaylistModal}>
      <div className={styles.authGuide}>
      <p>Connect your Spotify account to bring your playlists!</p>
      <SpotifyAuthBtn userInfo={userInfo}/>
      </div>
      {/* <DropDownButton
        options={[
          { name: "Playlist1", value: 0 },
          { name: "Playlist1", value: 1 },
        ]}
        setValue={setPlaylist}
      /> */}
      <CustomInput
        input={link}
        handleInput={handleLinkInput}
        handleEnter={submitURL}
        icon={faLink}
        placeHolder={"or Paste a playlist Link!"}
        type={"text"}
      />
      <div className={styles.spotifyPlayerWrapper}>
      <SpotifyPlayer 
        link={playLink}
      />
      </div>
    </div>
  )
};

export default PlaylistModal;