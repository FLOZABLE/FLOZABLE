import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import Sidebar from '../../UI/Sidebar/Sidebar';
import Header from "../../UI/Header/Header";
import PieChart from '../../UI/PieChart';
import ChartDataLabel from 'chartjs-plugin-datalabels';
import { colorsList } from '../../../constant';
import styles from './Stats.module.css'
import { plugins } from 'chart.js';

function Stats() {
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
    <div className={styles.StatsContainer}>
      <Sidebar isSidebarOpen={isSidebarOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isSidebarHovered={isHovered}
      />
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />

      <div className={`${styles.Main} ${isSidebarOpen || isHovered ? styles.sidebarOpen : ''}`}>
        <p>d</p>
      </div>
    </div>
  )
}

export default Stats;