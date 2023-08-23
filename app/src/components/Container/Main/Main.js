import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import PieChart from '../../UI/PieChart';
import ChartDataLabel from 'chartjs-plugin-datalabels';
import { colorsList } from '../../../constant';
import styles from './Main.module.css'
import { plugins } from 'chart.js';

function Main(props) {
  let target = false;
  function divMoveXY(e) {
    if (target) {
      let dropArea = target.parentNode;
      let parentRect = dropArea.getBoundingClientRect();
      const xDiff = e.clientX - parentRect.left + parseInt(target.style.left.split('px')[0]);
      //console.log(xDiff)
      let topPosition = e.clientY - parentRect.top + dropArea.scrollTop - 10;
      let leftPosition = e.clientX - parentRect.left - 50;
      target.style.top = topPosition + 'px';
      target.style.left = leftPosition + 'px';
    }
  }

  function parentSearch(element, className) {
    while (element !== null) {
      if (element.classList.contains(className)) {
        return element;
      }
      element = element.parentElement;
    }
  
    return false;
  }

  function mouseDown(e) {
    e.preventDefault();
    target = parentSearch(e.target, 'box');
    if (target) {
      target.style.opacity = "0.8";
    } else {
      target = false;
    }
  }
  let mainViewerSetting = localStorage.getItem('mainViewerSetting');
  try {
    if (mainViewerSetting != null) {
      mainViewerSetting = JSON.parse(mainViewerSetting);
      if (!mainViewerSetting || !typeof mainViewerSetting === 'object') {
        mainViewerSetting = {
          1: {
            name: 'timeline',
            x: '100px',
            y: '100px',
          },
          2: {
            name: 'timeline',
            x: '100px',
            y: '100px',
          },
          3: {
            name: 'timeline',
            x: '100px',
            y: '100px',
          },
          4: {
            name: 'timeline',
            x: '100px',
            y: '100px',
          },
          5: {
            name: 'timeline',
            x: '100px',
            y: '100px',
          }
        };
      }
    } else {
      mainViewerSetting = {
        1: {
          name: 'timeline',
          x: '100px',
          y: '100px',
        },
        2: {
          name: 'timeline',
          x: '100px',
          y: '100px',
        },
        3: {
          name: 'timeline',
          x: '100px',
          y: '100px',
        },
        4: {
          name: 'timeline',
          x: '100px',
          y: '100px',
        },
        5: {
          name: 'timeline',
          x: '100px',
          y: '100px',
        }
      };
    }
  } catch (error) {
    console.error('Error parsing localStorage data:', error);
  }
  const box = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]
  const settings = Object.values(mainViewerSetting);
  useEffect(() => {
    settings.map((boxSetting, index) => {
      console.log(box[index].current)
      box[index].current.style.left = boxSetting.x;
      box[index].current.style.top = boxSetting.y;
    })
  }, []);
  function mouseUp(e) {
    e.preventDefault();
    if (target) {
      target.style.opacity = "1";
      let id = false;
      target.classList.forEach((className) => {
        if (/^[1-5]$/.test(className)) {
          id = parseInt(className);
        }
      });


      if (id) {
        mainViewerSetting[id].x = target.style.left;
        mainViewerSetting[id].y = target.style.top;
      }
      localStorage.setItem('mainViewerSetting', JSON.stringify(mainViewerSetting));
    }
    target = false;
  }

  document.addEventListener('mousemove', divMoveXY);

  return (
    <div className={styles.MainContainer}>
      <div className={`Main ${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={`${styles.box} box 1`} ref={box[0]} draggable onMouseDown={mouseDown} onMouseUp={mouseUp}>
            <div className={styles.inner}>
              <p className={styles.name}>Hi Jason Lee</p>
              <div className={styles.progress}>
                <p className={styles.report}>
                  You have 6 meetings to finish in this week.<br />
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
            <img src="./img/collaboration.jpeg" alt="" />
          </div>
          <div className={`${styles.box} box 2`} ref={box[1]} draggable onMouseDown={mouseDown} onMouseUp={mouseUp}>
            <div className={styles.inner}>
              <p className={styles.name}>Today's Activity</p>
              <div className={styles.progress}>
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
          <div className={`${styles.box} box 3`} ref={box[2]} draggable onMouseDown={mouseDown} onMouseUp={mouseUp}>
            <div className={styles.inner}>
              <p className={styles.name}>Plans</p>
              <ul>
                <li className={styles.plan}>
                  <p className={styles.topic}>Do Homework<strong> (11:45-12:45)</strong></p>
                  <p className={styles.explanation}>Solve English textbook pg 14 - 17</p>
                </li>
                <li className={styles.plan}>
                  <p className={styles.topic}>Do Homework<strong> (11:45-12:45)</strong></p>
                  <p className={styles.explanation}>Solve English textbook pg 14 - 17</p>
                </li>
                <li className={styles.plan}>
                  <p className={styles.topic}>Do Homework<strong> (11:45-12:45)</strong></p>
                  <p className={styles.explanation}>Solve English textbook pg 14 - 17</p>
                </li>
              </ul>
              <Link to="dashboard/stats">
                <button className={styles.toStatsBtn}>
                  View Stats
                </button>
              </Link>
            </div>
          </div>
          <div className={`${styles.box} box 4`} ref={box[3]} draggable onMouseDown={mouseDown} onMouseUp={mouseUp}>
            <div className={styles.inner}>
              <p className={styles.name}>Timeline</p>
              <ul>
                <li className={styles.plan}>
                  <p className={styles.topic}>Do Homework<strong> (11:45-12:45)</strong></p>
                  <p className={styles.explanation}>Solve English textbook pg 14 - 17</p>
                </li>
                <li className={styles.plan}>
                  <p className={styles.topic}>Do Homework<strong> (11:45-12:45)</strong></p>
                  <p className={styles.explanation}>Solve English textbook pg 14 - 17</p>
                </li>
                <li className={styles.plan}>
                  <p className={styles.topic}>Do Homework<strong> (11:45-12:45)</strong></p>
                  <p className={styles.explanation}>Solve English textbook pg 14 - 17</p>
                </li>
                <li className={styles.plan}>
                  <p className={styles.topic}>Do Homework<strong> (11:45-12:45)</strong></p>
                  <p className={styles.explanation}>Solve English textbook pg 14 - 17</p>
                </li>
              </ul>
            </div>
          </div>
          <div className={`${styles.box} box 5 ${styles.memo}`} ref={box[4]} draggable onMouseDown={mouseDown} onMouseUp={mouseUp}>
            <div className={styles.inner}>
              <p>test</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main;