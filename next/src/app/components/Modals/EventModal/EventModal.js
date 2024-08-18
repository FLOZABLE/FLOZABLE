"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./EventModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faBook,
  faCircleExclamation,
  faClock,
  faFileLines,
  faRepeat,
  faShare,
  faTrashCan,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  ModalsContext,
  PlansContext,
  ResponseContext,
  SubjectsContext,
  TutorialsContext,
} from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import DateSelector from "@/app/components/Plans/DateSelector/DateSelector";
import TextEditor from "@/app/components/Inputs/TextEditor/TextEditor";
import DropDownButton from "@/app/components/Buttons/DropDownButton/DropDownButton";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import SliderAnimation from "@/app/components/Inputs/SliderAnimation/SliderAnimation";
import { requestNotification } from "@/app/utils/Tool";
import DraggableModal from "../DraggableModal/DraggableModal";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import { deletePlanShare, patchPlan, postPlanShare } from "@/Api/plansApi";
import { usePlansPlanUsers } from "@/Hooks/plansHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import ShareUserBox from "../../Users/ShareUserBox/ShareUserBox";

function EventModalLayer({ children, icon, hoverText }) {
  return (
    <div className={styles.EventModalLayer}>
      <div className={styles.iconWrapper}>
        {icon}
        {hoverText ? (
          <div className={`HoverText ${styles.hoverText}`}>{hoverText}</div>
        ) : null}
      </div>
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
}

function EventModal({}) {
  const { subjects } = useContext(SubjectsContext);

  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);
  const { setResponse } = useContext(ResponseContext);
  const { setIsAddSubjectModal, setSearchUsersModal } =
    useContext(ModalsContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);

  const { usePlansPlanUsersData, usePlansPlanUsersIsLoading, clearPlanUsers } =
    usePlansPlanUsers(planModal?.plan_id);

  const eventModalRef = useRef(null);
  const titleRef = useRef(null);
  const addSubjectRef = useRef(null);
  const submitRef = useRef(null);

  const [share, setShare] = useState([]);
  const [shared, setShared] = useState([]);

  useEffect(() => {
    if (!tutorial) return;

    if (tutorial === 2) {
      setTimeout(() => {
        if (!planModal.opened) {
          searchParams.delete("tutorial");
          setSearchParams(searchParams);
          return;
        }

        setPlanModal((prev) => ({
          ...prev,
          title: "example",
          description: "example",
        }));

        const { width, top, left, height, bottom } =
          eventModalRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 25 + "px";
        tutorialBoxRef.current.style.top = top - 25 + "px";
        tutorialBoxRef.current.style.width = width + 50 + "px";
        tutorialBoxRef.current.style.height = height + 50 + "px";

        tutorialTextRef.current.style.top = top - 70 + "px";
        tutorialTextRef.current.style.left = left - 25 + "px";
        tutorialTextRef.current.innerText = "Enter the event information!";

        setTimeout(() => {
          setTutorial(3);
        }, 5000);
      }, 500);
    } else if (tutorial === 3) {
      setTimeout(() => {
        if (!planModal.opened) {
          setTutorial(false);
          return;
        }

        const { width, top, left, height } =
          addSubjectRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 10 + "px";
        tutorialBoxRef.current.style.top = top - 9 + "px";
        tutorialBoxRef.current.style.width = width + 10 + "px";
        tutorialBoxRef.current.style.height = height + 20 + "px";

        tutorialTextRef.current.style.top = top + height + 20 + "px";
        tutorialTextRef.current.style.left = left - 10 + "px";
        tutorialTextRef.current.innerText = "Add a subject!";
      }, 500);
    } else if (tutorial === 5) {
      submitRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

      const { left } = submitRef.current.getBoundingClientRect();
      const eventModalDimmensions =
        eventModalRef.current.getBoundingClientRect();
      const top2 = eventModalDimmensions.top;

      tutorialTextRef.current.style.top = top2 - 30 + "px";
      tutorialTextRef.current.style.left = left + "px";
      tutorialTextRef.current.innerText = "Save the plan!";

      function moveTutorialBoxes() {
        const { width, top, left, height } =
          submitRef.current.getBoundingClientRect();

        tutorialBoxRef.current.style.left = left + 50 + "px";
        tutorialBoxRef.current.style.top = top - 10 + "px";
        tutorialBoxRef.current.style.width = width - 100 + "px";
        tutorialBoxRef.current.style.height = height + 20 + "px";
      }
      setTimeout(moveTutorialBoxes, 2000);
    }
  }, [tutorial]);

  const submit = async () => {
    if (!planModal.editable) {
      setResponse({ success: false, reason: "This event is view only" });
      return;
    }
    const data = await patchPlan({ ...planModal });
    setResponse(data);
    if (data.success) {
      const eventIndex = plans.findIndex(
        (event) => event.plan_id === planModal.plan_id
      );
      if (eventIndex !== -1) {
        const updatedEvents = [...plans];
        updatedEvents[eventIndex].saved = true;
        updatedEvents[eventIndex].plan_id = data.plan.plan_id;
        setPlans(updatedEvents);
      }
      setPlanModal((prev) => ({ ...prev, opened: false, plan_id: null }));
      if (tutorial === 5) {
        setTutorial(6);
      }
      if (data.isNew) {
        const newShare = share.map((user) => user.user_id);
        const data = await postPlanShare(newShare, planModal.plan_id);
        console.log(data);
        clearPlanUsers();
      }
    }
  };

  const deletePlan = async () => {
    const { id } = planModal;
    if (!id) return;
    const data = await fetch(`${config.server}/plans`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
      credentials: "include",
    }).then((res) => res.json());

    if (data.success) {
      setPlanModal((prev) => ({ ...prev, opened: false }));
      setPlans(
        plans.filter((plan) => {
          plan.plan_id !== id;
        })
      );
    }
  };

  const onUnshare = useCallback(
    (userInfo) => {
      (async () => {
        const data = await deletePlanShare(userInfo.user_id, planModal.plan_id);
        setResponse(data);
        clearPlanUsers();

        if (data.success) {
          setPlanModal((prev) => {
            return {
              ...prev,
              share: [
                ...prev.share.filter(
                  (users) => users.user_id !== userInfo.user_id
                ),
              ],
            };
          });
        }
      })();
    },
    [planModal]
  );

  const onUnshared = useCallback(
    (userInfo) => {
      (async () => {
        const data = await deletePlanShare(userInfo.user_id, planModal.plan_id);
        setResponse(data);
        clearPlanUsers();

        if (data.success) {
          setPlanModal((prev) => {
            return {
              ...prev,
              shared: [
                ...prev.shared.filter(
                  (users) => users.user_id !== userInfo.user_id
                ),
              ],
            };
          });
        }
      })();
    },
    [planModal]
  );

  useEffect(() => {
    if (!planModal || !planModal.opened || !subjects) return;
    if (!planModal.plan_id) {
      const planInfo = { ...planModal };
      delete planInfo.opened;
      planInfo.plan_id = "0000000000";
      setPlanModal((prev) => ({ ...prev, plan_id: planInfo.plan_id }));
      setPlans((prev) => [...prev, planInfo]);
    } else {
      setPlans((prev) => {
        const foundIndex = prev.findIndex(
          (val) => val.plan_id === planModal.plan_id
        );
        const subject = subjects.find(
          (subject) => subject.subject_id === planModal.subject_id
        );
        const planInfo = { ...planModal };
        if (subject) {
          planInfo.backgroundColor = subject.color;
          planInfo.borderColor = subject.color;
          planInfo.color = subject.color;
          planInfo.subject_color = subject.color;
          planInfo.icon = subject.icon;
        }
        if (foundIndex !== -1) {
          return [
            ...prev.slice(0, foundIndex),
            planInfo,
            ...prev.slice(foundIndex + 1),
          ];
        } else {
          return [...prev.slice(), planInfo];
        }
      });
    }
  }, [planModal, subjects]);

  useEffect(() => {
    if (!planModal) return;
    if (!planModal.opened) {
      setSearchUsersModal((prev) => ({ ...prev, opened: false }));
      setPlanModal((prev) => ({
        ...prev,
        ...DEFAULT_PLAN,
        subject_id: prev.subject_id,
      }));
      if (!planModal.saved) {
        setPlans((prev) => {
          const foundIndex = prev.findIndex(
            (val) => val.plan_id === planModal.plan_id
          );
          if (foundIndex !== -1) {
            return [
              ...prev.slice(0, foundIndex),
              ...prev.slice(foundIndex + 1),
            ];
          }
          return prev;
        });
      }
    }
  }, [planModal.opened, planModal.plan_id]);

  useEffect(() => {
    if (!usePlansPlanUsersData?.success) return;

    const { shared, share } = usePlansPlanUsersData.planInfo;

    setShare(share);
    setShared(shared);
  }, [usePlansPlanUsersData]);

  return (
    <DraggableModal
      refProp={eventModalRef}
      isOpen={planModal.opened}
      setIsOpen={() => {
        setPlanModal((prev) => ({ ...prev, opened: false }));
      }}
    >
      <div className={`${styles.EventModal} customScroll`}>
        <EventModalLayer>
          <input
            className={styles.titleInput}
            ref={titleRef}
            type="text"
            placeholder="Enter title"
            value={planModal.title}
            onChange={(e) => {
              if (!planModal.editable) {
                setResponse({
                  success: false,
                  reason: "This event is view only",
                });
              } else {
                setPlanModal((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
              }
            }}
          />
        </EventModalLayer>
        <EventModalLayer
          icon={<FontAwesomeIcon icon={faClock} />}
          hoverText={"Select Time"}
        >
          <DateSelector
            start={planModal.start}
            setStart={(start) => {
              if (!planModal.editable) {
                setResponse({
                  success: false,
                  reason: "This event is view only",
                });
              } else {
                setPlanModal((prev) => ({ ...prev, start }));
              }
            }}
            end={planModal.end}
            setEnd={(end) => {
              if (!planModal.editable) {
                setResponse({
                  success: false,
                  reason: "This event is view only",
                });
              } else {
                setPlanModal((prev) => ({ ...prev, end }));
              }
            }}
          />
        </EventModalLayer>
        <EventModalLayer
          icon={<FontAwesomeIcon icon={faFileLines} />}
          hoverText={"Add Description"}
        >
          <TextEditor
            setValue={(description) => {
              if (!planModal.editable) {
                setResponse({
                  success: false,
                  reason: "This event is view only",
                });
              } else {
                setPlanModal((prev) => ({ ...prev, description }));
              }
            }}
            value={planModal.description}
          />
        </EventModalLayer>
        <EventModalLayer
          icon={<FontAwesomeIcon icon={faRepeat} />}
          hoverText={"Repeat"}
        >
          <DropDownButton
            options={{
              0: "Does not repeat",
              1: "day",
              2: "week",
              3: "month",
            }}
            setValue={(repeat) => {
              if (!planModal.editable) {
                setResponse({
                  success: false,
                  reason: "This event is view only",
                });
              } else {
                setPlanModal((prev) => ({ ...prev, repeat }));
              }
            }}
            value={planModal.repeat}
          />
        </EventModalLayer>
        {planModal.editable ? (
          <EventModalLayer
            icon={<FontAwesomeIcon icon={faBook} />}
            hoverText={"Select Subject"}
          >
            <div className={styles.subjectWrapper}>
              <DropDownButton
                options={subjects.reduce((acc, subject) => {
                  const { name, subject_id } = subject;
                  acc[subject_id] = name;
                  return acc;
                }, {})}
                setValue={(subject_id) => {
                  if (!planModal.editable) {
                    setResponse({
                      success: false,
                      reason: "This event is view only",
                    });
                  } else {
                    setPlanModal((prev) => ({ ...prev, subject_id }));
                  }
                }}
                value={planModal.subject_id}
              />
            </div>
            <p>OR</p>
            <div className={styles.addSubjectWrapper} ref={addSubjectRef}>
              <BlobBtn
                onClick={() => {
                  setIsAddSubjectModal(true);
                  if (tutorial === 3) {
                    setTutorial(4);
                  }
                }}
                id="tutorial-3"
              >
                Add Subject
              </BlobBtn>
            </div>
          </EventModalLayer>
        ) : null}
        <EventModalLayer
          icon={<FontAwesomeIcon icon={faBell} />}
          hoverText={"Select Notification"}
        >
          <DropDownButton
            options={{
              "-1": "no notification",
              5: "5 minutes before",
              10: "10 minutes before",
              30: "30 minutes before",
              60: "1 hour before",
            }}
            setValue={(notification) => {
              setPlanModal((prev) => ({ ...prev, notification }));
            }}
            value={planModal.notification}
            onClick={() => {
              requestNotification();
            }}
          />
        </EventModalLayer>
        <EventModalLayer
          icon={<FontAwesomeIcon icon={faCircleExclamation} />}
          hoverText={"Select Importance"}
        >
          <div className={styles.notificationWrapper}>
            <SliderAnimation
              min={0}
              max={100}
              step={1}
              sliderValue={planModal.priority}
              setSliderValue={(priority) => {
                setPlanModal((prev) => ({ ...prev, priority }));
              }}
            />
          </div>
        </EventModalLayer>
        <EventModalLayer
          icon={<FontAwesomeIcon icon={faUserGroup} />}
          hoverText={"Shared Users"}
        >
          <div className={styles.UserBoxes}>
            {usePlansPlanUsersIsLoading ? (
              <CircularLoading />
            ) : (
              <>
                <div id={styles.shared}>
                  {shared.map((userInfo, i) => {
                    return (
                      <ShareUserBox
                        userInfo={userInfo}
                        key={i}
                        text={`Remove ${userInfo.name}`}
                        onClick={() => {
                          onUnshared(userInfo);
                        }}
                      />
                    );
                  })}
                </div>
                <div id={styles.share}>
                  {share.map((userInfo, i) => {
                    return (
                      <ShareUserBox
                        userInfo={userInfo}
                        key={i}
                        text={`(Pending) Remove ${userInfo.name}`}
                        onClick={() => {
                          onUnshare(userInfo);
                        }}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </EventModalLayer>
        <div className={styles.buttonsContainer} ref={submitRef}>
          <div className={styles.shareBtn}>
            <BlobBtn
              onClick={() => {
                setSearchUsersModal((prev) => ({
                  opened: !prev.opened,
                  onClick: async (userInfo) => {
                    if (planModal.opened) {
                      const data = await postPlanShare(
                        [userInfo.user_id],
                        planModal.plan_id
                      );
                      if (!data.success) {
                        clearPlanUsers();
                        setResponse(data);
                        return;
                      }

                      if (!data.share.length && !data.shared.length) {
                        return setResponse({
                          success: false,
                          reason: `Already Shared with ${userInfo.name}`,
                        });
                      }

                      clearPlanUsers();
                      setResponse({
                        success: true,
                        msg: `Added ${userInfo.name}`,
                      });
                    }
                  },
                }));
              }}
            >
              <FontAwesomeIcon icon={faShare} />
            </BlobBtn>
          </div>
          <BlobBtn
            onClick={() => {
              submit();
            }}
            id="tutorial-5"
          >
            SAVE
          </BlobBtn>
          <div className={styles.trashcan}>
            <BlobBtn
              onClick={() => {
                deletePlan();
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </BlobBtn>
          </div>
        </div>
      </div>
    </DraggableModal>
  );
}

export default EventModal;
