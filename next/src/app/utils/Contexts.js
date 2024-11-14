"use client";

import { createContext, useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEFAULT_PLAN } from "./Constant";
import { useAccount } from "@/Hooks/accountHooks";
import { usePlans, usePlansGoogle } from "@/Hooks/plansHooks";
import { useGroups } from "@/Hooks/groupsHook";
import { useThemes, useThemesUser } from "@/Hooks/themesHooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { mediaSocket } from "./mediaSocket";
import { toast } from "react-toastify";
import { useNotifications } from "@/Hooks/notificationsHooks";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const PlanModalContext = createContext({});
const PlansContext = createContext({});
const TutorialsContext = createContext({});
const GroupsContext = createContext({});
const CallOptionsContext = createContext({});
const ThemesContext = createContext({});
const WorkersContext = createContext({});

//modals

const AccountModalContext = createContext({});
const JoinGroupModalContext = createContext({});
const EditGroupModalContext = createContext({});
const SubjectsModalContext = createContext({});
const AddSubjectsModalContext = createContext({});
const ChatModalContext = createContext({});
const SearchUsersModalContext = createContext({});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failiureCount, err) => {
        console.log(err?.response?.status, "err");
        if (err?.response?.status) {
          const retryableStatusCodes = [500, 502, 503, 504, 408];
          return retryableStatusCodes.includes(err.response.status);
        }

        // Retry if it's a network error (e.g., ECONNABORTED)
        return err.message === "Network Error" || err.code === "ECONNABORTED";
      },
      retryDelay: (retryCount) => {
        return Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, etc.
      },
    },
  },
});

function AppContainer({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>{children}</AppProvider>
    </QueryClientProvider>
  );
}

function AppProvider({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accountData, isError } = useAccount();
  const { updateNotificationsData } = useNotifications();

  const success = searchParams.get("success");
  const message = searchParams.get("message");

  useEffect(() => {
    if (!message || !success) return;

    if (success === "true") {
      toast.success(message);
    } else {
      toast.error(message);
    }

    // Remove URL params once toast is shown
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("success");
    newSearchParams.delete("message");

    router.replace(`/dashboard?${newSearchParams.toString()}`, {
      scroll: false,
    });
  }, [success, message]);

  useEffect(() => {
    const onNotification = (notification) => {
      updateNotificationsData((prev) => {
        if (!prev?.data?.notifications) return prev;

        const updatedNotifications = [...prev.data.notifications, notification];

        return {
          ...prev,
          data: {
            ...prev.data,
            notifications: updatedNotifications,
          },
        };
      });
      toast.info(notification.message?.title);
    };

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, []);

  useEffect(() => {
    if (!accountData) {
      return;
    }

    if (isError) {
    }

    setTimeout(() => {
      console.log("gddddd");
      socket.connect();
      mediaSocket.connect();
      socket.emit("joinChats");
    }, 100);
  }, [accountData, isError]);

  return (
    <PlansProvider>
      <PlanModalProvider>
        <GroupsProvider>
          <TutorialsProvider>
            <CallOptionsProvider>
              <ThemesProvider>
                <WorkersProvider>
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <AccountModalProvider>
                      <JoinGroupModalProvider>
                        <EditGroupModalProvider>
                          <SubjectsModalProvider>
                            <AddSubjectsModalProvider>
                              <ChatModalProvider>
                                <SearchUsersModalProvider>
                                  {children}
                                </SearchUsersModalProvider>
                              </ChatModalProvider>
                            </AddSubjectsModalProvider>
                          </SubjectsModalProvider>
                        </EditGroupModalProvider>
                      </JoinGroupModalProvider>
                    </AccountModalProvider>
                  </GoogleOAuthProvider>
                </WorkersProvider>
              </ThemesProvider>
            </CallOptionsProvider>
          </TutorialsProvider>
        </GroupsProvider>
      </PlanModalProvider>
    </PlansProvider>
  );
}

function PlansProvider({ children }) {
  const [plans, setPlans] = useState([]);
  const [plansDate, setPlansDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );

  const { plansData } = usePlans();
  const { plansGoogleData } = usePlansGoogle(plansDate);

  useEffect(() => {
    const sortedPlans = [...plansData, ...plansGoogleData].sort(
      (a, b) => a.start - b.start
    );
    if (JSON.stringify(sortedPlans) === JSON.stringify(plans)) return;
    setPlans(sortedPlans);
  }, [plansData, plansGoogleData]);

  return (
    <PlansContext.Provider value={{ plans, setPlans, plansDate, setPlansDate }}>
      {children}
    </PlansContext.Provider>
  );
}

function GroupsProvider({ children }) {
  const { accountData } = useAccount();

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  const groupsQueryResult = useGroups();
  const { groupsData } = groupsQueryResult;

  useEffect(() => {
    if (!groups.length || !accountData) return;

    const myGroups = groups.filter((group) =>
      group.members.includes(accountData.user_id)
    );
    setMyGroups(myGroups);
  }, [accountData, groups]);

  useEffect(() => {
    if (!groupsData?.success) return;

    setGroups(groupsData.data.groups);
  }, [groupsData]);

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

function AccountModalProvider({ children }) {
  const { accountData } = useAccount();

  const [isAccountModal, setIsAccountModal] = useState(false);

  useEffect(() => {
    if (accountData === false) {
      setIsAccountModal(true);
    } else {
      setIsAccountModal(false);
    }
  }, [accountData]);

  const pathname = usePathname();

  useEffect(() => {
    setIsAccountModal(false);
  }, [pathname]);

  return (
    <AccountModalContext.Provider
      value={{
        isAccountModal,
        setIsAccountModal,
      }}
    >
      {children}
    </AccountModalContext.Provider>
  );
}

function JoinGroupModalProvider({ children }) {
  const [joinGroupModal, setJoinGroupModal] = useState({
    open: false,
    group: null,
  });

  const pathname = usePathname();

  useEffect(() => {
    setJoinGroupModal({
      open: false,
      group: null,
    });
  }, [pathname]);

  return (
    <JoinGroupModalContext.Provider
      value={{
        joinGroupModal,
        setJoinGroupModal,
      }}
    >
      {children}
    </JoinGroupModalContext.Provider>
  );
}

function EditGroupModalProvider({ children }) {
  const [editGroupModal, setEditGroupModal] = useState({
    opened: false,
    group_id: null,
  });

  const pathname = usePathname();

  useEffect(() => {
    setEditGroupModal({
      opened: false,
      group_id: null,
    });
  }, [pathname]);

  return (
    <EditGroupModalContext.Provider
      value={{
        editGroupModal,
        setEditGroupModal,
      }}
    >
      {children}
    </EditGroupModalContext.Provider>
  );
}

function SubjectsModalProvider({ children }) {
  const [isSubjectsModal, setIsSubjectsModal] = useState({
    opened: false,
    subject_id: null,
  });

  const pathname = usePathname();

  useEffect(() => {
    setIsSubjectsModal({ opened: false, subject_id: null });
  }, [pathname]);

  return (
    <SubjectsModalContext.Provider
      value={{
        isSubjectsModal,
        setIsSubjectsModal,
      }}
    >
      {children}
    </SubjectsModalContext.Provider>
  );
}

function PlanModalProvider({ children }) {
  const [planModal, setPlanModal] = useState(DEFAULT_PLAN);

  const pathname = usePathname();

  useEffect(() => {
    setPlanModal(DEFAULT_PLAN);
  }, [pathname]);

  return (
    <PlanModalContext.Provider
      value={{
        planModal,
        setPlanModal,
      }}
    >
      {children}
    </PlanModalContext.Provider>
  );
}

function AddSubjectsModalProvider({ children }) {
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setIsAddSubjectModal(false);
  }, [pathname]);

  return (
    <AddSubjectsModalContext.Provider
      value={{
        isAddSubjectModal,
        setIsAddSubjectModal,
      }}
    >
      {children}
    </AddSubjectsModalContext.Provider>
  );
}

function ChatModalProvider({ children }) {
  const [chatModal, setChatModal] = useState({
    chatroom: null,
    name: "",
    opened: false,
    totalNewMsg: 0,
  });

  const pathname = usePathname();

  useEffect(() => {
    setChatModal((prev) => ({ ...prev, chatroom: null, opened: false }));
  }, [pathname]);

  return (
    <ChatModalContext.Provider
      value={{
        chatModal,
        setChatModal,
      }}
    >
      {children}
    </ChatModalContext.Provider>
  );
}

function SearchUsersModalProvider({ children }) {
  const [searchUsersModal, setSearchUsersModal] = useState({
    opened: false,
    onClick: null,
  });

  const pathname = usePathname();

  useEffect(() => {
    setSearchUsersModal({
      opened: false,
      onClick: null,
    });
  }, [pathname]);

  return (
    <SearchUsersModalContext.Provider
      value={{
        searchUsersModal,
        setSearchUsersModal,
      }}
    >
      {children}
    </SearchUsersModalContext.Provider>
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

  const { themesData } = useThemes();
  const { themesUserData } = useThemesUser();

  useEffect(() => {
    if (!themesData?.success) return;

    setThemes(themesData.data.themes);
  }, [themesData]);

  useEffect(() => {
    if (!themesUserData?.success) return;

    setUserThemes(themesUserData.data.themes);
  }, [themesUserData]);

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
  AppContainer,
  PlanModalContext,
  PlansContext,
  GroupsContext,
  TutorialsContext,
  CallOptionsContext,
  ThemesContext,
  WorkersContext,
  AccountModalContext,
  JoinGroupModalContext,
  EditGroupModalContext,
  SubjectsModalContext,
  AddSubjectsModalContext,
  ChatModalContext,
  SearchUsersModalContext,
};
