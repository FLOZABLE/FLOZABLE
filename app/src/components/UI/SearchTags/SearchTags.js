import React from "react";
import tagContainerGen from "./TagsGenerator";
import styles from "./SearchTags.module.css";

function SearchTags() {
  
  return (
    <div className={styles.SearchTags}>
          <tagContainerGen maxTags={10} />
      <div className={styles.title}>
        <i className={`${styles.faSolid} ${styles.faTags}`}></i>
        <h2>Tags</h2>
      </div>
      <div className={styles.content}>
        <p>Press enter after each tag</p>
        <ul className={styles.tags}><input className={styles.tags} type="text" spellCheck="false" /></ul>
      </div>
      <div className={styles.details}>
        <p><span>10</span> tags are remaining</p>
        <button className={styles.removeAll}>Remove All</button>
      </div>
    </div>
  );
};
/* 
                <div id="groupSearchTag">
                  <div className={styles.title}>
                    <i className={`${styles.faSolid} ${styles.faTags}`}></i>
                    <h2>Tags</h2>
                  </div>
                  <div className={styles.content}>
                    <p>Press enter after each tag</p>
                    <ul className={styles.tags}><input className={styles.tags} type="text" spellCheck="false" /></ul>
                  </div>
                  <div className={styles.details}>
                    <p><span>10</span> tags are remaining</p>
                    <button id="removeAll">Remove All</button>
                  </div>
                </div>
*/

export default SearchTags;