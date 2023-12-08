import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
import Footer from "./components/UI/Footer/Footer";
import Planner from "./components/Container/Planner/Planner";
import { socket } from "./socket";
import {
  setGroupMembers,
  getMyGroups,
  getLikedGroups,
} from "./components/Container/Groups/GroupsTool";
import { timelineSort } from "./utils/timelineSorting";
import EventModal from "./components/UI/EventModal/EventModal";
import AddSubjectModal from "./components/UI/AddSubjectModal/AddSubjectModal";
import User from "./components/Container/User/User";
import TopNotification from "./components/UI/TopNotification/TopNotification";
import NotificationModal from "./components/UI/NotificationModal/NotificationModal";
import ChatsModal from "./components/UI/ChatsModal/ChatsModal";
import Friends from "./components/Container/Friends/Friends";
import { filterGroups } from "../src/utils/Tool";

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
  const [isAddPlanModal, setIsAddPlanModal] = useState(false);

  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [isNotificationModal, setIsNotificationModal] = useState(false);

  const [subject, setSubject] = useState("0000000000");

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

    return () => {
      socket.off("joinMyGroups", socketConnectAction);
      socket.off("reset", socketResetAction);
      socket.off("notification", onNotification);
    };
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const bringSubjects = useCallback(() => {
    fetch(`${serverOrigin}/api/study/bring-subjects`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubjects(timelineSort(data.subjects));
          //setSubjects(sortSubjects(data.subjects));
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const bringAccountInfo = useCallback(() => {
    fetch(`${serverOrigin}/api/account/accountinfo`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUserInfo(data.userInfo);
          setNotifications(data.notifications);
          socket.connect();
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const bringPlans = useCallback(() => {
    fetch(`${serverOrigin}/api/plan/bring-plans`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPlans(
            data.plans.map((plan) => {
              plan.saved = true;
              plan.start = new Date(plan.start * 1000 * 60);
              plan.end = new Date(plan.end * 1000 * 60);
              return plan;
            }),
          );
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const bringGroups = useCallback(() => {
    fetch(`${serverOrigin}/api/groups/bring-groups`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
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
    bringPlans();
  }, []);

  useEffect(() => {
    if (userInfo) {
      bringGroups();
    }
  }, [userInfo]);

  return (
    <Router>
      <TopNotification
        duration={2500}
        response={response}
      />
      <NotificationModal
        setIsNotificationModal={setIsNotificationModal}
        isNotificationModal={isNotificationModal}
        notifications={notifications}
        setNotifications={setNotifications}
        setResponse={setResponse}
      />
      <AddSubjectModal
        setIsAddSubjectModal={setIsAddSubjectModal}
        isAddSubjectModal={isAddSubjectModal}
        setAddSubjectResponse={setResponse}
        subjects={subjects}
        setSubjects={setSubjects}
        setSubject={setSubject}
      />
      <ChatsModal
        setIsChatModal={setIsChatModal}
        isChatModal={isChatModal}
        socket={socket}
        userInfo={userInfo}
        myGroups={myGroups}
      />
      <EventModal
        isAddPlanModal={isAddPlanModal}
        subjects={subjects}
        setIsAddPlanModal={setIsAddPlanModal}
        setEvents={setPlans}
        events={plans}
        setIsAddSubjectModal={setIsAddSubjectModal}
        setResponse={setResponse}
      />
      <Routes>
        <Route
          path="/dashboard"
          element={
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />

              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
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
                setIsAddPlanModal={setIsAddPlanModal}
              />
              <Footer />
            </div>
          }
        />
        <Route
          path="/dashboard/stats"
          element={
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />

              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
              />
              <Stats
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                reset={reset}
                subjects={subjects}
                setResponse={setResponse}
              />
              <Footer />
            </div>
          }
        />
        <Route
          path="/dashboard/ranking"
          element={
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />
              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
              />
              <Ranking
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                reset={reset}
                setResponse={setResponse}
              />
              <Footer />
            </div>
          }
        />
        <Route
          path="/dashboard/groups"
          element={
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />
              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
              />
              <Groups
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                socket={socket}
                subjects={subjects}
                reset={reset}
                otherGroups={otherGroups}
                setOtherGroups={setOtherGroups}
                myGroups={myGroups}
                setMyGroups={setMyGroups}
                likedGroups={likedGroups}
                setLikedGroups={setLikedGroups}
                setResponse={setResponse}
              />
              <Footer />
            </div>
          }
        />
        <Route
          path="/dashboard/study"
          element={
            <div>
              <Study
                isAddSubjectModal={isAddSubjectModal}
                setIsAddSubjectModal={setIsAddSubjectModal}
                setIsSidebarOpen={setIsSidebarOpen}
                setIsAddPlanModal={setIsAddPlanModal}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                socket={socket}
                subjects={subjects}
                setSubjects={setSubjects}
                isStudy={isStudy}
                setIsStudy={setIsStudy}
                events={plans}
                setEvents={setPlans}
                reset={reset}
                myGroups={myGroups}
                setResponse={setResponse}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/planner"
          element={
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />
              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
              />
              <Planner
                isAddPlanModal={isAddPlanModal}
                setIsAddSubjectModal={setIsAddSubjectModal}
                setIsAddPlanModal={setIsAddPlanModal}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                subjects={subjects}
                setSubjects={setSubjects}
                userInfo={userInfo}
                socket={socket}
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
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />
              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
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
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />
              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
              />
              <User
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                userInfo={userInfo}
                groups={groups}
                setResponse={setResponse}
                socket={socket}
              />
            </div>
          }
        />
        <Route
          path="/dashboard/challenge/*"
          element={
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />
              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
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
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isSidebarHovered={isHovered}
              />
              <Header
                setIsAddPlanModal={setIsAddPlanModal}
                isAddPlanModal={isAddPlanModal}
                setPlans={setPlans}
                plans={plans}
                subjects={subjects}
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                isSidebarHovered={isHovered}
                setIsChatModal={setIsChatModal}
                isChatModal={isChatModal}
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
      </Routes>
    </Router>
  );
}

export default App;