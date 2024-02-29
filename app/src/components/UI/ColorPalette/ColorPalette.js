import React, { useCallback, useEffect, useState } from "react";
import styles from "./ColorPalette.module.css";
import { ColorPaletteOptions } from "../../../utils/ColorPaletteOptions";

function ColorPalette({
  setSelectedColor,
  selectedColor,
  isSelectColor,
  setIsSelectColor,
  setIsSelectIcon,
  id=""
}) {
  const [paletteColorsEl, setPaletteColorsEl] = useState([]);

  const selectColor = useCallback((color) => {
    setSelectedColor(color);
    setIsSelectColor(false);
  }, []);

  useEffect(() => {
    setPaletteColorsEl(
      ColorPaletteOptions.map((colorOption, i) => {
        return (
          <div className={styles.palette} key={i}>
            <div className={styles.paletteColors}>
              <div
                id={id}
                className={styles.paletteColor}
                onClick={() => {
                  selectColor(colorOption.colors[0]);
                }}
                style={{ "--bg-color": colorOption.colors[0] }}
              ></div>
              <div className={styles.paletteShades}>
                <div
                id={id}
                  className={styles.paletteShadesItem}
                  onClick={() => {
                    selectColor(colorOption.colors[1]);
                  }}
                  style={{ "--bg-color": colorOption.colors[1] }}
                >
                  {colorOption.colors[1]}
                </div>
                <div
                id={id}
                  className={styles.paletteShadesItem}
                  onClick={() => {
                    selectColor(colorOption.colors[2]);
                  }}
                  style={{ "--bg-color": colorOption.colors[2] }}
                >
                  {colorOption.colors[2]}
                </div>
                <div
                id={id}
                  className={styles.paletteShadesItem}
                  onClick={() => {
                    selectColor(colorOption.colors[3]);
                  }}
                  style={{ "--bg-color": colorOption.colors[3] }}
                >
                  {colorOption.colors[3]}
                </div>
              </div>
            </div>
            <div className={styles.paletteInfo}>
              <div className={styles.paletteInfoName}>{colorOption.name}</div>
              <div
              id={id}
                className={styles.palletteInfoHexcode}
                onClick={() => {
                  setSelectedColor(colorOption.colors[0]);
                }}
              >
                {colorOption.colors[0]}
              </div>
            </div>
          </div>
        );
      }),
    );
  }, [ColorPaletteOptions]);

  return (
    <div className={styles.ColorPalette}>
      <div className={styles.header}>
        <button
          id={id}
          onClick={() => {
            setIsSelectColor(!isSelectColor);
            if (setIsSelectIcon) {
              setIsSelectIcon(false);
            }
          }}
        >
          <div className={styles.pTag}>
            {!selectedColor ? <p>Select Color!</p> : <p>Selected Color: </p>}
          </div>
        </button>
        <div
          id={id}
          onClick={() => {
            setIsSelectColor(!isSelectColor);
            if (setIsSelectIcon) {
              setIsSelectIcon(false);
            }
          }}
          className={styles.selectedColor}
          style={{ backgroundColor: selectedColor }}
        ></div>
      </div>
      <div
        className={`${styles.paletteGrid} ${isSelectColor ? styles.open : ""}`}
      >
        {paletteColorsEl}
      </div>
    </div>
  );
}

export default ColorPalette;