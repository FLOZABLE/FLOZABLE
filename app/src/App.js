import React, { useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Draggable from "react-draggable";
import Main from "./components/Container/Main/Main";
import Stats from "./components/Container/Stats/Stats";
import Ranking from "./components/Container/Ranking/Ranking";
import Groups from "./components/Container/Groups/Groups";
import Study from "./components/Container/Study/Study";
import Account from "./components/Container/Account/Account";
import Challenge from "./components/Container/Challenge/Challenge";
import "./App.css";
import Sidebar from "./components/UI/Sidebar/Sidebar";
import Header from "./components/UI/Header/Header";
import Planner from "./components/Container/Planner/Planner";
import { socket } from "./socket";
import { createStudyGraph, timelineSort } from "./utils/timelineSorting";
import EventModal from "./components/UI/EventModal/EventModal";
import AddSubjectModal from "./components/UI/AddSubjectModal/AddSubjectModal";
import User from "./components/Container/User/User";
import TopNotification from "./components/UI/TopNotification/TopNotification";
import NotificationModal from "./components/UI/NotificationModal/NotificationModal";
import ChatsModal from "./components/UI/ChatsModal/ChatsModal";
import Friends from "./components/Container/Friends/Friends";
import { filterGroups } from "../src/utils/Tool";
import Themes from "./components/Container/Themes/Themes";
import ChallengeRooms from "./components/Container/ChallengeRooms/ChallengeRooms";
import { Helmet, HelmetProvider } from "react-helmet-async";
import AccountModal from "./components/UI/AccountModal/AccountModal";
import ReactGA from 'react-ga4';
import Tutorial from "./components/UI/Tutorial/Tutorial";
import NotFound from "./components/Container/404/404";
import AudioStopper from "./components/UI/AudioStopper/AudioStopper";
import WelcomeModal from "./components/UI/WelcomeModal/WelcomeModal";

if (process.env.REACT_APP_ENV === "production") {
  ReactGA.initialize(process.env.REACT_APP_TRACKING_ID);
};

const serverOrigin = process.env.REACT_APP_ORIGIN;

function App() {
  const [response, setResponse] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isStudy, setIsStudy] = useState(false);
  const [reset, setReset] = useState(false);
  const [isChatModal, setIsChatModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);
  const [likedGroups, setLikedGroups] = useState([]);
  //const [planModal, setPlanModal] = useState(false);

  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [isNotificationModal, setIsNotificationModal] = useState(false);

  const [isAccountModal, setIsAccountModal] = useState(false);

  const [totalNewMsg, setTotalNewMsg] = useState(0);

  const [planModal, setPlanModal] = useState({
    opened: false,
    title: '',
    description: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 1000 * 30),
    repeat: 0,
    priority: 50,
    notification: -1,
    subject: null,
    id: null,
    saved: false,
    completed: false,
    type: 'local',
    editable: true
  });

  const [musicFiles] = useState([
    { id: "p29JUpsOSTE", name: "Fire", icon: "🔥", audio: new Audio("../../audio/Fire.mp3") },
    { id: "HVau-JRGirg", name: "Forest", icon: "🌱", audio: new Audio("../../audio/Forest.mp3") },
    { id: "xDWG9SrB4io", name: "Rain", icon: "💧", audio: new Audio("../../audio/Rain.mp3") },
    { id: "SE9nDvo94hw", name: "Wave", icon: "🌊", audio: new Audio("../../audio/Wave.mp3") },
    { id: "WNcsUNKlAKw", name: "Wind", icon: "🍃", audio: new Audio("../../audio/Wind.mp3") },
  ])

  const tutorialBoxRef = useRef(null);
  const tutorialTextRef = useRef(null);

  useEffect(() => {
    ReactGA.send(
      {
        hitType: "pageview",
        page: window.location.pathname + window.location.search,
      }
    );
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const socketConnectAction = () => {
      socket.emit("joinMyGroups");
    };

    const socketResetAction = () => { };

    const onNotification = (data) => {
      setNotifications((prev) => [...prev, data]);
    }

    socket.on("connect", socketConnectAction);
    socket.on("reset", socketResetAction);
    socket.on("studying", () => { });
    socket.on("notification", onNotification);
    socket.on('reset', bringSubjects);
    socket.on('update tools', bringSubjects);

    return () => {
      socket.off("joinMyGroups", socketConnectAction);
      socket.off("reset", socketResetAction);
      socket.off("notification", onNotification);
      socket.off('reset', bringSubjects);
      socket.off('update tools', bringSubjects);
    };
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (!subjects.length) return;

    const lastSubject = subjects[subjects.length - 1];
    setPlanModal(prev => ({ ...prev, subject: lastSubject.id }));
  }, [subjects]);

  const bringSubjects = useCallback(() => {
    fetch(`${serverOrigin}/study/bring-subjects`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubjects(timelineSort(data.subjects));
          bringPlans(data.subjects);
          console.log('subject', data);
          //setSubjects(sortSubjects(data.subjects));
        } else {
          bringPlans([]);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const bringAccountInfo = useCallback(() => {
    fetch(`${serverOrigin}/account/accountinfo`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
        console.log(data, 'userinfo')
        if (data.success) {
          setUserInfo(data.userInfo);
          setNotifications(data.notifications);
          socket.connect();
        } else if (data.code === 401) {
          console.log('not user');
          setUserInfo(false);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const bringPlans = useCallback((subjects) => {
    fetch(`${serverOrigin}/plan`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("plans", data.plans)
          setPlans(
            data.plans.map((plan) => {
              plan.saved = true;
              plan.start = new Date(plan.start * 1000 * 60);
              plan.end = new Date(plan.end * 1000 * 60);
              const subject = subjects.find(subject => subject.id === plan.subject);
              if (subject) {
                plan.backgroundColor = subject.color;
                plan.borderColor = subject.color;
              }

              if (plan.completed) {
                plan.className = "completed";
              }
              return plan;
            }),
          );
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const bringGroups = useCallback(() => {
    fetch(`${serverOrigin}/groups/bring-groups`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          if (userInfo === false) {
            setOtherGroups(data.groups);
            return;
          }
          const { userGroups, otherGroups } = filterGroups(userInfo, data.groups);
          setGroups(data.groups);
          setMyGroups(userGroups);
          setOtherGroups(otherGroups);
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo]);

  useEffect(() => {
    bringAccountInfo();
    bringSubjects();
  }, []);

  useEffect(() => {
    if (userInfo === null || userInfo === undefined) return;
    bringGroups();
  }, [userInfo]);

  useEffect(() => {
    if (userInfo === false) {
      setIsAccountModal(true);
    }
  }, [userInfo]);

  useEffect(() => {
    if (response && response.reason === "Sign in required") {
      setIsAccountModal(true);
    }
  }, [response]);

  return (
    <Router>
      <AudioStopper musicFiles={musicFiles} />
      <TopNotification
        response={response}
      />
      <NotificationModal
        isNotificationModal={isNotificationModal}
        notifications={notifications.filter(notification => notification.t !== -2)}
        setNotifications={setNotifications}
        setResponse={setResponse}
      />
      <AddSubjectModal
        setIsAddSubjectModal={setIsAddSubjectModal}
        isAddSubjectModal={isAddSubjectModal}
        setAddSubjectResponse={setResponse}
        subjects={subjects}
        setSubjects={setSubjects}
        tutorialBoxRef={tutorialBoxRef}
        tutorialTextRef={tutorialTextRef}
      />
      <ChatsModal
        setIsChatModal={setIsChatModal}
        isChatModal={isChatModal}
        userInfo={userInfo}
        myGroups={myGroups}
        totalNewMsg={totalNewMsg}
        setTotalNewMsg={setTotalNewMsg}
      />
      <EventModal
        setPlanModal={setPlanModal}
        planModal={planModal}
        subjects={subjects}
        setEvents={setPlans}
        events={plans}
        setIsAddSubjectModal={setIsAddSubjectModal}
        setResponse={setResponse}
        tutorialBoxRef={tutorialBoxRef}
        tutorialTextRef={tutorialTextRef}
      />
      <AccountModal
        isOpened={isAccountModal}
        setIsOpened={setIsAccountModal}
        setResponse={setResponse}
        bringAccountInfo={bringAccountInfo}
        bringSubjects={bringSubjects}
      />
      <WelcomeModal 
        userInfo={userInfo}
      />
      <Header
        setPlanModal={(planModal) => {
          setPlanModal((prev) => ({ ...prev, opened: planModal }))
        }}
        planModal={planModal.opened}
        setPlans={setPlans}
        plans={plans}
        subjects={subjects}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isSidebarHovered={isHovered}
        setIsChatModal={setIsChatModal}
        isChatModal={isChatModal}
        totalNewMsg={totalNewMsg}
        userInfo={userInfo}
        setIsNotificationModal={setIsNotificationModal}
        notifications={notifications.filter(notification => { return notification.t >= 0 })}
        tutorialBoxRef={tutorialBoxRef}
        tutorialTextRef={tutorialTextRef}
      />
      <div className={`touchBlocker ${isAccountModal ? "blocked" : ""}`}></div>
      <Tutorial
        setResponse={setResponse}
        tutorialBoxRef={tutorialBoxRef}
        tutorialTextRef={tutorialTextRef}
        isAccountModal={isAccountModal}
      />
      <Routes>
        <Route
          path="/dashboard"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Dashboard - FLOZABLE</title>
                  <meta name="title" content="Dashboard - FLOZABLE" />
                  <meta name="description" content="Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/dashboard" />
                  <meta property="og:title" content="Dashboard - FLOZABLE" />
                  <meta property="og:description" content="Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/dashboard" />
                  <meta property="twitter:title" content="Dashboard - FLOZABLE" />
                  <meta property="twitter:description" content="Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="progress tracking, study achievements, study sessions planning" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />

              <Main
                subjects={subjects}
                plans={plans}
                setPlans={setPlans}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                setResponse={setResponse}
                myGroups={myGroups}
                setMyGroups={setMyGroups}
                setOtherGroups={setOtherGroups}
                setPlanModal={(planModal) => {
                  setPlanModal((prev) => ({ ...prev, opened: planModal }))
                }}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              {/* <Footer /> */}
            </div>
          }
        />
        <Route
          path="/dashboard/stats"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Stats - FLOZABLE</title>
                  <meta name="title" content="Stats - FLOZABLE" />
                  <meta name="description" content="Explore detailed statistics on your study habits with FLOZABLE Stats. Track study hours, set goals, and analyze your performance over time." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/stats" />
                  <meta property="og:title" content="Stats - FLOZABLE" />
                  <meta property="og:description" content="Explore detailed statistics on your study habits with FLOZABLE Stats. Track study hours, set goals, and analyze your performance over time." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/stats" />
                  <meta property="twitter:title" content="Stats - FLOZABLE" />
                  <meta property="twitter:description" content="Explore detailed statistics on your study habits with FLOZABLE Stats. Track study hours, set goals, and analyze your performance over time." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="study statistics, performance analysis, study goals" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />

              <Stats
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                reset={reset}
                subjects={subjects}
                setResponse={setResponse}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/ranking"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Ranking - FLOZABLE</title>
                  <meta name="title" content="Ranking - FLOZABLE" />
                  <meta name="description" content="Check your ranking and compete with others on FLOZABLE. Stay motivated and climb the leaderboard by achieving your study goals." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/ranking" />
                  <meta property="og:title" content="Ranking - FLOZABLE" />
                  <meta property="og:description" content="Check your ranking and compete with others on FLOZABLE. Stay motivated and climb the leaderboard by achieving your study goals." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/ranking" />
                  <meta property="twitter:title" content="Ranking - FLOZABLE" />
                  <meta property="twitter:description" content="Check your ranking and compete with others on FLOZABLE. Stay motivated and climb the leaderboard by achieving your study goals." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="study ranking, leaderboard, competition, study goals" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <Ranking
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                reset={reset}
                setResponse={setResponse}
              />
              {/* <Footer /> */}
            </div>
          }
        />
        <Route
          path="/dashboard/groups"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Groups - FLOZABLE</title>
                  <meta name="title" content="Groups - FLOZABLE" />
                  <meta name="description" content="Join or create study groups on FLOZABLE. Collaborate with users who share similar interests, participate in group activities, and enhance your learning journey together." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/groups" />
                  <meta property="og:title" content="Groups - FLOZABLE" />
                  <meta property="og:description" content="Join or create study groups on FLOZABLE. Collaborate with users who share similar interests, participate in group activities, and enhance your learning journey together." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/groups" />
                  <meta property="twitter:title" content="Groups - FLOZABLE" />
                  <meta property="twitter:description" content="Join or create study groups on FLOZABLE. Collaborate with users who share similar interests, participate in group activities, and enhance your learning journey together." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="study groups, collaboration, group activities, shared interests" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <Groups
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                subjects={subjects}
                reset={reset}
                otherGroups={otherGroups}
                setOtherGroups={setOtherGroups}
                myGroups={myGroups}
                setMyGroups={setMyGroups}
                likedGroups={likedGroups}
                setLikedGroups={setLikedGroups}
                setResponse={setResponse}
                bringGroups={bringGroups}
                setIsChatModal={setIsChatModal}
              />
              {/* <Footer /> */}
            </div>
          }
        />
        <Route
          path="/dashboard/study"
          element={
            <div style={{ zIndex: 5, position: 'relative' }}>
              <HelmetProvider>
                <Helmet>
                  <title>Study - FLOZABLE</title>
                  <meta name="title" content="Study - FLOZABLE" />
                  <meta name="description" content="Enhance your learning experience on FLOZABLE. Access study materials, set personalized study plans, and engage with a community of learners for a more productive study session." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/study" />
                  <meta property="og:title" content="Study - FLOZABLE" />
                  <meta property="og:description" content="Enhance your learning experience on FLOZABLE. Access study materials, set personalized study plans, and engage with a community of learners for a more productive study session." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/study" />
                  <meta property="twitter:title" content="Study - FLOZABLE" />
                  <meta property="twitter:description" content="Enhance your learning experience on FLOZABLE. Access study materials, set personalized study plans, and engage with a community of learners for a more productive study session." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="learning experience, study materials, personalized plans, community engagement" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Study
                isAddSubjectModal={isAddSubjectModal}
                setIsAddSubjectModal={setIsAddSubjectModal}
                setIsSidebarOpen={setIsSidebarOpen}
                setPlanModal={setPlanModal}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                subjects={subjects}
                setSubjects={setSubjects}
                isStudy={isStudy}
                setIsStudy={setIsStudy}
                events={plans}
                setEvents={setPlans}
                reset={reset}
                myGroups={myGroups}
                setResponse={setResponse}
                bringSubjects={bringSubjects}
                isChatModal={isChatModal}
                setIsChatModal={setIsChatModal}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
                musicFiles={musicFiles}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/planner"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Planner - FLOZABLE</title>
                  <meta name="title" content="Planner - FLOZABLE" />
                  <meta name="description" content="Organize your study schedule and set goals with the FLOZABLE Planner. Stay on track, manage your time effectively, and achieve your academic milestones." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/planner" />
                  <meta property="og:title" content="Planner - FLOZABLE" />
                  <meta property="og:description" content="Organize your study schedule and set goals with the FLOZABLE Planner. Stay on track, manage your time effectively, and achieve your academic milestones." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/planner" />
                  <meta property="twitter:title" content="Planner - FLOZABLE" />
                  <meta property="twitter:description" content="Organize your study schedule and set goals with the FLOZABLE Planner. Stay on track, manage your time effectively, and achieve your academic milestones." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="study planner, goal setting, time management, academic milestones" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <Planner
                planModal={planModal}
                setIsAddSubjectModal={setIsAddSubjectModal}
                setPlanModal={setPlanModal}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                subjects={subjects}
                setSubjects={setSubjects}
                userInfo={userInfo}
                events={plans}
                setEvents={setPlans}
                reset={reset}
                setResponse={setResponse}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/account"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Account - FLOZABLE</title>
                  <meta name="title" content="Account - FLOZABLE" />
                  <meta name="description" content="Manage your FLOZABLE account settings. Explore options for personalization, security, and other account-related features to enhance your experience." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/account" />
                  <meta property="og:title" content="Account - FLOZABLE" />
                  <meta property="og:description" content="Manage your FLOZABLE account settings. Explore options for personalization, security, and other account-related features to enhance your experience." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/account" />
                  <meta property="twitter:title" content="Account - FLOZABLE" />
                  <meta property="twitter:description" content="Manage your FLOZABLE account settings. Explore options for personalization, security, and other account-related features to enhance your experience." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="account settings, user profile, customization" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <Account
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                subjects={subjects}
                setSubjects={setSubjects}
                userInfo={userInfo}
                setResponse={setResponse}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/user/*"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>User Profile - FLOZABLE</title>
                  <meta name="title" content="User Profile - FLOZABLE" />
                  <meta name="description" content="Explore the user profile on FLOZABLE. View achievements, study habits, and connect with other users. Join the community and stay motivated on your academic journey." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/user" />
                  <meta property="og:title" content="User Profile - FLOZABLE" />
                  <meta property="og:description" content="Explore the user profile on FLOZABLE. View achievements, study habits, and connect with other users. Join the community and stay motivated on your academic journey." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/user" />
                  <meta property="twitter:title" content="User Profile - FLOZABLE" />
                  <meta property="twitter:description" content="Explore the user profile on FLOZABLE. View achievements, study habits, and connect with other users. Join the community and stay motivated on your academic journey." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="user profile, achievements, study habits, community, academic journey" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <User
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                groups={groups}
                setResponse={setResponse}
                setOtherGroups={setOtherGroups}
                setMyGroups={setMyGroups}
                myGroups={myGroups}
                myInfo={userInfo}
                setIsChatModal={setIsChatModal}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/challenge/*"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Challenge - FLOZABLE</title>
                  <meta name="title" content="Challenge - FLOZABLE" />
                  <meta name="description" content="Participate in educational challenges on FLOZABLE. Explore specific academic tasks, set goals, and track your progress as you compete and collaborate with other users." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/challenge" />
                  <meta property="og:title" content="Challenge - FLOZABLE" />
                  <meta property="og:description" content="Participate in educational challenges on FLOZABLE. Explore specific academic tasks, set goals, and track your progress as you compete and collaborate with other users." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/challenge" />
                  <meta property="twitter:title" content="Challenge - FLOZABLE" />
                  <meta property="twitter:description" content="Participate in educational challenges on FLOZABLE. Explore specific academic tasks, set goals, and track your progress as you compete and collaborate with other users." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="educational challenges, academic tasks, goal setting, user collaboration" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <Challenge
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                reset={reset}
                subjects={subjects}
                setResponse={setResponse}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/friends"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Friends - FLOZABLE</title>
                  <meta name="title" content="Friends - FLOZABLE" />
                  <meta name="description" content="Connect with friends on FLOZABLE. Build a network of study buddies, share achievements, and enjoy a collaborative learning atmosphere with your peers." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/friends" />
                  <meta property="og:title" content="Friends - FLOZABLE" />
                  <meta property="og:description" content="Connect with friends on FLOZABLE. Build a network of study buddies, share achievements, and enjoy a collaborative learning atmosphere with your peers." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/friends" />
                  <meta property="twitter:title" content="Friends - FLOZABLE" />
                  <meta property="twitter:description" content="Connect with friends on FLOZABLE. Build a network of study buddies, share achievements, and enjoy a collaborative learning atmosphere with your peers." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="connect with friends, study buddies, collaborative learning" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <Friends
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                notifications={notifications}
                setNotifications={setNotifications}
                setResponse={setResponse}
                reset={reset}
                otherGroups={otherGroups}
                setOtherGroups={setOtherGroups}
                myGroups={myGroups}
                setMyGroups={setMyGroups}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/themes"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Themes - FLOZABLE</title>
                  <meta name="title" content="Themes - FLOZABLE" />
                  <meta name="description" content="Explore different themes on FLOZABLE. Enhance your study environment by choosing themes that match your preferences. Stay focused and motivated with a personalized study experience." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/themes" />
                  <meta property="og:title" content="Themes - FLOZABLE" />
                  <meta property="og:description" content="Explore different themes on FLOZABLE. Enhance your study environment by choosing themes that match your preferences. Stay focused and motivated with a personalized study experience." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/themes" />
                  <meta property="twitter:title" content="Themes - FLOZABLE" />
                  <meta property="twitter:description" content="Explore different themes on FLOZABLE. Enhance your study environment by choosing themes that match your preferences. Stay focused and motivated with a personalized study experience." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="themes, study environment, focus, motivation, personalized study" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <Themes
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                setResponse={setResponse}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/challenges"
          element={
            <div>
              <HelmetProvider>
                <Helmet>
                  <title>Challenges - FLOZABLE</title>
                  <meta name="title" content="Challenges - FLOZABLE" />
                  <meta name="description" content="Join study challenges on FLOZABLE. Set goals, compete with others, and achieve new milestones in your academic journey. Stay motivated and track your progress with exciting challenges." />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://flozable.com/challenges" />
                  <meta property="og:title" content="Challenges - FLOZABLE" />
                  <meta property="og:description" content="Join study challenges on FLOZABLE. Set goals, compete with others, and achieve new milestones in your academic journey. Stay motivated and track your progress with exciting challenges." />
                  <meta property="og:image" content="https://flozable.com/favicon.ico" />

                  <meta property="twitter:card" content="summary_large_image" />
                  <meta property="twitter:url" content="https://flozable.com/challenges" />
                  <meta property="twitter:title" content="Challenges - FLOZABLE" />
                  <meta property="twitter:description" content="Join study challenges on FLOZABLE. Set goals, compete with others, and achieve new milestones in your academic journey. Stay motivated and track your progress with exciting challenges." />
                  <meta property="twitter:image" content="https://flozable.com/favicon.ico" />

                  <meta name="keywords" content="challenges, study goals, competition, milestones, academic journey, motivation" />
                  <meta name="robots" content="index, follow" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="language" content="English" />

                </Helmet>
              </HelmetProvider>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
              />
              <ChallengeRooms
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                setResponse={setResponse}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <div>
              <NotFound />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;