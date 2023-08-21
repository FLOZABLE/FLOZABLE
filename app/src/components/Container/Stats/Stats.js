import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import PieChart from '../../UI/PieChart';
import LineChart from '../../UI/LineChart';
import BarChart from '../../UI/BarChart';
import StatsCalendar from '../../UI/StatsCalendar/StatsCalendar';
import StuckModal from '../../UI/StuckModal/StuckModal';
import TodoList from '../../UI/TodoList/TodoList';
import Timeline from '../../UI/Timeline/Timeline';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import ChartDataLabel from 'chartjs-plugin-datalabels';
import { colorsList } from '../../../constant';
import styles from './Stats.module.css';
import { plugins } from 'chart.js';

function Stats(props) {

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className={styles.StatsContainer}>
      <div className={`${styles.CalendarModal} ${isCalendarOpen ? styles.isOpen : ''}`}>
        <StatsCalendar onToggleCalendar={toggleCalendar} isCalendarOpen={isCalendarOpen} />
      </div>
      <StuckModal />
      <div className={`${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? styles.sidebarOpen : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <button className={styles.title}
                onClick={toggleCalendar}
              >Today <FontAwesomeIcon icon={faCaretDown} style={{ color: "#545B77", }} className={styles.caret} /></button>
              <RadioBtn items={['Daily', 'Weekly', 'Monthly']} />
            </div>
            <div className={styles.container}>
              <div className={styles.divided}>
              <p className={styles.title}>Today's Time Usage by Subjects</p>
              <div className={styles.chartContainer}>
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
                      legend: {
                        position: 'bottom',
                      },
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
              </div>
              </div>
              <div className={styles.divider}>

              </div>
              <div className={`${styles.divided} ${styles.todoList}`}>
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
                <FontAwesomeIcon icon={faBook} style={{ color: "#fff", }} />
              </div>
              <p>Study Time <br /><strong>16h</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
                <FontAwesomeIcon icon={faBook} style={{ color: "#fff", }} />
              </div>
              <p>Study Time <br /><strong>16h</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
                <FontAwesomeIcon icon={faBook} style={{ color: "#fff", }} />
              </div>
              <p>Today's Ranking<br /><strong>#1</strong></p>
            </div>
            <div className={styles.smallBox}>
              <div className={styles.circle}>
                <FontAwesomeIcon icon={faBook} style={{ color: "#fff", }} />
              </div>
              <p>Website Usage <br /><strong>16h</strong></p>
            </div>
          </div>
          <div className={styles.smallBoxContainer}>
            <div className={`${styles.smallBox} ${styles.chartsBox}`}>
              <p className={styles.title}>Today's Timeline</p>
              <div className={styles.chartContainer}>
                <Timeline key={1}/>
              </div>
            </div>
            <div className={`${styles.smallBox} ${styles.chartsBox}`}>
              <p className={styles.title}>Today's Hourly Histogram</p>
              <div className={styles.chartContainer}>
                <BarChart
                  labels={
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                  }

                  datasets={
                    [
                      {
                        data: [10],
                        backgroundColor: colorsList
                      }
                    ]
                  }

                  options={
                    {
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      scales: {
                        y: {
                          grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: false,
                            borderDash: [5, 5]
                          },
                          ticks: {
                            display: true,
                            padding: 10,
                            color: '#9ca2b7',
                            stepSize: 1
                          }
                        },
                        x: {
                          grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: true,
                            borderDash: [5, 5]
                          },
                          ticks: {
                            display: true,
                            color: '#9ca2b7',
                            padding: 10
                          }
                        },
                      },
                    }
                  }
                />
              </div>
            </div>
          </div>
          <div className={styles.smallBoxContainer}>
            <div className={`${styles.smallBox} ${styles.chartsBox}`}>
              <p className={styles.title}>Daily Study Time Trend</p>
              <div className={styles.chartContainer}>
                <LineChart
                  labels={
                    ["Math", "English", "History", "Sci"]
                  }

                  datasets={
                    [
                      {
                        label: "My First dataset",
                        backgroundColor: "#fd7f6f",
                        borderColor: "#fd7f6f",
                        data: [2, 10, 3, 1],
                      },
                    ]
                  }

                  options={
                    {
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      scales: {
                        y: {
                          grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: false,
                            borderDash: [5, 5]
                          },
                          ticks: {
                            display: true,
                            padding: 10,
                            color: '#9ca2b7',
                            stepSize: 1
                          }
                        },
                        x: {
                          grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: true,
                            borderDash: [5, 5]
                          },
                          ticks: {
                            display: true,
                            color: '#9ca2b7',
                            padding: 10
                          }
                        },
                      },
                    }
                  }
                />
              </div>
            </div>
            <div className={`${styles.smallBox} ${styles.chartsBox}`}>
              <p className={styles.title}>Daily Ranking</p>
              <div className={styles.chartContainer}>
                <LineChart
                  labels={
                    ["Math", "English", "History", "Sci", "Phy"]
                  }

                  datasets={
                    [
                      {
                        label: "My First dataset",
                        backgroundColor: "#fd7f6f",
                        borderColor: "#fd7f6f",
                        data: [2, 10, 3, 1],
                      },
                    ]
                  }

                  options={
                    {
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      scales: {
                        y: {
                          reverse: true,
                          grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: false,
                            borderDash: [5, 5]
                          },
                          ticks: {
                            display: true,
                            padding: 10,
                            color: '#9ca2b7',
                            stepSize: 1
                          }
                        },
                        x: {
                          grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: true,
                            borderDash: [5, 5]
                          },
                          ticks: {
                            display: true,
                            color: '#9ca2b7',
                            padding: 10
                          }
                        },
                      },
                    }
                  }
                />
              </div>
            </div>

          </div>
          <div className={styles.smallBoxContainer}>
            <div className={`${styles.smallBox} ${styles.chartsBox}`}>
              <p className={styles.title}>Today's Website Usage while Studying</p>
              <div className={styles.chartContainer}>
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
                        legend: {
                          position: 'bottom'
                        },
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
              </div>
            </div>
            <div className={`${styles.smallBox} ${styles.chartsBox}`}>
              <p className={styles.title}>Today's App Usage while Studying</p>
              <div className={styles.chartContainer}>
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
                        legend: {
                          position: 'bottom',
                        },
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats;