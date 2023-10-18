import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './components/Container/Main/Main';
import Stats from './components/Container/Stats/Stats';
import Ranking from './components/Container/Ranking/Ranking';
import Groups from './components/Container/Groups/Groups';
import Study from './components/Container/Study/Study';
import Account from './components/Container/Account/Account';
import Templates from './components/Container/Templates/Templates';
/* import EditTemplate from './components/Container/EditTemplate/EditTemplate'; */
import './App.css';
import Sidebar from './components/UI/Sidebar/Sidebar';
import Header from './components/UI/Header/Header';
import Footer from './components/UI/Footer/Footer';
import Planner from './components/Container/Planner/Planner';
import ChatModal from './components/UI/ChatModal/ChatModal';
import { sortSubjects } from './components/Container/Stats/StatTools';
import { socket } from "./socket";
import { setGroupMembers, getMyGroups, getLikedGroups } from './components/Container/Groups/GroupsTool';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isStudy, setIsStudy] = useState(false);
  const [reset, setReset] = useState(false)
  const [isChatModal, setIsChatModal] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [likedGroups, setLikedGroups] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  useEffect(() => {
    const socketConnectAction = () => {
      socket.emit('joinMyGroups');
      console.log('dddddddddd')
    };

    const socketResetAction = () => {
      console.log('reseeeeeeee')
    };

    socket.on('connect', socketConnectAction);
    socket.on('reset', socketResetAction);
    socket.on("studying", () => {console.log('ddd')})

    return () => {
      socket.off("joinMyGroups", socketConnectAction);
      socket.off("reset", socketResetAction);
    };
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const bringSubjects = useCallback(() => {
    fetch(`${serverOrigin}/api/study/bring-subjects`, { method: 'post' })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setSubjects(sortSubjects(data.subjects));
      }
    })
    .catch((error) => console.error(error));
  }, []);

  const bringAccountInfo = useCallback(() => {
    fetch(`${serverOrigin}/api/account/accountinfo`, { method: 'post' })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setUserInfo(data.userInfo);
        socket.connect();
      };
    })
    .catch((error) => console.error(error));
  }, []);

  const bringPlans = useCallback(() => {
    fetch(`${serverOrigin}/api/plan/bring-plans`, { method: 'post' })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setPlans(data.plans.map(plan => { plan.saved = true; plan.start = new Date(plan.start * 1000 * 60); plan.end = new Date(plan.end * 1000 * 60); return plan }));
      };
    })
    .catch((error) => console.error(error));
  }, []);

  const bringGroups = useCallback(() => {
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
    bringSubjects();
    bringAccountInfo();
  }, []);

  useEffect(() => {
    if (userInfo) {
      bringGroups();
      bringPlans();
    };
  }, [userInfo]);

  useEffect(() => {
    if (userInfo && groups) {
      setLikedGroups(getLikedGroups(userInfo, groups));
      const dividedGroups = getMyGroups(userInfo, groups);
      setMyGroups(dividedGroups.myGroups);
      setOtherGroups(dividedGroups.otherGroups);
    };
  }, [userInfo, groups]);

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} setIsChatModal={setIsChatModal} isChatModal={isChatModal} />
            <Main setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} />
            <Footer />
          </div>
        } />
        <Route path="/dashboard/stats" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} setIsChatModal={setIsChatModal} isChatModal={isChatModal} />
            <Stats setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} reset={reset} subjects={subjects} />
            <Footer />
          </div>
        } />
        <Route path="/dashboard/ranking" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} setIsChatModal={setIsChatModal} isChatModal={isChatModal} />
            <Ranking setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} reset={reset} />
            <Footer />
          </div>
        } />
        <Route path="/dashboard/groups" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} setIsChatModal={setIsChatModal} isChatModal={isChatModal} />
            <Groups setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} socket={socket} subjects={subjects} reset={reset} allMembers={allMembers} groups={groups} otherGroups={otherGroups} setOtherGroups={setOtherGroups} myGroups={myGroups} setMyGroups={setMyGroups} likedGroups={likedGroups} setLikedGroups={setLikedGroups} />
            <Footer />
          </div>
        } />
        <Route path="/dashboard/study" element={
          <div>
            {/* <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
              mode={"study"}
            /> */}
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            {/* <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} mode={"study"} /> */}
            <Study setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} socket={socket} subjects={subjects} setSubjects={setSubjects} isStudy={isStudy} setIsStudy={setIsStudy} events={plans} setEvents={setPlans} reset={reset} myGroups={myGroups} />
          </div>
        } />
        <Route path="/dashboard/planner" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} setIsChatModal={setIsChatModal} isChatModal={isChatModal} />
            <Planner setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} subjects={subjects} setSubjects={setSubjects} userInfo={userInfo} socket={socket} events={plans} setEvents={setPlans} reset={reset} />
          </div>
        } />
        <Route path="/dashboard/account" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} setIsChatModal={setIsChatModal} isChatModal={isChatModal} />
            <Account setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} subjects={subjects} setSubjects={setSubjects} userInfo={userInfo} />
          </div>
        } />
        <Route path="/dashboard/templates" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} setIsChatModal={setIsChatModal} isChatModal={isChatModal} />
            <Templates setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} />
          </div>
        } />
       {/* <Route path="/dashboard/templates/edit" element={
          <div>
            <ChatModal setIsChatModal={setIsChatModal} isChatModal={isChatModal} socket={socket} userInfo={userInfo} allMembers={allMembers} myGroups={myGroups} />
            <EditTemplate setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} socket={socket} subjects={subjects} setSubjects={setSubjects} isStudy={isStudy} setIsStudy={setIsStudy} events={plans} setEvents={setPlans} reset={reset} />
          </div>
        } /> */}
      </Routes>
    </Router>
  );
}

export default App;