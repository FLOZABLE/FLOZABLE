import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import StuckModal from '../../UI/StuckModal/StuckModal';
import Search from '../../UI/Search/Search';
import TagContainerGen from '../../UI/TagContainerGen/TagContainerGen';
import styles from './Groups.module.css';
import { getLikedGroups, getMyGroups, setGroupMembers } from './GroupsTool';
import TopNotification from '../../UI/TopNotification/TopNotification';
import GroupsGen from '../../UI/GroupsGen/GroupsGen';
import MyGroupsGen from '../../UI/MyGroupsGen/MyGroupsGen';
import GroupPwModal from '../../UI/GroupPwModal/GroupPwModal';
import MyGroupsViewer from '../../UI/MyGroupsViewer/MyGroupsViewer';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Groups(props) {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [likedGroups, setLikedGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [joinGroupResponse, setJoinGroupResponse] = useState(null);
  const [openGroupPwModal, setOpenGroupPwModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);
  const [allMembers, setAllMembers] = useState([]);

  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };

  useEffect(() => {
    fetch(`${serverOrigin}/api/groups/bring-groups`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setAllMembers(data.membersInfo);
          setGroups(setGroupMembers(data.groups, data.membersInfo));
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    setLikedGroups(getLikedGroups(props.userInfo, groups));
    const dividedGroups = getMyGroups(props.userInfo, groups);
    setMyGroups(dividedGroups.myGroups);
    setOtherGroups(dividedGroups.otherGroups);
    //setOtherGroupsEl(otherGroupsGen(otherGroups, setNotificationResponse, setCopied, copied));
  }, [props.userInfo, groups]);

  useEffect(() => {
    if (joinTarget && joinGroupResponse.success) {
      setOtherGroups(otherGroups.filter((group) => { return group.group_id != joinTarget.group_id }));
      myGroups.push(joinTarget)
      setMyGroups(myGroups);
    };
  }, [joinGroupResponse]);


  return (
    <div className={styles.GroupsContainer}>
      <TopNotification duration={3000} response={joinGroupResponse} />
      <StuckModal />
      {/* <div className={styles.groupsViewer}>
        <MyGroupsViewer myGroups={myGroups}/>
      </div> */}
      <GroupPwModal setOpenGroupPwModal={setOpenGroupPwModal} openGroupPwModal={openGroupPwModal} joinTarget={joinTarget} setJoinGroupResponse={setJoinGroupResponse} />
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <p className={styles.title}>Groups</p>
            </div>
            <div className={`${styles.container} ${styles.myGroups}`}>
              {/* <MyGroupsGen setJoinGroupResponse={setJoinGroupResponse} groups={myGroups} setOpenGroupPwModal={setOpenGroupPwModal} setJoinTarget={setJoinTarget} searchQuery={searchQuery} allMembers={allMembers} /> */}
              <MyGroupsViewer myGroups={myGroups} />
            </div>
            <div className={`${styles.container} ${styles.allGroups}`}>
              <div className={styles.searchZone}>
                <TagContainerGen maxTags={10}
                  setTags={setTags}
                  handleCreatedTagsChange={handleCreatedTagsChange}
                />
                <Search setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
                <button id={styles.CreateGroupBtn}>
                  <FontAwesomeIcon icon={faPlus} className={styles.plus} />
                  Create new group
                </button>
              </div>
              <div className={styles.groupsWrapper}>
                <GroupsGen setJoinGroupResponse={setJoinGroupResponse} groups={otherGroups} setOpenGroupPwModal={setOpenGroupPwModal} setJoinTarget={setJoinTarget} searchQuery={searchQuery} />
                {/* <otherGroupsGen otherGroups={otherGroups} setNotificationResponse={setNotificationResponse} setCopied={setCopied} copied={copied} /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Groups;