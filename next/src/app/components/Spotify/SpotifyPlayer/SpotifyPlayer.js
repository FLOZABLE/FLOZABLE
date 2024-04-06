import styles from "./SpotifyPlayer.module.css";
import React from 'react';

function SpotifyPlayer({link}) {
  return (
    <div className={styles.SpotifyPlayer}>
      {link ? <iframe style={{height: '25rem', width: '21.875rem', border: 'none'}} src={link}  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe> : null}
      
    </div>
  )
};

export default SpotifyPlayer;