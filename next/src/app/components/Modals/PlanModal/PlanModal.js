"use client";

import {
  ModalsContext,
  PlansContext,
  ResponseContext,
  SubjectsContext,
  TutorialsContext,
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
import {
  deletePlan,
  deletePlanShare,
  patchPlan,
  postPlanShare,
} from "@/Api/plansApi";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import ShareUserBox from "../../Users/ShareUserBox/ShareUserBox";
import ModalLayer from "../ModalLayer/ModalLayer";
import { requestNotification, unsubscribeFromPush } from "@/app/utils/Tool";
import { useVapidKeys } from "@/Hooks/notificationsHooks";

export default function PlanModal() {
  const { setResponse } = useContext(ResponseContext);
  const { subjects } = useContext(SubjectsContext);
  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);
  const { setIsAddSubjectModal, setSearchUsersModal } =
    useContext(ModalsContext);
  const { tutorial, setTutorial } = useContext(TutorialsContext);

  const { vapidKeysData } = useVapidKeys();
  const { usePlansPlanUsersData, usePlansPlanUsersIsLoading, clearPlanUsers } =
    usePlansPlanUsers(planModal?.plan_id);

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
    if (!planModalss?.plan_id) return;

    if (planModalss?.plan_id !== planModal.plan_id) {
      setPlans((prev) => {
        const planIndex = prev.findIndex(
          (plan) => plan.plan_id === planModalss.plan_id
        );

        if (planIndex === -1) return prev;

        prev[planIndex] = planModalss;

        const subject = subjects.find(
          (subject) => subject.subject_id === prev[planIndex].subject_id
        );
        if (subject) {
          prev[planIndex].backgroundColor = subject.color;
          prev[planIndex].borderColor = subject.color;
          prev[planIndex].subject_color = subject.color;
          prev[planIndex].color = subject.color;
          //plan.textColor = subject.color;
        } else {
          prev[planIndex].backgroundColor = "#000";
          prev[planIndex].borderColor = "#000";
          prev[planIndex].color = "#000";
        }
        return prev;
      });
    }
  }, [planModal.plan_id, planModalss, subjects]);

  const handleInput = useCallback(
    (key, value) => {
      const planIndex = plans.findIndex(
        (plan) => plan.plan_id === planModal.plan_id
      );
      if (planIndex === -1) return;
      const newPlans = [...plans];
      newPlans[planIndex] = { ...newPlans[planIndex], [key]: value };
      const subject = subjects.find(
        (subject) => subject.subject_id === newPlans[planIndex].subject_id
      );
      if (subject) {
        newPlans[planIndex].backgroundColor = subject.color;
        newPlans[planIndex].borderColor = subject.color;
        newPlans[planIndex].subject_color = subject.color;
        newPlans[planIndex].color = subject.color;
        //plan.textColor = subject.color;
      } else {
        newPlans[planIndex].backgroundColor = "#000";
        newPlans[planIndex].borderColor = "#000";
        newPlans[planIndex].color = "#000";
      }
      setPlans(newPlans);
      setPlanModal((prev) => ({ ...prev, [key]: value }));
    },
    [plans, planModal, planModalss, subjects]
  );

  const submit = useCallback(() => {
    (async () => {
      const data = await patchPlan({ ...planModal });
      setResponse(data);
      if (data.success) {
        const planIndex = plans.findIndex(
          (event) => event.plan_id === planModal.plan_id
        );
        if (planIndex !== -1) {
          const updatedEvents = [...plans];
          updatedEvents[planIndex].saved = true;
          updatedEvents[planIndex].plan_id = data.plan.plan_id;
          setPlans(updatedEvents);
        }
        setPlanModalss(null);
        setPlanModal((prev) => ({ ...prev, opened: false, plan_id: null }));
        if (data.isNew) {
          const newShare = share.map((user) => user.user_id);
          const data = await postPlanShare(newShare, planModal.plan_id);
          console.log(data);
          clearPlanUsers();
        }
      }
    })();
  }, [planModal, tutorial]);

  const onDeletePlan = useCallback(() => {
    (async () => {
      const data = await deletePlan(planModal.plan_id);
      setResponse(data);
      if (data.success) {
        setPlanModal((prev) => ({ ...prev, opened: false, plan_id: null }));
        setPlans((prev) =>
          prev.filter((plan) => plan.plan_id !== planModal.plan_id)
        );
      }
    })();
  }, [planModal]);

  const onUnshare = useCallback(
    (userInfo) => {
      (async () => {
        const data = await deletePlanShare(userInfo.user_id, planModal.plan_id);
        setResponse(data);
        clearPlanUsers();
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
      })();
    },
    [planModal]
  );

  return (
    <DraggableModal
      isOpen={planModal.opened}
      setIsOpen={() => {
        setPlanModal(DEFAULT_PLAN);
      }}
    >
      <div className={`customScroll ${styles.PlanModal}`}>
        <ModalLayer>
          <CustomInput
            input={planModal.title}
            handleInput={(e) => {
              const title = e.target.value;
              handleInput("title", title);
            }}
            placeHolder={"Enter title"}
          ></CustomInput>
        </ModalLayer>
        <ModalLayer
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
        </ModalLayer>
        <ModalLayer
          icon={<FontAwesomeIcon icon={faFileLines} />}
          hoverText={"Add Description"}
        >
          <TextEditor
            setValue={(description) => {
              handleInput("description", description);
            }}
            value={planModal.description}
          />
        </ModalLayer>
        <ModalLayer
          icon={<FontAwesomeIcon icon={faRepeat} />}
          hoverText={"Repeat"}
        >
          <DropDownButton
            options={[
              { value: 0, name: "Does not repeat" },
              { value: 1, name: "Daily" },
              { value: 2, name: "Weekly" },
              { value: 3, name: "Monthly" },
            ]}
            setValue={(repeat) => {
              handleInput("repeat", repeat);
            }}
            value={planModal.repeat}
          />
        </ModalLayer>
        {planModal.editable ? (
          <ModalLayer
            icon={<FontAwesomeIcon icon={faBook} />}
            hoverText={"Select Subject"}
          >
            <DropDownButton
              options={subjects.map(({ subject_id, name }) => {
                return { value: subject_id, name };
              })}
              setValue={(subject_id) => {
                handleInput("subject_id", subject_id);
              }}
              value={planModal.subject_id}
            />
            <p>OR</p>
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
          </ModalLayer>
        ) : null}
        <ModalLayer
          icon={<FontAwesomeIcon icon={faBell} />}
          hoverText={"Select Notification"}
        >
          <DropDownButton
            options={[
              { value: -1, name: "No notification" },
              { value: 0, name: "0 minutes before" },
              { value: 5, name: "5 minutes before" },
              { value: 10, name: "10 minutes before" },
              { value: 30, name: "30 minutes before" },
            ]}
            setValue={(notification) => {
              handleInput("notification", notification);
            }}
            value={planModal.notification}
            onClick={async () => {
              if (!vapidKeysData?.success) return;

              const response = await requestNotification(
                vapidKeysData.publicKey
              );
              if (!response.success) {
                setResponse(response);
                unsubscribeFromPush();
              }
            }}
          />
        </ModalLayer>
        <ModalLayer
          icon={<FontAwesomeIcon icon={faCircleExclamation} />}
          hoverText={"Select Importance"}
        >
          <SliderAnimation
            min={0}
            max={100}
            step={1}
            sliderValue={planModal.priority}
            setSliderValue={(priority) => {
              handleInput("priority", priority);
            }}
          />
        </ModalLayer>
        <ModalLayer
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
        </ModalLayer>
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
              onDeletePlan();
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </BlobBtn>
        </div>
      </div>
    </DraggableModal>
  );
}
