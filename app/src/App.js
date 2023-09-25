import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './components/Container/Main/Main';
import Stats from './components/Container/Stats/Stats';
import Ranking from './components/Container/Ranking/Ranking';
import Groups from './components/Container/Groups/Groups';
import Study from './components/Container/Study/Study';
import './App.css';
import Sidebar from './components/UI/Sidebar/Sidebar';
import Header from './components/UI/Header/Header';
import Footer from './components/UI/Footer/Footer';
import Planner from './components/Container/Planner/Planner';
import { sortSubjects } from './components/Container/Stats/StatTools';
import { socket } from "./socket";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isStudy, setIsStudy] = useState(false);
  const [updateSubjects, setUpdateSubjects] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  useEffect(() => {
    socket.on('connect', () => {
      socket.emit('joinMyGroups');
    });
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    fetch(`${serverOrigin}/api/information/accountinfo`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUserInfo(data.userInfo);
          socket.connect();
        };
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch(`${serverOrigin}/api/information/bring-subjects`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubjects(sortSubjects(data.subjects));
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch(`${serverOrigin}/api/plan/bring-plans`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPlans(data.plans.map(plan => {plan.saved = true; plan.start = new Date(plan.start * 1000 * 60); plan.end = new Date(plan.end * 1000 * 60); return plan}));
        };
      })
      .catch((error) => console.error(error));
  }, []);


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
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
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
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
            <Stats setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} />
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
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
            <Ranking setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} />
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
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
            <Groups setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} />
            <Footer />
          </div>
        } />
        <Route path="/dashboard/study" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
              mode={"study"}
            />
            {/* <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} mode={"study"} /> */}
            <Study setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} userInfo={userInfo} socket={socket} subjects={subjects} setSubjects={setSubjects} isStudy={isStudy} setIsStudy={setIsStudy} events={plans} setEvents={setPlans} />
          </div>
        } />
                <Route path="/dashboard/planner" element={
          <div>
            <Sidebar isSidebarOpen={isSidebarOpen}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isSidebarHovered={isHovered}
            />
            <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
            <Planner setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} subjects={subjects} setSubjects={setSubjects} userInfo={userInfo} socket={socket} events={plans} setEvents={setPlans}/>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;