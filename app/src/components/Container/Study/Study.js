import React, {useState} from 'react';
import styles from './Study.module.css'
import Sidebar from '../../UI/Sidebar/Sidebar';
import Header from "../../UI/Header/Header";

function Study() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  return (
    <div className={styles.statsContainer}>
      <Sidebar isSidebarOpen={isSidebarOpen}/>
      <Header onToggleSidebar={toggleSidebar}/>
      <p>test</p>
    </div>
  )
}

export default Study;