import React, { useState } from 'react';
import styles from './Templates.module.css';
import TagContainerGen from '../../UI/TagContainerGen/TagContainerGen';
import Search from '../../UI/Search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faDownLeftAndUpRightToCenter, faHeart, faLink, faPeopleGroup, faPlus, faStopwatch, faTags, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import TemplateBox from '../../UI/TemplateBox/TemplateBox';
import BlobBtn from '../../UI/BlobBtn/BlobBtn';
//import CreateTemplateModal from '../../UI/CreateTemplateModal/CreateTemplateModal';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Templates(props) {
  const { isSidebarOpen, isSidebarHovered } = props;
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState(null);
  const [expand, setExpand] = useState(null);
  const [moreInfo, setMoreInfo] = useState(null);
  const [isCreateTemplate, setIsCreateTemplate] = useState(false);

  return (
    <div className={styles.Templates}>
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <h2>Your Themes</h2>
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
              <div className={styles.createWrapper}>
                <BlobBtn
                  name={<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><FontAwesomeIcon icon={faPlus} className={styles.plus} style={{ marginRight: '0.3125rem' }} />Publish your own</div>}
                  setClicked={() => { setIsCreateTemplate(!isCreateTemplate) }}
                  color1={'#fff'}
                  color2={"var(--pink)"}
                  opt={0} />
              </div>
            </div>
            <div className={styles.templatesContainer}>
              <TemplateBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates;