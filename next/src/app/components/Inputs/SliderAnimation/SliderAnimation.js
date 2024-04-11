import React from "react";
import styles from "./SliderAnimation.module.css";

function SliderAnimation({ min, max, step, setSliderValue, sliderValue }) {
  const handleChange = (e) => {
    setSliderValue(parseInt(e.target.value));
  };

  const percent = () => {
    return ((sliderValue - min) * 100) / (max - min);
  };

  const renderNumber = (index) => {
    const strValue = sliderValue.toString();
    const length = max.toString().length;
    const visible = index + 1 > length - strValue.length;
    const position = visible
      ? "-" + strValue[index - (length - strValue.length)] * 10 + "%"
      : "10%";

    let style = {
      transform: "translateY(" + position + ")",
      opacity: visible ? "1" : "0",
    };

    return (
      <div className={styles.sliderValueNumber} key={index}>
        <ul style={style}>
          {Array.from({ length: 10 }, (_, i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    );
  };

  const length = max.toString().length;
  let numbers = [];

  for (let i = 0; i < length; i++) {
    numbers.push(renderNumber(i));
  }

  return (
    <div className={styles.slider}>
      <input
        type="range"
        min={min}
        max={max}
        value={sliderValue}
        step={step}
        onInput={handleChange}
        style={{
          backgroundSize: percent() + "% 100%",
        }}
      />

      <div className={styles.sliderValue}>{numbers}</div>
    </div>
  );
}

export default SliderAnimation;
