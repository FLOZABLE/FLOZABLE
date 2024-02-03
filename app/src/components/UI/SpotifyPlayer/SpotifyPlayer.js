import styles from "./SpotifyPlayer.module.css";

function SpotifyPlayer({link}) {
  return (
    <div className={styles.SpotifyPlayer}>
      {link ? <iframe style={{height: '400px', width: '350px', border: 'none'}} src={link}  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe> : null}
      
    </div>
  )
};

export default SpotifyPlayer;