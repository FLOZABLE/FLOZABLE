import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Search.module.css";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

function Search(props) {

  const toggleSearch = () => {
    props.setSearched(!props.searched);
  };
  return (
    <div className={`${styles.inputBox} ${props.searched ? styles.open : ''}`}>
      <input type="text" placeholder="Search..." id="group-search" />
      <span className={styles.search} onClick={toggleSearch}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>
      <FontAwesomeIcon icon={faXmark} className={styles.closeIcon} />
      <i className={`${styles.faSolid} ${styles.faXmark}`}></i>
    </div>
  );/* 
  <div class="input-box open">
                <input type="text" placeholder="Search..." id="group-search">
                <span class="search">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <i class="fa-solid fa-xmark close-icon "></i>
              </div>
  */
};

export default Search;