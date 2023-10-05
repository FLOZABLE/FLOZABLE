import React, { useState } from 'react';
import styles from './Templates.module.css';
import TagContainerGen from '../../UI/TagContainerGen/TagContainerGen';
import Search from '../../UI/Search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownLeftAndUpRightToCenter, faLink, faPlus, faTags, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import LikeBtn from '../../UI/LikeBtn/LikeBtn';
import BlobBtn from '../../UI/BlobBtn/BlobBtn';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Templates(props) {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState(null);
  const [expand, setExpand] = useState(false);

  return (
    <div className={styles.Templates}>
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <p>d</p>
          </div>
          <div className={styles.box}>
            <div className={styles.searchZone}>
              <div className={styles.tagContainerWrapper}>
                <div className={styles.title}>
                  <FontAwesomeIcon icon={faTags} className={styles.faTags} />
                  <h2>Tags</h2>
                </div>
                <TagContainerGen maxTags={10}
                  setTags={setTags}
                  handleCreatedTagsChange={(newTags) => { setTags(newTags) }}
                />
              </div>
              <Search setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
              <button id={styles.CreateGroupBtn} onClick={() => { }}>
                <FontAwesomeIcon icon={faPlus} className={styles.plus} />
                Create new group
              </button>
            </div>
            <div className={styles.templatesContainer}>
              <div className={styles.template}>
                <div className={styles.photo}>
                  <button className={styles.expand}><i>{expand ? <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} /> : <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />}</i></button>
                </div>
                <div className={styles.reaction}>
                  <p>d</p>
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>
                    <p>Something</p>
                  </div>
                  <div className={styles.description}>
                    <p>this is something</p>
                  </div>
                  <div className={styles.bottom}>
                  <ul className={styles.tags}>
                    <li className={styles.tag} >fff</li>
                    <li className={styles.tag} >fff</li>
                  </ul>
                  <div className={styles.buttons}>
                    <LikeBtn liked={true} />
                    <BlobBtn name={'JOIN'} setClicked={() => {}} color1={'#fff'} color2={"var(--pink)"} />
                    <BlobBtn name={<FontAwesomeIcon icon={faLink} />} setClicked={() => {}} color1={'#fff'} color2={"var(--pink)"} />
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates;