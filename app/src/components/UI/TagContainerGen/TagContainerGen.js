import React, { useState, useEffect } from 'react';
import styles from "./TagContainerGen.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faTimes } from '@fortawesome/free-solid-svg-icons';

const TagContainerGen = (props) => {

  const { handleCreatedTagsChange } = props;

  const [maxTags] = useState(props.maxTags);
  const [createdTags, setCreatedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [tagCount, setTagCount] = useState(maxTags);

  useEffect(() => {
    countTags();
  }, [createdTags]);

  const countTags = () => {
    setTagCount(maxTags - createdTags.length);
  };

  const remove = (tag) => {
    const updatedTags = createdTags.filter(t => t !== tag);
    setCreatedTags(updatedTags);
    handleCreatedTagsChange(updatedTags); // Call the callback to update the state in the parent component
    countTags();
  };

  const removeAll = () => {
    setCreatedTags([]);
    handleCreatedTagsChange([]);
  }

  const createTag = () => {
    return createdTags.map((tag, index) => (
      <li key={index}>
        <p className={styles.tags}>{tag}</p>
        <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={() => remove(tag)} />
      </li>
    ));
  };

  const addTag = (e) => {
    if (e.key === 'Enter') {
      const tag = e.target.value.trim();
      if (tag.length > 1 && !createdTags.includes(tag)) {
        if (createdTags.length < 10) {
          const newTags = tag.split(',').map(t => t.trim());
          setCreatedTags(prevState => [...prevState, ...newTags]);
          setInputValue('');
          handleCreatedTagsChange([...createdTags, ...newTags]);
          countTags();
        }
      }
    }
  };

  return (
    <div className={styles.TagContainerGen}>
      <div className={styles.content}>
        <p>Press enter after each tag</p>
        <ul className={styles.tags}>
          {createTag()}
          <input
            className={styles.tagsInput}
            type="text"
            spellCheck="false"
            onKeyUp={addTag}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        </ul>
      </div>
      <div className={styles.details}>
        <p>
          <span>{tagCount}</span> tags are remaining
        </p>
        <button className={styles.removeAllBtn} onClick={() => removeAll()}>
          Remove All
        </button>
      </div>
    </div>
  );
};

export default TagContainerGen;
