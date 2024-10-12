"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import { timelineSort } from "./timelineSorting";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEFAULT_PLAN } from "./Constant";
import { useAccount } from "@/Hooks/accountHooks";
import { useSubjects } from "@/Hooks/subjectsHooks";
import { usePlans } from "@/Hooks/plansHooks";
import { useGroups } from "@/Hooks/groupsHook";
import { useThemes, useThemesUser } from "@/Hooks/themesHooks";
import { usePathname } from "next/navigation";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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

  const queryResult = useAccount();

  const { useAccountData, accountRefetch } = queryResult;

  useEffect(() => {
    if (useAccountData?.success === false) {
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
      value={{
        ...queryResult,
        accountRefetch,
        userInfo,
        setUserInfo,
      }}
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
  const [subjects, setSubjects] = useState([]);
  const [groupedSubjects, setGroupedSubjects] = useState({});
  const [plans, setPlans] = useState([]);
  const [planModal, setPlanModal] = useState(DEFAULT_PLAN);

  const queryResult = useSubjects();
  const { data: planData, refetch: refetchPlan } = usePlans();

  const { useSubjectsData } = queryResult;

  useEffect(() => {
    if (!useSubjectsData?.success) return;

    const { subjects, groupedSubjects } = timelineSort(
      useSubjectsData.subjects
    );

    setSubjects(subjects);
    setGroupedSubjects(groupedSubjects);
  }, [useSubjectsData]);

  useEffect(() => {
    if (!planData?.success || !useSubjectsData?.success) return;

    const subjects = useSubjectsData.subjects;

    setPlans(
      JSON.parse(JSON.stringify(planData.plans)).map((plan) => {
        plan.saved = true;
        plan.start = new Date(plan.start * 1000);
        plan.end = new Date(plan.end * 1000);
        const subject = subjects.find(
          (subject) => subject.subject_id === plan.subject_id
        );
        if (subject) {
          plan.backgroundColor = subject.color;
          plan.borderColor = subject.color;
          //lan.subject_color = subject.color;
          //plan.color = subject.color;
          //plan.textColor = subject.color;
        } else {
          plan.backgroundColor = "#000";
          plan.borderColor = "#000";
          //plan.color = "#000";
        }

        if (plan.completed) {
          plan.className = "completed";
        }
        return plan;
      })
    );
  }, [useSubjectsData, planData]);

  const pathname = usePathname();

  useEffect(() => {
    setPlanModal(DEFAULT_PLAN);
  }, [pathname]);

  return (
    <SubjectsContext.Provider
      value={{
        ...queryResult,
        subjects,
        setSubjects,
        groupedSubjects,
        setGroupedSubjects,
      }}
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

  const { data: useGroupsData, refetch: refetchUseGroupsData } = useGroups();

  useEffect(() => {
    if (!groups.length || !userInfo) return;

    const myGroups = groups.filter((group) =>
      group.members.includes(userInfo.user_id)
    );
    setMyGroups(myGroups);
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
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

function ResponseProvider({ children }) {
  const [response, setResponse] = useState(null);
  const { setIsAccountModal } = useContext(ModalsContext);

  useEffect(() => {
    if (response?.action === "signin") {
      setIsAccountModal(true);
    }
  }, [response]);

  return (
    <ResponseContext.Provider value={{ response, setResponse }}>
      {children}
    </ResponseContext.Provider>
  );
}

function ModalsProvider({ children }) {
  const { userInfo } = useContext(UserInfoContext);

  const [chatModal, setChatModal] = useState({
    chatroom: null,
    name: "",
    opened: false,
    totalNewMsg: 0,
  });

  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [joinGroupModal, setJoinGroupModal] = useState({
    open: false,
    group: null,
  });
  const [isAccountModal, setIsAccountModal] = useState(false);
  const [isSubjectsModal, setIsSubjectsModal] = useState({
    opened: false,
    subject_id: null,
  });
  const [editGroupModal, setEditGroupModal] = useState({
    opened: false,
    group_id: null,
  });
  const [searchUsersModal, setSearchUsersModal] = useState({
    opened: false,
    onClick: null,
  });

  useEffect(() => {
    if (userInfo === false) {
      setIsAccountModal(true);
    } else {
      setIsAccountModal(false);
    }
  }, [userInfo]);

  const pathname = usePathname();

  useEffect(() => {
    console.log("Page changed to:", pathname);
    //modal default
    setChatModal({
      chatroom: null,
      name: "",
      opened: false,
      totalNewMsg: 0,
    });
    setIsNotificationModal(false);
    setIsAddSubjectModal(false);
    setJoinGroupModal({
      open: false,
      group: null,
    });
    setIsAccountModal(false);
    setIsSubjectsModal({
      opened: false,
      subject_id: null,
    });
    setEditGroupModal({
      opened: false,
      group_id: null,
    });
    setSearchUsersModal({
      opened: false,
      onClick: null,
    });
  }, [pathname]);

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
        searchUsersModal,
        setSearchUsersModal,
        editGroupModal,
        setEditGroupModal,
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

  const { useThemesData } = useThemes();
  const { useThemesUserData } = useThemesUser();

  useEffect(() => {
    if (!useThemesData?.success) return;

    setThemes(useThemesData.themes);
  }, [useThemesData]);

  useEffect(() => {
    if (!useThemesUserData?.success) return;

    setUserThemes(useThemesUserData.themes);
  }, [useThemesUserData]);

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

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("scope is: ", registration.scope);
        });
    }

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
