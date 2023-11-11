import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import PieChart from '../../UI/PieChart';
import ChartDataLabel from 'chartjs-plugin-datalabels';
import { colorsList } from '../../../constant';
import styles from './Main.module.css'
import parse from "html-react-parser";
import { plugins } from 'chart.js';
import Draggable from 'react-draggable';

function Main(props) {
  const {setIsSidebarOpen, isSidebarOpen, isSidebarHovered, userInfo, subjects, plans} = props;

  const subjectRef = useRef(null);
  const hiMsgRef = useRef(null);
  const recentActivityRef = useRef(null);
  const plannerRef = useRef(null);
  const memoRef = useRef(null);

  let subjectActivity = [];
  function sortActivity(){
    for (let i = 0; i < subjects.length; i++){
      subjects[i].daily.grouped[subjects[i].daily.grouped.length - 1].map(([startUnix, stopUnix]) => {
        subjectActivity.push([startUnix, stopUnix, subjects[i].name]);
      });
    }

    subjectActivity.sort((a, b) => b[1] - a[1]);
  }
  sortActivity();

  let planActivity = [];
  function sortPlans(){
    for (let i = 0; i < plans.length; i++){
      let start = plans[i].start;
      let end = plans[i].end;
      planActivity.push({start: new Date(start).getTime(), end: new Date(end).getTime(), title: plans[i].title, description: plans[i].description});
    }

    planActivity.sort((a, b) => b.start - a.start);
  }
  sortPlans();

  let target = false;
  function divMoveXY(e) {
    if (target) {
      let dropArea = target.parentNode;
      let parentRect = dropArea.getBoundingClientRect();
      const xDiff = e.clientX - parentRect.left + parseInt(target.style.left.split('px')[0]);
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
          name: 'test',
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
 /*  const settings = Object.values(mainViewerSetting);
  useEffect(() => {
    settings.map((boxSetting, index) => {
      box[index].current.style.left = boxSetting.x;
      box[index].current.style.top = boxSetting.y;
    })
  }, []); */

  return (
    <div className={styles.MainContainer}>
      {/* <div className={`Main ${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <Draggable nodeRef={hiMsgRef}>
          <div className={`${styles.box} box 1`} >
            <div className={styles.inner}>
              <p className={styles.name}>Hi Jason Lee</p>
              <div className={styles.progress}>
                <p className={styles.report}>
                  You have 6 meetings to finish in this week.<br />
                  Your progress activity is excellent
                </p>

                <div className={styles.btnCenter}>
                  <Link to="/dashboard/stats">
                    <button className={styles.toStatsBtn}>
                      View Stats
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <img src="./img/collaboration.jpeg" alt="" />
          </div>
          </Draggable>
          <Draggable nodeRef={subjectRef}>
          <div className={`${styles.box} box 2`} >
            <div className={styles.inner}>
              <p className={styles.name}>Subject Usage</p>
              <div className={styles.progress}>
                <PieChart
                  labels={
                    subjects.map((subject) => subject.name)
                  }

                  datasets={
                    [
                      {
                        label: "Seconds",
                        backgroundColor: colorsList,
                        borderColor: colorsList,
                        data: subjects.map((subject) => subject.daily.total[subject.daily.total.length - 1]),
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
                  <Link to="/dashboard/stats">
                    <button className={styles.toStatsBtn}>
                      View Stats
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </Draggable>
          <Draggable nodeRef={plannerRef}>
          <div className={`${styles.box} box 3`}>
            <div className={styles.inner}>
              <p className={styles.name}>Planner</p>
              {
                planActivity.map((plan, i) => {
                  const startTime = plan.start;
                  const endTime = plan.end;

                  const date1 = new Date(startTime);
                  const hours1 = date1.getHours();
                  const minutes1 = "0" + date1.getMinutes();
                  const startString = (hours1 > 12 ? hours1 - 12 : hours1) + ':' + minutes1.substring(minutes1.length - 2) + (hours1 >= 12 ? "PM" : "AM");

                  const date2 = new Date(endTime);
                  const hours2 = date2.getHours();
                  const minutes2 = "0" + date2.getMinutes();
                  const endString = (hours2 > 12 ? hours2 - 12 : hours2) + ':' + minutes2.substring(minutes2.length - 2) + (hours2 >= 12 ? "PM" : "AM");

                  const prevTime = i > 0 ? new Date(planActivity[i - 1].end) : new Date(); //check if event has passed
                  const timeDiff = prevTime - endTime;

                  if (endTime < Date.now()){
                    return (
                      <li className={styles.plan} key={i}>
                        <p className={styles.topic}>{plan.title}<strong><br></br>(Passed)<br></br>({startString} - {endString})</strong></p>
                        <div className={styles.explanation}>{parse(plan.description)}</div>
                      </li>
                    )
                  }
                  return (
                    <li className={styles.plan} key={i}>
                      <p className={styles.topic}>{plan.title}<br></br><strong> ({startString} - {endString})</strong></p>
                      <div className={styles.explanation}>{parse(plan.description)}</div>
                    </li>
                  );
                })
              }
              <Link to="/dashboard/planner">
                <button className={styles.toStatsBtn}>
                  View Plans
                </button>
              </Link>
            </div>
          </div>
          </Draggable>
          <Draggable nodeRef={recentActivityRef}>
          <div className={`${styles.box} box 4`} >
            <div className={styles.inner}>
              <p className={styles.name}>Recent Activity</p>
              <ul>
                {
                  subjectActivity.slice(0, Math.min(7,subjectActivity.length)).map((subject, i) => {
                    const startTime = subject[0];
                    const endTime = subject[1];

                    const date1 = new Date(startTime * 1000);
                    const hours1 = date1.getHours();
                    const minutes1 = "0" + date1.getMinutes();
                    const startString = (hours1 > 12 ? hours1 - 12 : hours1) + ':' + minutes1.substring(minutes1.length - 2) + (hours1 >= 12 ? "PM" : "AM");

                    const date2 = new Date(endTime * 1000);
                    const hours2 = date2.getHours();
                    const minutes2 = "0" + date2.getMinutes();
                    const endString = (hours2 > 12 ? hours2 - 12 : hours2) + ':' + minutes2.substring(minutes2.length - 2) + (hours2 >= 12 ? "PM" : "AM");

                    const prevTime = i > 0 ? new Date(subjectActivity[i - 1][0] * 1000) : new Date();
                    const prevDate = (prevTime.getMonth() + 1) + "/" + prevTime.getDate() + "/" + prevTime.getFullYear();
                    const startDate = (date1.getMonth() + 1)+ "/" + date1.getDate() + "/" + date1.getFullYear();

                    if (prevDate != startDate){
                      return (
                        <div key = {i}>
                          <div className={styles.divider}>
                            <p>{startDate}</p>
                          </div>
                          <li className={styles.plan} key={i}>
                            <p className={styles.topic}>{subject[2]}<strong> ({startString} - {endString})</strong></p>
                          </li>
                        </div>
                      );
                    }

                    return (
                      <li className={styles.plan} key={i}>
                        <p className={styles.topic}>{subject[2]}<strong> ({startString} - {endString})</strong></p>
                      </li>
                    );
                  })
                }
              </ul>
            </div>
          </div>
          </Draggable>
         <Draggable nodeRef={memoRef}>
         <div className={`${styles.box} box 5 ${styles.memo}`} >
            <div className={styles.inner}>
              <p>test</p>
            </div>
          </div>
         </Draggable>

        </div>
      </div> */}
    </div>
  )
}

export default Main;