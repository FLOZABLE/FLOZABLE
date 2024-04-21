"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import config from "./config";
import { filterGroups } from "./Tool";
import { socket } from "./socket";
import { timelineSort } from "./timelineSorting";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const AuthContext = createContext({});
const SubjectsContext = createContext({});
const PlansContext = createContext({});
const UserInfoContext = createContext({});
const NotificationsContext = createContext({});
const TutorialsContext = createContext({});
const ResponseContext = createContext({});
const GroupsContext = createContext({});
const ModalsContext = createContext({});
const CallOptionsContext = createContext({});
const ThemesContext = createContext({});
const WorkersContext = createContext({});
const ChatsContext = createContext({});

function AppProvider({ children }) {
  return (
    <AccountProvider>
      <SubjectsProvider>
        <GroupsProvider>
          <ModalsProvider>
            <ResponseProvider>
              <TutorialsProvider>
                <CallOptionsProvider>
                  <ThemesProvider>
                    <WorkersProvider>
                      <ChatsProvider>
                        <GoogleOAuthProvider
                          clientId={googleClientId}
                        >
                          {children}
                        </GoogleOAuthProvider>
                      </ChatsProvider>
                    </WorkersProvider>
                  </ThemesProvider>
                </CallOptionsProvider>
              </TutorialsProvider>
            </ResponseProvider>
          </ModalsProvider>
        </GroupsProvider>
      </SubjectsProvider>
    </AccountProvider>
  );
}

function AccountProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const bringAccountInfo = useCallback(() => {
    fetch(`${config.server}/account/accountinfo`, { method: "get", credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUserInfo(data.userInfo);
          setNotifications(data.notifications);
          setTimeout(() => {
            socket.connect();
            socket.emit('joinChats');
          }, 100);
        } else if (data.code === 401) {
          console.log("not user");
          setUserInfo(false);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    bringAccountInfo();

    const onNotification = (data) => {
      setNotifications((prev) => [...prev, data]);
    }

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, []);

  return (
    <UserInfoContext.Provider value={{ userInfo, setUserInfo, bringAccountInfo }}>
      <NotificationsContext.Provider
        value={{ notifications, setNotifications }}
      >
        {children}
      </NotificationsContext.Provider>
    </UserInfoContext.Provider>
  );
}

function SubjectsProvider({ children }) {
  const { userInfo } = useContext(UserInfoContext);
  const [subjects, setSubjects] = useState([]);
  const [plans, setPlans] = useState([]);
  const [planModal, setPlanModal] = useState({
    opened: false,
    title: "",
    description: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 1000 * 30),
    repeat: 0,
    priority: 50,
    notification: -1,
    subject: null,
    id: null,
    saved: false,
    completed: false,
    type: "local",
    editable: true,
  });

  const bringSubjects = useCallback(() => {
    fetch(`${config.server}/study/bring-subjects`, { method: "post", credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubjects(timelineSort(data.subjects));
          bringPlans(data.subjects);
        } else {
          bringPlans([]);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const bringPlans = useCallback((subjects) => {
    fetch(`${config.server}/plan`, { method: "get", credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPlans(
            data.plans.map((plan) => {
              plan.saved = true;
              plan.start = new Date(plan.start * 1000 * 60);
              plan.end = new Date(plan.end * 1000 * 60);
              const subject = subjects.find(
                (subject) => subject.id === plan.subject,
              );
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

    setPlanModal((prev) => ({ ...prev, subject: subjects[0].id }));
  }, [subjects]);

  return (
    <SubjectsContext.Provider value={{ subjects, setSubjects }}>
      <PlansContext.Provider
        value={{ plans, setPlans, planModal, setPlanModal }}
      >
        {children}
      </PlansContext.Provider>
    </SubjectsContext.Provider>
  );
}

function GroupsProvider({ children }) {
  const { userInfo } = useContext(UserInfoContext);

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [otherGroups, setOtherGroups] = useState([]);

  const bringGroups = useCallback(() => {
    fetch(`${config.server}/groups/bring-groups`, { method: "post", credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setGroups(data.groups);
          setOtherGroups(data.groups);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    bringGroups();
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    const { userGroups, otherGroups } = filterGroups(userInfo, groups);
    setMyGroups(userGroups);
    setOtherGroups(otherGroups);
  }, [userInfo, groups]);

  return (
    <GroupsContext.Provider
      value={{
        groups,
        setGroups,
        myGroups,
        setMyGroups,
        otherGroups,
        setOtherGroups,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

function ResponseProvider({ children }) {
  const [response, setResponse] = useState(null);

  return (
    <ResponseContext.Provider value={{ response, setResponse }}>
      {children}
    </ResponseContext.Provider>
  );
}

function ModalsProvider({ children }) {
  const { userInfo } = useContext(UserInfoContext);

  const [chatModal, setChatModal] = useState({
    chatRoom: null,
    open: false,
    totalNewMsg: 0
  });

  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [joinGroupModal, setJoinGroupModal] = useState({
    open: false,
    group: null,
  });
  const [isAccountModal, setIsAccountModal] = useState(false);

  useEffect(() => {
    if (userInfo === false) {
      setIsAccountModal(true);
    };
  }, [userInfo]);

  return (
    <ModalsContext.Provider
      value={{
        chatModal,
        setChatModal,
        isNotificationModal,
        setIsNotificationModal,
        isAddSubjectModal,
        setIsAddSubjectModal,
        joinGroupModal,
        setJoinGroupModal,
        isAccountModal,
        setIsAccountModal
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
}

function TutorialsProvider({ children }) {
  const tutorialBoxRef = useRef(null);
  const tutorialTextRef = useRef(null);

  const [tutorial, setTutorial] = useState(false);

  return (
    <TutorialsContext.Provider
      value={{
        tutorialBoxRef,
        tutorialTextRef,
        tutorial,
        setTutorial
      }}
    >
      {children}
    </TutorialsContext.Provider>
  );
}

function CallOptionsProvider({ children }) {
  const [isCam, setIsCam] = useState(false);
  const [isMic, setIsMic] = useState(false);
  const [isHeadphone, setIsHeadphone] = useState(false);

  return (
    <CallOptionsContext.Provider
      value={{ isCam, setIsCam, isMic, setIsMic, isHeadphone, setIsHeadphone }}
    >
      {children}
    </CallOptionsContext.Provider>
  );
}

function ThemesProvider({ children }) {
  const [themes, setThemes] = useState([]);
  const [userThemes, setUserThemes] = useState([]);

  useEffect(() => {
    fetch(`${config.server}/themes`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          data.themes.map(theme => {
            theme.likes = theme.likes === "" ? [] : theme.likes.split(",");
          })
          setThemes(data.themes);
        };
      })
      .catch((error) => console.error(error));


    fetch(`${config.server}/themes/user`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      }
      , credentials: "include"
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const userThemes = data.themes.themes === "" ? [] : data.themes.themes.split(",");
          setUserThemes(userThemes.map(theme => {
            const [category, id] = theme.split(":");

            return {
              category,
              id
            }
          }));
        };
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <ThemesContext.Provider value={{ themes, setThemes, userThemes, setUserThemes }}>
      {children}
    </ThemesContext.Provider>
  )
};

function WorkersProvider({ children }) {
  const membersTimerWorkerRef = useRef(null);
  const subjectsTimerWorkerRef = useRef(null);

  useEffect(() => {
    membersTimerWorkerRef.current = new Worker('/timerWorker.js');
    subjectsTimerWorkerRef.current = new Worker('/subjectTimerWorker.js');
    return () => {
      membersTimerWorkerRef.current?.terminate();
      subjectsTimerWorkerRef.current?.terminate();
    };
  }, []);

  return (
    <WorkersContext.Provider value={{ membersTimerWorkerRef, subjectsTimerWorkerRef }}>
      {children}
    </WorkersContext.Provider>
  )
};

function ChatsProvider({ children }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [chatModal, setCHatModal] = useState({
    open: false,
    chatRoom: false
  });
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    fetch(`${config.server}/chat/bring-rooms`, { method: "post", credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setChatRooms(data.rooms);
          setReadStatus(data.readStatus);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <ChatsContext.Provider value={
      {
        chatRooms,
        setChatRooms,
        chatModal,
        setCHatModal,
        readStatus,
        setReadStatus
      }
    }>
      {children}
    </ChatsContext.Provider>
  )
}

export {
  AppProvider,
  AuthContext,
  UserInfoContext,
  NotificationsContext,
  SubjectsContext,
  PlansContext,
  GroupsContext,
  ResponseContext,
  ModalsContext,
  TutorialsContext,
  CallOptionsContext,
  ThemesContext,
  WorkersContext,
  ChatsContext
};