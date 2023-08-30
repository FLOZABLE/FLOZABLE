import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import StuckModal from '../../UI/StuckModal/StuckModal';
import Search from '../../UI/Search/Search';
import TagContainerGen from '../../UI/TagContainerGen/TagContainerGen';
import styles from './Groups.module.css';
import { getLikedGroups, getMyGroups, otherGroupsGen } from './GroupsTool';
import TopNotification from '../../UI/TopNotification/TopNotification';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Ranking(props) {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [likedGroups, setLikedGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [otherGrousEl, setOtherGroupsEl] = useState([]);
  const [joinResponse, setNotificationResponse] = useState({});
  const [copied, setCopied] = useState(false);
  
  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };

  useEffect(() => {
    fetch(`${serverOrigin}/api/groups/bring-groups`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setGroups(data.groups);
        }
      })
      .catch((error) => console.error(error));
    }, []);

  useEffect(() => {
    setLikedGroups(getLikedGroups(props.userInfo, groups));
    const dividedGroups = getMyGroups(props.userInfo, groups);
    setMyGroups(dividedGroups.myGroups);
    setOtherGroups(dividedGroups.otherGroups);
    setOtherGroupsEl(otherGroupsGen(otherGroups, setNotificationResponse, setCopied, copied));
  }, [props.userInfo, groups]);
  
  return (
    <div className={styles.GroupsContainer}>
      <TopNotification duration={3000} response={joinResponse}/>
      <StuckModal />
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <p className={styles.title}>Groups</p>
            </div>
            <div className={`${styles.container} ${styles.myGroups}`}>
              {/* <div className={styles.group}>
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
              </div> */}
            </div>
            <div className={`${styles.container} ${styles.allGroups}`}>
              <div className={styles.searchZone}>
                <TagContainerGen maxTags={10}
                setTags={setTags}
                handleCreatedTagsChange={handleCreatedTagsChange}
                />
                <Search setSearchQuery={setSearchQuery} searchQuery={searchQuery}/>
                <button id={styles.CreateGroupBtn}>
                  <FontAwesomeIcon icon={faPlus} className={styles.plus}/>
                  Create new group
                </button>
              </div>
              <div className={styles.groupsWrapper}>
                {otherGrousEl}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking;