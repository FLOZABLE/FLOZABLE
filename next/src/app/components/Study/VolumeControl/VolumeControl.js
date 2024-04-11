import React, { useState, useRef } from "react";
import styles from "./VolumeControl.module.css"; // Import your module CSS file

function VolumeControl({
  volume,
  setVolume,
  backgroundImage,
  onMouseUp = () => {},
}) {
  const [isMuted, setMuted] = useState(true); // Track whether the volume is muted
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prevVolume, setPrevVolume] = useState(volume);
  const sliderContainerRef = useRef(null);

  const handleRangeUpdate = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  };

  const toggleMute = () => {
    setMuted(!isMuted);
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
  };

  const handleMouseMove = (e) => {
    const sliderContainer = sliderContainerRef.current;
    const rect = sliderContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const rootStyle = {
    "--percentage": `${(volume * 100) / 100}%`, // Update '--percentage' variable
    "--mouse-x": `${mousePosition.x}px`,
    "--mouse-y": `${mousePosition.y}px`,
  };

  const soundPicto = isMuted ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={styles.soundPicto}
    >
      <path d="M5 17h-5v-10h5v10zm2-10v10l9 5v-20l-9 5zm15.324 4.993l1.646-1.659-1.324-1.324-1.651 1.67-1.665-1.648-1.316 1.318 1.67 1.657-1.65 1.669 1.318 1.317 1.658-1.672 1.666 1.653 1.324-1.325-1.676-1.656z" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={styles.soundPicto}
    >
      <path d="M5 17h-5v-10h5v10zm2-10v10l9 5v-20l-9 5zm11.008 2.093c.742.743 1.2 1.77 1.198 2.903-.002 1.133-.462 2.158-1.205 2.9l1.219 1.223c1.057-1.053 1.712-2.511 1.715-4.121.002-1.611-.648-3.068-1.702-4.125l-1.225 1.22zm2.142-2.135c1.288 1.292 2.082 3.073 2.079 5.041s-.804 3.75-2.096 5.039l1.25 1.254c1.612-1.608 2.613-3.834 2.616-6.291.005-2.457-.986-4.681-2.595-6.293l-1.254 1.25z" />
    </svg>
  );

  const handler = (e) => e.stopPropagation();

  return (
    <div
      className={`${styles.soundSliderContainer} ${styles.yourAdditionalClass}`}
      onMouseMove={handleMouseMove}
      ref={sliderContainerRef}
      style={rootStyle}
    >
      <button className={styles.soundToggle} onClick={toggleMute}>
        {soundPicto}
      </button>
      <input
        type="range"
        value={volume}
        min="0"
        max="100"
        className={styles.soundSlider}
        onChange={handleRangeUpdate}
        onClick={handler}
        onMouseDown={handler}
        onMouseUp={onMouseUp}
        onDragEnd={onMouseUp}
        style={{ backgroundImage: backgroundImage }}
      />
    </div>
  );
}

export default VolumeControl;
