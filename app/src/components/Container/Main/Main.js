import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Sidebar from '../../UI/Sidebar/Sidebar';
import Header from "../../UI/Header/Header";
import styles from './Main.module.css'

function Main() {
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
  return (
    <div className={styles.MainContainer}>
      <Sidebar isSidebarOpen={isSidebarOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isSidebarHovered={isHovered}
      />
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered}/>
      
      <div className={`${styles.Main} ${isSidebarOpen || isHovered ? styles.sidebarOpen : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <div className={styles.inner}>
              <p className={styles.name}>Hi Jason Lee</p>
              <div className={styles.progress}>
                <p className={styles.report}>
                  You have 6 meetings to finish in this week.<br/>
                  Your progress activity is exellent
                </p>

                <div className={styles.btnCenter}>
                <Link to="dashboard/stats">
                  <button className={styles.toStatsBtn}>
                    View Stats
                  </button>
                </Link>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.inner}>
              <p className={styles.name}>Hi Jason Lee</p>
              <div className={styles.progress}>
                <p className={styles.report}>
                  You have 6 meetings to finish in this week.<br/>
                  Your progress activity is exellent
                </p>

                <div className={styles.btnCenter}>
                <Link to="dashboard/stats">
                  <button className={styles.toStatsBtn}>
                    View Stats
                  </button>
                </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main;