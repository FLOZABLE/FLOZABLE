import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TagsGenerator.module.css";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useState } from "react";

export default function TagsGenerator({ tags, setTags, maxTags = 10 }) {
  const [inputValue, setInputValue] = useState("");

  const remove = useCallback(
    (tag) => {
      const updatedTags = tags.filter((t) => t !== tag);
      setTags(updatedTags);
    },
    [tags]
  );

  const addTag = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const tag = e.target.value.trim();
        if (tag.length > 1 && !tags.includes(tag)) {
          if (tags.length < 10) {
            const newTags = tag.split(",").map((t) => t.trim());
            setTags([...tags, ...newTags]);
            setInputValue("");
          }
        }
      }
    },
    [tags]
  );

  return (
    <div className={styles.TagsGenerator}>
      <div className={styles.content}>
        <ul className={styles.tags}>
          {tags.map((tag, i) => {
            return (
              <li key={i}>
                <p className={styles.tags}>{tag}</p>
                <i onClick={() => remove(tag)}>
                  <FontAwesomeIcon
                    icon={faTimes}
                    className={styles.closeIcon}
                  />
                </i>
              </li>
            );
          })}
          <input
            className={styles.tagsInput}
            type="text"
            spellCheck="false"
            onKeyUp={addTag}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className={styles.details}>
            <p>
              <span>{maxTags - tags.length}</span> tags are remaining
            </p>
          </div>
        </ul>
        <div
          className={`${styles.placeHolder} ${
            !tags.length && inputValue === "" ? styles.visible : ""
          }`}
        >
          <p>Press enter after each tag</p>
        </div>
      </div>
      <button
        className={styles.removeAllBtn}
        onClick={() => {
          setTags([]);
        }}
      >
        Remove All
      </button>
    </div>
  );
}
