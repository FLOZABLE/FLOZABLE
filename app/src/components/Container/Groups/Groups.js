import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import StuckModal from '../../UI/StuckModal/StuckModal';
import Search from '../../UI/Search/Search';
import SearchTags from '../../UI/SearchTags/SearchTags';
import styles from './Groups.module.css';

function Ranking(props) {
  const [searched, setSearched] = useState(false);
  const [tags, setTags] = useState([]);

  return (
    <div className={styles.GroupsContainer}>
      <StuckModal />
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <p className={styles.title}>Groups</p>
            </div>
            <div className={`${styles.container} ${styles.myGroups}`}>
              <div className={styles.group}>
                <div className={styles.name}>
                  Eng
                </div>
                <div className={styles.explanation}>
                  <ul className={styles.info}>
                    <li>
                      <p>dd</p>
                      <FontAwesomeIcon icon={faPeopleGroup} />
                    </li>
                    <li>
                      <p>9hr</p>
                      <FontAwesomeIcon icon={faBullseye} />
                    </li>
                    <li>
                      <p>dd</p>
                      <FontAwesomeIcon icon={faStopwatch} />
                    </li>
                    <li>
                      <p>dd</p>
                      <FontAwesomeIcon icon={faHeart} />
                    </li>
                  </ul>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint voluptatibus similique, accusantium quia ad delectus ipsa praesentium quasi quas minus nostrum nam repellat ea architecto natus. Ut vero modi ratione?
                </div>
                <ul className={styles.tags}>
                  <li className={styles.tag}>tt</li>
                  <li className={styles.tag}>tt</li>
                  <li className={styles.tag}>tt</li>
                  <li className={styles.tag}>tt</li>
                </ul>
              </div>
            </div>
            <div className={`${styles.container} ${styles.allGroups}`}>
              <div className={styles.searchZone}>
                <SearchTags />
                <Search searched={searched} setSearched={setSearched}/>
                <button id="create-group-btn">
                  <i className="fa-solid fa-plus"></i>
                  Create new group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking;