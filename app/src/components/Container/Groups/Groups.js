import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch, faTags } from '@fortawesome/free-solid-svg-icons';
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
import CreateGroupModal from '../../UI/CreateGroupModal/CreateGroupModal';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Groups(props) {
  const { socket, userInfo, subjects, groups, allMembers } = props;

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedGroups, setLikedGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [joinGroupResponse, setJoinGroupResponse] = useState(null);
  const [openGroupPwModal, setOpenGroupPwModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);
  const [myTimerTotal, setMyTimerTotal] = useState(0);
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(false);
  const [createGroupResponse, setCreateGroupResponse] = useState(null);

  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };

  useEffect(() => {
    setLikedGroups(getLikedGroups(userInfo, groups));
    const dividedGroups = getMyGroups(userInfo, groups);
    setMyGroups(dividedGroups.myGroups);
    setOtherGroups(dividedGroups.otherGroups);
    //setOtherGroupsEl(otherGroupsGen(otherGroups, setNotificationResponse, setCopied, copied));
  }, [userInfo, groups]);

  useEffect(() => {
    if (joinTarget && joinGroupResponse.success) {
      setOtherGroups(otherGroups.filter((group) => { return group.group_id != joinTarget.group_id }));
      myGroups.push(joinTarget)
      setMyGroups(myGroups);
    };
  }, [joinGroupResponse]);

  useEffect(() => {
    if (createGroupResponse) {
      setJoinGroupResponse(createGroupResponse);
      if (createGroupResponse.success) {
        setIsCreateNewGroup(false);
        const newGroup = createGroupResponse.data.group;
        const myInfo = allMembers.find(member => {return member.user_id === userInfo.user_id});
        setMyGroups((prevGroups) => [...prevGroups, { ...newGroup, average_hr: 0, tags: JSON.stringify(newGroup.tags), members: [myInfo] }])
      }
    };
  }, [createGroupResponse]);

  useEffect(() => {
    if (subjects.daily && subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1]) {
      setMyTimerTotal(subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1]);
    };
  }, [subjects]);

  return (
    <div className={styles.GroupsContainer}>
      <TopNotification duration={3000} response={joinGroupResponse} />
      <StuckModal />
      {/* <div className={styles.groupsViewer}>
        <MyGroupsViewer myGroups={myGroups}/>
      </div> */}
      <CreateGroupModal isOpen={isCreateNewGroup} setIsOpen={setIsCreateNewGroup} setCreateGroupResponse={setCreateGroupResponse} />
      <GroupPwModal setOpenGroupPwModal={setOpenGroupPwModal} openGroupPwModal={openGroupPwModal} joinTarget={joinTarget} setJoinGroupResponse={setJoinGroupResponse} />
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <p className={styles.title}>Groups</p>
            </div>
            <div className={`${styles.container} ${styles.myGroups}`}>
              {/* <MyGroupsGen setJoinGroupResponse={setJoinGroupResponse} groups={myGroups} setOpenGroupPwModal={setOpenGroupPwModal} setJoinTarget={setJoinTarget} searchQuery={searchQuery} allMembers={allMembers} /> */}
              <MyGroupsViewer myGroups={myGroups} socket={socket} userInfo={userInfo} myTimerTotal={myTimerTotal} />
            </div>
            <div className={`${styles.container} ${styles.allGroups}`}>
              <div className={styles.searchZone}>
                <div className={styles.tagContainerWrapper}>
                  <div className={styles.title}>
                    <FontAwesomeIcon icon={faTags} className={styles.faTags} />
                    <h2>Tags</h2>
                  </div>
                  <TagContainerGen maxTags={10}
                    setTags={setTags}
                    handleCreatedTagsChange={handleCreatedTagsChange}
                  />
                </div>
                <Search setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
                <button id={styles.CreateGroupBtn} onClick={() => { setIsCreateNewGroup(!isCreateNewGroup) }}>
                  <FontAwesomeIcon icon={faPlus} className={styles.plus} />
                  Create new group
                </button>
              </div>
              <div className={styles.groupsWrapper}>
                <GroupsGen setJoinGroupResponse={setJoinGroupResponse} groups={otherGroups} setOpenGroupPwModal={setOpenGroupPwModal} setJoinTarget={setJoinTarget} searchQuery={searchQuery} userInfo={userInfo} queryTags={tags} />
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