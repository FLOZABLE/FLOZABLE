import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import styles from "./AudioController.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AudioPlayer from "@/app/components/Study/AudioPlayer/AudioPlayer";
import SliderAnimation from "@/app/components/Inputs/SliderAnimation/SliderAnimation";

const AUDIOS = [
  {
    id: "Fire",
    source: "../../audio/Fire.mp3",
  },
  {
    id: "Forest",
    source: "../../audio/Forest.mp3",
  },
  {
    id: "Rain",
    source: "../../audio/Rain.mp3",
  },
  {
    id: "Wave",
    source: "../../audio/Wave.mp3",
  },
  {
    id: "Wind",
    source: "../../audio/Wind.mp3",
  },
];

export default function AudioController({ themeVolume, setThemeVolume }) {
  return (
    <div className={styles.AudioController}>
      <div className={styles.header}>
        <i>
          <FontAwesomeIcon icon={faHeadphones} />
        </i>
        Audio Options
      </div>
      <div>
        <p>Theme</p>
        <SliderAnimation
          min={0}
          max={100}
          step={1}
          sliderValue={themeVolume}
          setSliderValue={setThemeVolume}
        />
      </div>
      {AUDIOS.map((audio, i) => {
        return <AudioPlayer key={i} audioInfo={audio} />;
      })}
    </div>
  );
}
