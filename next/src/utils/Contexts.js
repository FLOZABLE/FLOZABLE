"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { socket } from "./socket";
import { timelineSort } from "./timelineSorting";
import config from "./config";

const AuthContext = createContext({ state: false });
const SubjectsContext = createContext([]);
const PlansContext = createContext([]);
const UserInfoContext = createContext({});
const NotificationsContext = createContext([]);
const TutorialsContext = createContext({});

function AppProvider({ children }) {
  return (
    <AccountProvider>
      <SubjectsProvider>
        {children}
      </SubjectsProvider>
    </AccountProvider>
  )
};

function AccountProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const bringAccountInfo = useCallback(() => {
    fetch(`${config.server}/account/accountinfo`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
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

  useEffect(() => {
    bringAccountInfo();
  }, []);

  return (
    <UserInfoContext.Provider value={{ userInfo, setUserInfo }}>
      <NotificationsContext.Provider value={{ notifications, setNotifications }}>
        {children}
      </NotificationsContext.Provider>
    </UserInfoContext.Provider>
  )
};

function SubjectsProvider({ children }) {
  const { userInfo } = useContext(UserInfoContext);
  const [subjects, setSubjects] = useState([]);
  const [plans, setPlans] = useState([]);

  const bringSubjects = useCallback(() => {
    fetch(`${config.server}/study/bring-subjects`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubjects(timelineSort(data.subjects));
          bringPlans(data.subjects);
        } else {
          bringPlans([]);
        };
      })
      .catch((error) => console.error(error));
  }, []);

  const bringPlans = useCallback((subjects) => {
    fetch(`${config.server}/plan`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
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

  useEffect(() => {
    if (userInfo) {
      bringSubjects();
    }
  }, [userInfo]);

  return (
    <SubjectsContext.Provider value={{ subjects, setSubjects }}>
      <PlansContext.Provider value={{ plans, setPlans }}>
        {children}
      </PlansContext.Provider>
    </SubjectsContext.Provider>
  )
};

/* function tutorialsProvider({children}) {
  const [tutorialBoxRef, setTutorialBoxRef] = useState(nu)
  return (
    <TutorialsContext.Provider>
      {children}
    </TutorialsContext.Provider>
  )
} */


export { AppProvider, AuthContext, UserInfoContext, NotificationsContext, SubjectsContext };