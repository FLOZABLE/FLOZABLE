import React, { useEffect, useState } from "react";
import styles from "./ColorPalette.module.css";
import { ColorPaletteOptions } from "../../../utils/ColorPaletteOptions";

function ColorPalette(props) {
  const { setSelectedColor, selectedColor, isSelectColor, setIsSelectColor, setIsSelectIcon } = props;

  const [paletteColorsEl, setPaletteColorsEl] = useState([]);

  useEffect(() => {
    setPaletteColorsEl(ColorPaletteOptions.map((colorOption, i) => {
      return (
        <div className={styles.palette} key={i}>
          <div className={styles.paletteColors}>
            <div className={styles.paletteColor} onClick={() => { setSelectedColor(colorOption.colors[0]) }} style={{ "--bg-color": colorOption.colors[0] }}></div>
            <div className={styles.paletteShades}>
              <div className={styles.paletteShadesItem} onClick={() => { setSelectedColor(colorOption.colors[1]) }} style={{ "--bg-color": colorOption.colors[1] }}>{colorOption.colors[1]}</div>
              <div className={styles.paletteShadesItem} onClick={() => { setSelectedColor(colorOption.colors[2]) }} style={{ "--bg-color": colorOption.colors[2] }}>{colorOption.colors[2]}</div>
              <div className={styles.paletteShadesItem} onClick={() => { setSelectedColor(colorOption.colors[3]) }} style={{ "--bg-color": colorOption.colors[3] }}>{colorOption.colors[3]}</div>
            </div>
          </div>
          <div className={styles.paletteInfo}>
            <div className={styles.paletteInfoName}>{colorOption.name}</div>
            <div className={styles.palletteInfoHexcode} onClick={() => { setSelectedColor(colorOption.colors[0]) }} >{colorOption.colors[0]}</div>
          </div>
        </div>
      )
    }))
  }, [ColorPaletteOptions]);
  return (
    <div className={styles.ColorPalette}>
      <div className={styles.header}>
        <button onClick={() => { setIsSelectColor(!isSelectColor); setIsSelectIcon(false) }}>
          {!selectedColor ? <p>Select Color!</p> : <p>Selected Color: </p>}
        </button>
        <div className={styles.selectedColor} style={{ backgroundColor: selectedColor }}>
          </div>
      </div>
      <div className={`${styles.paletteGrid} ${isSelectColor ? styles.open : ''}`}>
        {paletteColorsEl}
      </div>
    </div>
  );
};

export default ColorPalette;