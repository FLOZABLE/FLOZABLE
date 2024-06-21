"use client";

import React, { useContext, useEffect, useRef } from "react";
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
import { generateRandomId, requestNotification } from "@/app/utils/Tool";
import DraggableModal from "../DraggableModal/DraggableModal";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import ProfileImage from "../../Users/ProfileImage/ProfileImage";

function EventModalLayer({ children, icon, hoverEl }) {
  return (
    <div className={styles.EventModalLayer}>
      <div className={styles.iconWrapper}>
        {icon}
        {hoverEl ? (
          <div className={styles.hoverEl}>
            <p>{hoverEl}</p>
          </div>
        ) : null}
      </div>
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
}

function UserBox({ userInfo, setPlanModal }) {
  return (
    <div
      className={styles.UserBox}
      onClick={() => {
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
      }}
    >
      <ProfileImage userId={userInfo.user_id} />
      <div className={styles.hoverEl}>Remove {userInfo.name}</div>
    </div>
  );
}

function EventModal({}) {
  const { subjects } = useContext(SubjectsContext);
  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);
  const { setResponse } = useContext(ResponseContext);
  const { setIsAddSubjectModal, setIsSharePlanModal } =
    useContext(ModalsContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);

  const eventModalRef = useRef(null);
  const titleRef = useRef(null);
  const addSubjectRef = useRef(null);
  const submitRef = useRef(null);

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

  const submit = () => {
    if (!planModal.editable) {
      setResponse({ success: false, reason: "This event is view only" });
      return;
    }
    const startSec = Math.floor(planModal.start.getTime() / (1000 * 60));
    const endSec = Math.floor(planModal.end.getTime() / (1000 * 60));
    const notification = parseInt(planModal.notification);
    const repeat = parseInt(planModal.repeat);
    const completed = planModal.completed ? 1 : 0;
    const share = planModal.share.map(user => user.user_id);
    fetch(`${config.server}/plan/update`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...planModal,
        start: startSec,
        end: endSec,
        completed,
        notification,
        repeat,
        share
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          const eventIndex = plans.findIndex(
            (event) => event.id === planModal.id
          );
          if (eventIndex !== -1) {
            const updatedEvents = [...plans];
            updatedEvents[eventIndex].saved = true;
            updatedEvents[eventIndex].id = data.planData.id;
            console.log(data.planData.id);
            setPlans(updatedEvents);
          }
          setPlanModal((prev) => ({ ...prev, opened: false, id: null }));
          if (tutorial === 5) {
            setTutorial(6);
          }
        }
      })
      .catch((error) => console.error(error));
  };

  const deletePlan = async () => {
    const { id } = planModal;
    if (!id) return;
    const data = await fetch(`${config.server}/plan`, {
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
          plan.id !== id;
        })
      );
    }
  };

  useEffect(() => {
    if (!planModal || !planModal.opened || !subjects) return;
    if (!planModal.id) {
      const planInfo = { ...planModal };
      delete planInfo.opened;
      planInfo.id = generateRandomId(10);
      setPlanModal((prev) => ({ ...prev, id: planInfo.id }));
      setPlans((prev) => [...prev, planInfo]);
    } else {
      setPlans((prev) => {
        const foundIndex = prev.findIndex((val) => val.id === planModal.id);
        const subject = subjects.find(
          (subject) => subject.id === planModal.subject
        );
        const planInfo = { ...planModal };
        if (subject) {
          planInfo.backgroundColor = subject.color;
          planInfo.borderColor = subject.color;
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
      setPlanModal((prev) => ({
        ...prev,
        ...DEFAULT_PLAN,
      }));
      if (!planModal.saved) {
        setPlans((prev) => {
          const foundIndex = prev.findIndex((val) => val.id === planModal.id);
          if (foundIndex !== -1) {
            return [
              ...prev.slice(0, foundIndex),
              ...prev.slice(foundIndex + 1),
            ];
          }
          return prev;
        });
      }
    } else {
      console.log(planModal.share)
      if (!planModal.share.length) return;

      if (planModal.share[0]?.user_Id) return;

      fetch(`${config.server}/account/lists`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: planModal.share
        }),
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setPlanModal(prev => {
            return ({...prev, share: data.users})
          })
        })
        .catch((error) => console.error(error));
    }
  }, [planModal.opened, planModal.id]);

  /* useEffect(() => {
    if (router.search.includes('tutorial')) return;
    setPlanModal( {...planModal, opened: false} );
  }, [router]); */

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
          hoverEl={"Select Time"}
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
          hoverEl={"Add Description"}
        >
          <TextEditor
            setDescription={(description) => {
              if (!planModal.editable) {
                setResponse({
                  success: false,
                  reason: "This event is view only",
                });
              } else {
                setPlanModal((prev) => ({ ...prev, description }));
              }
            }}
            description={planModal.description}
          />
        </EventModalLayer>
        <EventModalLayer
          icon={<FontAwesomeIcon icon={faRepeat} />}
          hoverEl={"Repeat"}
        >
          <DropDownButton
            options={{
              0: "Does not repeat",
              1: "Daily",
              2: "Weekly",
              3: "Monthly",
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
            hoverEl={"Select Subject"}
          >
            <div className={styles.subjectWrapper}>
              <DropDownButton
                options={subjects.reduce((acc, subject) => {
                  const { name, id } = subject;
                  acc[id] = name;
                  return acc;
                }, {})}
                setValue={(subject) => {
                  if (!planModal.editable) {
                    setResponse({
                      success: false,
                      reason: "This event is view only",
                    });
                  } else {
                    setPlanModal((prev) => ({ ...prev, subject }));
                  }
                }}
                value={planModal.subject}
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
          hoverEl={"Select Notification"}
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
          hoverEl={"Select Importance"}
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
          hoverEl={"Shared Users"}
        >
          {planModal.share.map((userInfo, i) => {
            return (
              <UserBox
                userInfo={userInfo}
                setPlanModal={setPlanModal}
                key={i}
              />
            );
          })}
        </EventModalLayer>
        <div className={styles.buttonsContainer} ref={submitRef}>
          <div className={styles.shareBtn}>
            <BlobBtn
              onClick={() => {
                console.log("ffffff");
                setIsSharePlanModal((prev) => !prev);
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
              color1="#fff"
              color2="red"
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
