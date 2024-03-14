import { IconSearch } from "../../../utils/svgs";
import styles from "./SearchBar.module.css";
import React from 'react';

function SearchBar({ searchQuery, setSearchQuery, onEnter = () => { } }) {
  return (
    <div className={styles.SearchBar}>
      <div className={styles.inputContainer}>
        <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnter();
          }
        }} />
        <div className={`${styles.circles} ${searchQuery.length ? styles.hidden : ''}`}>
          <div className={styles.circleOne}></div>
          <div className={styles.circleTwo}></div>
          <div className={styles.circleThree}></div>
        </div>
      </div>
      <i onClick={() => {
        onEnter();
      }}>
        <IconSearch />
      </i>
    </div>
  )
};

export default SearchBar;