"use client";

import {
  ModalsContext,
  PlansContext,
  ResponseContext,
  SubjectsContext,
} from "@/app/utils/Contexts";
import styles from "./PlanModal.module.css";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import DraggableModal from "../DraggableModal/DraggableModal";
import CustomInput from "../../Inputs/CustomInput/CustomInput";
import DateSelector from "../../Plans/DateSelector/DateSelector";
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
import SliderAnimation from "../../Inputs/SliderAnimation/SliderAnimation";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import TextEditor from "../../Inputs/TextEditor/TextEditor";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import { usePlansPlanUsers } from "@/Hooks/plansHooks";
import { deletePlan, patchPlan, postPlanShare } from "@/Api/plansApi";
import { DEFAULT_PLAN } from "@/app/utils/Constant";

function PlanModalLayer({ children, icon, hoverText }) {
  return (
    <div className={styles.PlanModalLayer}>
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

export default function PlanModal() {
  const { setResponse } = useContext(ResponseContext);
  const { subjects } = useContext(SubjectsContext);
  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);
  const { setIsAddSubjectModal, setSearchUsersModal } =
    useContext(ModalsContext);

  const { usePlansPlanUsersData, usePlansPlanUsersIsLoading, clearPlanUsers } =
    usePlansPlanUsers(planModal?.plan_id);

  const addSubjectRef = useRef(null);

  const [shared, setShared] = useState([]);
  const [share, setShare] = useState([]);
  const [planModalss, setPlanModalss] = useState(null);

  useEffect(() => {
    if (!usePlansPlanUsersData?.success) return;

    const { shared, share } = usePlansPlanUsersData.planInfo;

    setShare(share);
    setShared(shared);
  }, [usePlansPlanUsersData]);

  useEffect(() => {
    if (planModal.plan_id === "0000000000") return;

    setPlans((prev) => prev.filter((plan) => plan.plan_id !== "0000000000"));
    setPlanModalss((prev) => {
      if (prev?.plan_id === planModal.plan_id) {
        return prev;
      }
      return planModal;
    });
  }, [planModal.plan_id]);

  useEffect(() => {
    if (planModalss?.plan_id !== planModal.plan_id) {
      setPlans((prev) => {
        const planIndex = prev.findIndex(
          (plan) => plan.plan_id === planModalss.plan_id
        );

        if (planIndex === -1) return prev;
        prev[planIndex] = planModalss;
        return prev;
      });
    }
  }, [planModal.plan_id, planModalss]);

  const handleInput = useCallback(
    (key, value) => {
      const planIndex = plans.findIndex(
        (plan) => plan.plan_id === planModal.plan_id
      );
      if (planIndex === -1) return;
      const newPlans = [...plans];
      newPlans[planIndex] = { ...newPlans[planIndex], [key]: value };
      setPlans(newPlans);
      setPlanModal((prev) => ({ ...prev, [key]: value }));
    },
    [plans, planModal, planModalss]
  );

  const submit = useCallback(() => {
    (async () => {
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
    })();
  }, [planModal]);

  return (
    <DraggableModal
      isOpen={planModal.opened}
      setIsOpen={() => {
        setPlanModal(DEFAULT_PLAN);
      }}
    >
      <div className={`customScroll ${styles.PlanModal}`}>
        <PlanModalLayer>
          <CustomInput
            input={planModal.title}
            handleInput={(e) => {
              const title = e.target.value;
              handleInput("title", title);
            }}
            placeHolder={"Enter title"}
          ></CustomInput>
        </PlanModalLayer>
        <PlanModalLayer
          icon={<FontAwesomeIcon icon={faClock} />}
          hoverText={"Select Time"}
        >
          <DateSelector
            start={planModal.start}
            setStart={(start) => {
              handleInput("start", start);
            }}
            end={planModal.end}
            setEnd={(end) => {
              handleInput("end", end);
            }}
          />
        </PlanModalLayer>
        <PlanModalLayer
          icon={<FontAwesomeIcon icon={faFileLines} />}
          hoverText={"Add Description"}
        >
          <TextEditor
            setValue={(description) => {
              handleInput("description", description);
            }}
            value={planModal.description}
          />
        </PlanModalLayer>
        <PlanModalLayer
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
              handleInput("repeat", repeat);
            }}
            value={planModal.repeat}
          />
        </PlanModalLayer>
        {planModal.editable ? (
          <PlanModalLayer
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
                  handleInput("subject_id", subject_id);
                }}
                value={planModal.subject_id}
              />
            </div>
            <p>OR</p>
            <div className={styles.addSubjectWrapper} ref={addSubjectRef}>
              <BlobBtn
                onClick={() => {
                  setIsAddSubjectModal(true);
                  /* if (tutorial === 3) {
                    setTutorial(4);
                  } */
                }}
                id="tutorial-3"
              >
                Add Subject
              </BlobBtn>
            </div>
          </PlanModalLayer>
        ) : null}
        <PlanModalLayer
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
              handleInput("notification", notification);
            }}
            value={planModal.notification}
            onClick={() => {
              requestNotification();
            }}
          />
        </PlanModalLayer>
        <PlanModalLayer
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
                handleInput("priority", priority);
              }}
            />
          </div>
        </PlanModalLayer>
        <PlanModalLayer
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
        </PlanModalLayer>
        <div className={styles.buttons}>
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
          <BlobBtn
            onClick={() => {
              submit();
            }}
            id="tutorial-5"
          >
            SAVE
          </BlobBtn>
          <BlobBtn
            onClick={() => {
              deletePlan();
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </BlobBtn>
        </div>
      </div>
    </DraggableModal>
  );
}
