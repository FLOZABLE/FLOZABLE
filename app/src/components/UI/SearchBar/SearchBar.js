import { IconSearch } from "../../../utils/svgs";
import styles from "./SearchBar.module.css";

function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className={styles.SearchBar}>
      <div className={styles.inputContainer}>
        <input type="text" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value)}} />
        <div className={`${styles.circles} ${searchQuery.length ? styles.hidden : ''}`}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
      </div>
      <i>
        <IconSearch />
      </i>
    </div>
  )
};

export default SearchBar;