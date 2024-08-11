import styles from "./SpotifyPlayer.module.css";
import React from "react";

function SpotifyPlayer({ link }) {
  return (
    <>
      {link ? (
        <iframe
          style={{ height: "24rem", width: "100%", border: "none" }}
          src={link}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      ) : null}
    </>
  );
}

export default SpotifyPlayer;
