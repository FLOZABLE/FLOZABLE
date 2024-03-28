"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { socket } from "./socket";
import { timelineSort } from "./timelineSorting";
import config from "./config";
import { filterGroups } from "./Tool";
import { useSearchParams } from "next/navigation";

const AuthContext = createContext({});
const SubjectsContext = createContext({});
const PlansContext = createContext({});
const UserInfoContext = createContext({});
const NotificationsContext = createContext({});
const TutorialsContext = createContext({});
const ResponseContext = createContext({});
const GroupsContext = createContext({});
const ModalsContext = createContext({});

function AppProvider({ children }) {
  return (
    <AccountProvider>
      <SubjectsProvider>
        <GroupsProvider>
          <ModalsProvider>
            <ResponseProvider>
              <TutorialsProvider>
                {children}
              </TutorialsProvider>
            </ResponseProvider>
          </ModalsProvider>
        </GroupsProvider>
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

  useEffect(() => {
    if (!subjects.length) return;

    setPlanModal((prev) => ({...prev, subject: subjects[0].id}))
  }, [subjects])

  return (
    <SubjectsContext.Provider value={{ subjects, setSubjects }}>
      <PlansContext.Provider value={{ plans, setPlans, planModal, setPlanModal }}>
        {children}
      </PlansContext.Provider>
    </SubjectsContext.Provider>
  )
};

function GroupsProvider({ children }) {
  const { userInfo } = useContext(UserInfoContext);

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);

  const bringGroups = useCallback(() => {
    fetch(`${config.server}/groups/bring-groups`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setGroups(data.groups);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    bringGroups();
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    console.log('gdddddd', userInfo)
    const { userGroups, otherGroups } = filterGroups(userInfo, groups);
    setMyGroups(userGroups);
    setOtherGroups(otherGroups);
  }, [userInfo, groups]);

  return (
    <GroupsContext.Provider value={{ groups, setGroups, myGroups, setMyGroups, otherGroups, setOtherGroups }}>
      {children}
    </GroupsContext.Provider>
  );
}

function ResponseProvider({ children }) {
  const [response, setResponse] = useState({});

  return (
    <ResponseContext.Provider value={{ response, setResponse }}>
      {children}
    </ResponseContext.Provider>
  )
};

function ModalsProvider({ children }) {
  const [isChatModal, setIsChatModal] = useState(false);
  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);

  return (
    <ModalsContext.Provider value={{ isChatModal, setIsChatModal, isNotificationModal, setIsNotificationModal, isAddSubjectModal, setIsAddSubjectModal }}>
      {children}
    </ModalsContext.Provider>
  )
}

function TutorialsProvider({ children }) {
  const [tutorialBoxRef, setTutorialBoxRef] = useState(null);
  const [tutorialTextRef, setTutorialTextRef] = useState(null);
  //const [searchParams, setSearchParams] = useSearchParams();

  /* useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    console.log(tutorial, 'gddddddddddddd')
  }, [searchParams]); */

  return (
    <TutorialsContext.Provider value={{ tutorialBoxRef, setTutorialBoxRef, tutorialTextRef, setTutorialTextRef }}>
      {children}
    </TutorialsContext.Provider>
  )
};


export { AppProvider, AuthContext, UserInfoContext, NotificationsContext, SubjectsContext, PlansContext, GroupsContext, ResponseContext, ModalsContext, TutorialsContext };