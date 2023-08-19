import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../UI/Sidebar/Sidebar';
import Header from "../../UI/Header/Header";
import PieChart from '../../UI/PieChart';
import StatsCalendar from '../../UI/StatsCalendar/StatsCalendar';
import StuckModal from '../../UI/StuckModal/StuckModal';
import TodoList from '../../UI/TodoList/TodoList';
import ChartDataLabel from 'chartjs-plugin-datalabels';
import { colorsList } from '../../../constant';
import styles from './Stats.module.css';
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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className={styles.StatsContainer}>
      <Sidebar isSidebarOpen={isSidebarOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isSidebarHovered={isHovered}
      />
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isSidebarHovered={isHovered} />
      <div className={`${styles.CalendarModal} ${isCalendarOpen ? styles.isOpen : ''}`}>
      <StatsCalendar />
      </div>
      <div className={`${styles.Main} ${isSidebarOpen || isHovered ? styles.sidebarOpen : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id = "today">
            <p className={styles.title}
            onClick={toggleCalendar}
            >Today <FontAwesomeIcon icon={faCaretDown} style={{color: "#545B77",}} className={styles.caret}/></p>
            <div className={styles.container}>
            <PieChart
                  labels={
                    ["Math", "English", "History", "Sci", "Phy"]
                  }

                  datasets={
                    [
                      {
                        label: "My First dataset",
                        backgroundColor: colorsList,
                        borderColor: colorsList,
                        data: [2, 20, 30, 45],
                      },
                    ]
                  }

                  options={
                    {
                      plugins: {
                        datalabels: {
                          color: '#ffffff',
                          font: {
                            size: 32,
                            family: 'Arial',
                            weight: 700
                          },
                          formatter: (value, context, index) => {
                            const { chart, dataIndex } = context;
                            const labels = chart.data.labels;
                            const label = labels[dataIndex];
                            return ``;
                          }
                        }
                      }
                    }
                  }

                  plugins={
                    ChartDataLabel
                  }
                />

                <div className={styles.divider}>

                </div>

                <div className={styles.todoList}>
                  <p className={styles.title}>Your to-do list</p>
                  <ul>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                  </ul>
                </div>
            </div>
          </div>
          <div className={styles.smallBoxContainer}>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Study Time <br/><strong>16h</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Study Time <br/><strong>16h</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Today's Ranking<br/><strong>#1</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Website Usage <br/><strong>16h</strong></p>
            </div>
          </div>
          <div className={styles.horizontalLine}></div>
          <div className={styles.box} id = "today">
            <p className={styles.title}>Today</p>
            <div className={styles.container}>
            <PieChart
                  labels={
                    ["Math", "English", "History", "Sci", "Phy"]
                  }

                  datasets={
                    [
                      {
                        label: "My First dataset",
                        backgroundColor: colorsList,
                        borderColor: colorsList,
                        data: [2, 20, 30, 45],
                      },
                    ]
                  }

                  options={
                    {
                      plugins: {
                        datalabels: {
                          color: '#ffffff',
                          font: {
                            size: 32,
                            family: 'Arial',
                            weight: 700
                          },
                          formatter: (value, context, index) => {
                            const { chart, dataIndex } = context;
                            const labels = chart.data.labels;
                            const label = labels[dataIndex];
                            return ``;
                          }
                        }
                      }
                    }
                  }

                  plugins={
                    ChartDataLabel
                  }
                />

                <div className={styles.divider}>

                </div>

                <div className={styles.todoList}>
                  <p className={styles.title}>Your to-do list</p>
                  <ul>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                    <li>
                      <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                    </li>
                  </ul>
                </div>
            </div>
          </div>
          <div className={styles.smallBoxContainer}>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Study Time <br/><strong>16h</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Study Time <br/><strong>16h</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Today's Ranking<br/><strong>#1</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
              <FontAwesomeIcon icon={faBook} style={{color: "#FFEFEF",}} />
              </div>
              <p>Website Usage <br/><strong>16h</strong></p>
            </div>
          </div>
          <div className={styles.horizontalLine}></div>
          <div className={styles.box} id = "monthly">

          </div>
        </div>
      </div>
      <StuckModal />
    </div>
  )
}

export default Stats;