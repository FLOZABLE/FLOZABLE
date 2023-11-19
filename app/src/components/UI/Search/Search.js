import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Search.module.css";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

function Search({ searchQuery, setSearchQuery }) {
  const [searched, setSearched] = useState(false);
  const toggleSearch = () => {
    setSearched(!searched);
    setSearchQuery("");
  };

  const updateSearchQuery = (e) => {
    setSearchQuery(e.target.value);
  };
  return (
    <div className={`${styles.inputBox} ${searched ? styles.open : ""}`}>
      <input
        type="text"
        placeholder="Search..."
        id="group-search"
        onInput={updateSearchQuery}
        value={searchQuery}
      />
      <span className={styles.search} onClick={toggleSearch}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>
      <FontAwesomeIcon
        icon={faXmark}
        className={styles.closeIcon}
        onClick={toggleSearch}
      />
    </div>
  );
}

export default Search;
