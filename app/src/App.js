import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './components/Container/Main/Main';
import Stats from './components/Container/Stats/Stats';
import Ranking from './components/Container/Ranking/Ranking';
import Groups from './components/Container/Groups/Groups';
import './App.css';
import Sidebar from './components/UI/Sidebar/Sidebar';
import Header from './components/UI/Header/Header';
import Footer from './components/UI/Footer/Footer';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    fetch('/api/information/accountinfo', { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUserInfo(data.userInfo);
        };
        console.log(data);
      })
      .catch((error) => console.error(error));
  }, []);

  console.log(userInfo)
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
            <Main setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
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
            <Stats setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
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
            <Ranking setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
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
            <Groups setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;