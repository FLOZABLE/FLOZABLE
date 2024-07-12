"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import config from "./config";
import { filterGroups } from "./Tool";
import { socket } from "./socket";
import { timelineSort } from "./timelineSorting";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEFAULT_PLAN } from "./Constant";
import { useAccount } from "@/Hooks/accountHooks";
import { useSubjects } from "@/Hooks/subjectsHooks";
import { usePlan } from "@/Hooks/planHooks";
import { useGroups } from "@/Hooks/groupsHook";

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

function AppProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AccountProvider>
        <SubjectsProvider>
          <GroupsProvider>
            <ModalsProvider>
              <ResponseProvider>
                <TutorialsProvider>
                  <CallOptionsProvider>
                    <ThemesProvider>
                      <WorkersProvider>
                        <GoogleOAuthProvider clientId={googleClientId}>
                          {children}
                        </GoogleOAuthProvider>
                      </WorkersProvider>
                    </ThemesProvider>
                  </CallOptionsProvider>
                </TutorialsProvider>
              </ResponseProvider>
            </ModalsProvider>
          </GroupsProvider>
        </SubjectsProvider>
      </AccountProvider>
    </QueryClientProvider>
  );
}

function AccountProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const { data: useAccountData, refetch: refetchUseAccountData } = useAccount();

  useEffect(() => {
    if (useAccountData?.code === 401) {
      setUserInfo(false);
      return;
    }

    if (!useAccountData?.success) return;

    setUserInfo(useAccountData.userInfo);
    setNotifications(useAccountData.notifications);
    setTimeout(() => {
      socket.connect();
      socket.emit("joinChats");
    }, 100);
  }, [useAccountData]);

  useEffect(() => {
    const onNotification = (data) => {
      setNotifications((prev) => [...prev, data]);
    };

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, []);

  return (
    <UserInfoContext.Provider
      value={{ userInfo, setUserInfo, refetchUseAccountData }}
    >
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
  const [planModal, setPlanModal] = useState(DEFAULT_PLAN);

  const { data: subjectsData, refetch: refetchSubjectsData } =
    useSubjects(userInfo);
  const { data: planData, refetch: refetchPlan } = usePlan(userInfo);

  useEffect(() => {
    if (!subjectsData?.success) return;

    setSubjects(timelineSort(subjectsData.subjects));
  }, [subjectsData]);

  useEffect(() => {
    if (!planData?.success) return;

    setPlans(
      JSON.parse(JSON.stringify(planData.plans)).map((plan) => {
        plan.saved = true;
        plan.start = new Date(plan.start * 1000 * 60);
        plan.end = new Date(plan.end * 1000 * 60);
        const subject = subjects.find(
          (subject) => subject.subject_id === plan.subject_id
        );
        console.log(subject, 'gd')
        if (subject) {
          plan.backgroundColor = subject.color;
          plan.borderColor = subject.color;
          plan.color = subject.color;
          plan.icon = subject.icon;
        } else {
          plan.backgroundColor = "#fff";
          plan.borderColor = "#fff";
          plan.color = "#fff";
        }

        if (plan.completed) {
          plan.className = "completed";
        }
        return plan;
      })
    );
  }, [subjects, planData]);

  useEffect(() => {
    if (!subjects.length) return;

    setPlanModal((prev) => ({ ...prev, subject_id: subjects[0].subject_id }));
  }, [subjects]);

  return (
    <SubjectsContext.Provider
      value={{ subjects, setSubjects, refetchSubjectsData }}
    >
      <PlansContext.Provider
        value={{ plans, setPlans, planModal, setPlanModal, refetchPlan }}
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

  const { data: useGroupsData, refetch: refetchUseGroupsData } = useGroups();

  useEffect(() => {
    if (!groups.length) return;

    if (userInfo === false) {
      return setOtherGroups(groups);
    }

    if (!userInfo) return;
    const { userGroups, otherGroups } = filterGroups(userInfo, groups);
    setMyGroups(userGroups);
    setOtherGroups(otherGroups);
  }, [userInfo, groups]);

  useEffect(() => {
    if (!useGroupsData?.success) return;

    setGroups(useGroupsData.groups);
  }, [useGroupsData]);

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
    totalNewMsg: 0,
  });

  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [joinGroupModal, setJoinGroupModal] = useState({
    open: false,
    group: null,
  });
  const [isAccountModal, setIsAccountModal] = useState(false);
  const [isSubjectsModal, setIsSubjectsModal] = useState(false);
  const [isSharePlanModal, setIsSharePlanModal] = useState(false);

  useEffect(() => {
    if (userInfo === false) {
      setIsAccountModal(true);
    }
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
        setIsAccountModal,
        isSubjectsModal,
        setIsSubjectsModal,
        isSharePlanModal,
        setIsSharePlanModal,
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

  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const tutorial = searchParams.get("tutorial");

    if (tutorial) {
      setTutorial(1);
    }
  }, []);

  return (
    <TutorialsContext.Provider
      value={{
        tutorialBoxRef,
        tutorialTextRef,
        tutorial,
        setTutorial,
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
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          data.themes.map((theme) => {
            theme.likes = theme.likes === "" ? [] : theme.likes.split(",");
          });
          setThemes(data.themes);
        }
      })
      .catch((error) => console.error(error));

    fetch(`${config.server}/themes/user`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const userThemes =
            data.themes.themes === "" ? [] : data.themes.themes.split(",");
          setUserThemes(
            userThemes.map((theme) => {
              const [category, id] = theme.split(":");

              return {
                category,
                id,
              };
            })
          );
        }
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <ThemesContext.Provider
      value={{ themes, setThemes, userThemes, setUserThemes }}
    >
      {children}
    </ThemesContext.Provider>
  );
}

function WorkersProvider({ children }) {
  const membersTimerWorkerRef = useRef(null);
  const subjectsTimerWorkerRef = useRef(null);

  useEffect(() => {
    membersTimerWorkerRef.current = new Worker("/workers/timerWorker.js");
    subjectsTimerWorkerRef.current = new Worker(
      "/workers/subjectTimerWorker.js"
    );
    return () => {
      membersTimerWorkerRef.current?.terminate();
      subjectsTimerWorkerRef.current?.terminate();
    };
  }, []);

  return (
    <WorkersContext.Provider
      value={{ membersTimerWorkerRef, subjectsTimerWorkerRef }}
    >
      {children}
    </WorkersContext.Provider>
  );
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
};
