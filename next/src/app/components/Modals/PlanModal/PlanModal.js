"use client";

import {
  AddSubjectsModalContext,
  PlanModalContext,
  PlansContext,
  SearchUsersModalContext,
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
import { usePlanUsers } from "@/Hooks/plansHooks";
import {
  deletePlan,
  deletePlanShare,
  patchPlan,
  patchPlanGoogle,
  postPlanShare,
} from "@/Api/plansApi";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import ShareUserBox from "../../Users/ShareUserBox/ShareUserBox";
import ModalLayer from "../ModalLayer/ModalLayer";
import { requestNotification, unsubscribeFromPush } from "@/app/utils/Tool";
import { useVapidKeys } from "@/Hooks/notificationsHooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubjects } from "@/Hooks/subjectsHooks";

export default function PlanModal() {
  const { subjects } = useSubjects();

  const { planModal, setPlanModal } = useContext(PlanModalContext);
  const { setIsAddSubjectModal } = useContext(AddSubjectsModalContext);
  const { setSearchUsersModal } = useContext(SearchUsersModalContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);

  const { plans, setPlans } = useContext(PlansContext);

  const [newShare, setNewShare] = useState([]);

  const modalRef = useRef();
  const addSubjectBtnRef = useRef();
  const submitBtnRef = useRef();

  const searchParams = useSearchParams();
  const router = useRouter();

  const { vapidKeysData } = useVapidKeys();
  const { planUsers, planUsersIsLoading, updatePlanUsers, clearPlanUsers } =
    usePlanUsers(planModal);

  const [planModalss, setPlanModalss] = useState(null);

  const planId = searchParams.get("plan");

  useEffect(() => {
    if (!planId) return;
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("plan");
    const plan = plans.find((plan) => plan.plan_id === planId);
    if (plan) {
      setPlanModal({ ...plan, opened: true });
    }
    setTimeout(() => {
      router.replace(
        `${window.location.pathname}?${newSearchParams.toString()}`,
        {
          scroll: false,
        }
      );
    }, 1000);
  }, [planId, searchParams, plans]);

  useEffect(() => {
    if (tutorial === 2) {
      modalRef.current.scroll({
        bottom: 200000,
        behavior: "smooth",
      });
      const { width, top, left, height } =
        modalRef.current.getBoundingClientRect();
      tutorialBoxRef.current.style.left = left - 20 + "px";
      tutorialBoxRef.current.style.top = top - 40 + "px";
      tutorialBoxRef.current.style.width = width + 40 + "px";
      tutorialBoxRef.current.style.height = height + 60 + "px";

      tutorialTextRef.current.textContent = "Create your first plan!";
      tutorialTextRef.current.style.left = left - 15 + "px";
      tutorialTextRef.current.style.top = top - 100 + "px";
      setTimeout(() => {
        setTutorial(3);
      }, 5000);
    } else if (tutorial === 3) {
      modalRef.current.scroll({
        top: 200000,
        behavior: "smooth",
      });
      setTimeout(() => {
        const { width, top, left, height } =
          addSubjectBtnRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 20 + "px";
        tutorialBoxRef.current.style.top = top - 20 + "px";
        tutorialBoxRef.current.style.width = width + 40 + "px";
        tutorialBoxRef.current.style.height = height + 40 + "px";

        tutorialTextRef.current.textContent = "Create your first subject!";
        tutorialTextRef.current.style.left = left - 15 + "px";
        tutorialTextRef.current.style.top = top - 100 + "px";
      }, 500);
    } else if (tutorial === 5) {
      modalRef.current.scroll({
        top: 200000,
        behavior: "smooth",
      });
      setTimeout(() => {
        const { width, top, left, height } =
          submitBtnRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 20 + "px";
        tutorialBoxRef.current.style.top = top - 20 + "px";
        tutorialBoxRef.current.style.width = width + 40 + "px";
        tutorialBoxRef.current.style.height = height + 40 + "px";

        tutorialTextRef.current.textContent = "Save your plan!";
        tutorialTextRef.current.style.left = left - 15 + "px";
        tutorialTextRef.current.style.top = top - 100 + "px";
      }, 500);
    }
  }, [tutorial]);

  useEffect(() => {
    if (planModal.plan_id === "0000000000") return;

    setPlans((prev) => prev.filter((plan) => plan.plan_id !== "0000000000"));
    setPlanModalss((prev) => {
      if (prev?.plan_id === planModal.plan_id) {
        return prev;
      }
      return planModal;
    });
    setNewShare([]);
  }, [planModal.plan_id]);

  useEffect(() => {
    if (!planModalss?.plan_id) return;

    if (planModalss?.plan_id !== planModal.plan_id) {
      setPlans((prev) => {
        const newPlans = [...prev];
        const planIndex = newPlans.findIndex(
          (plan) => plan.plan_id === planModalss.plan_id
        );

        if (planIndex === -1) return newPlans;

        newPlans[planIndex] = { ...newPlans[planIndex], ...planModalss };

        const subject = subjects.find(
          (subject) => subject.subject_id === newPlans[planIndex].subject_id
        );
        if (subject) {
          newPlans[planIndex].backgroundColor = subject.color;
          newPlans[planIndex].borderColor = subject.color;
        } else if (newPlans[planIndex].type === "local") {
          newPlans[planIndex].backgroundColor = "#000";
          newPlans[planIndex].borderColor = "#000";
        }
        return newPlans;
      });
    }
  }, [planModal.plan_id, planModalss, subjects]);

  const handleInput = useCallback(
    (newVal) => {
      const planIndex = plans.findIndex(
        (plan) => plan.plan_id === planModal.plan_id
      );
      if (planIndex === -1) return;
      const newPlans = [...plans];
      newPlans[planIndex] = { ...newPlans[planIndex], ...newVal };
      const subject = subjects.find(
        (subject) => subject.subject_id === newPlans[planIndex].subject_id
      );
      if (subject) {
        newPlans[planIndex].backgroundColor = subject.color;
        newPlans[planIndex].borderColor = subject.color;
      } else if (newPlans[planIndex].type === "local") {
        newPlans[planIndex].backgroundColor = "#000";
        newPlans[planIndex].borderColor = "#000";
      }
      setPlans(newPlans);
      setPlanModal((prev) => ({ ...prev, ...newVal }));
    },
    [plans, planModal, planModalss, subjects]
  );

  const submit = useCallback(async () => {
    try {
      let response;

      if (planModal.type === "google") {
        response = await patchPlanGoogle(planModal);
      } else {
        response = await patchPlan(planModal);
      }
      if (!response.success) return;

      const data = response.data;

      const planIndex = plans.findIndex(
        (event) => event.plan_id === planModal.plan_id
      );
      const planId = data.plan.plan_id;
      if (planIndex !== -1) {
        const updatedEvents = [...plans];
        //updatedEvents[planIndex].saved = true;
        updatedEvents[planIndex].plan_id = planId;
        setPlans(updatedEvents);
      }
      setPlanModalss(null);
      setPlanModal((prev) => ({ ...prev, opened: false, plan_id: null }));
      if (data.is_new && newShare.length) {
        const userIds = newShare.map((user) => user.user_id);
        const response = await postPlanShare(userIds, planId);
        if (response.success) {
          clearPlanUsers(planId);
        }
      }
      if (tutorial === 5) {
        router.push("/dashboard/study");
        setTutorial(6);
      }
    } catch (err) {
      console.log(err);
    }
  }, [planModal, tutorial, newShare]);

  const onDeletePlan = useCallback(async () => {
    if (planModal.plan_id === "0000000000") {
      setPlans((prev) =>
        prev.filter((plan) => plan.plan_id !== planModal.plan_id)
      );
      setPlanModal((prev) => ({ ...prev, opened: false, plan_id: null }));
      return null;
    }
    try {
      const response = await deletePlan(planModal.plan_id);
      if (!response.success) return;

      setPlanModal((prev) => ({ ...prev, opened: false, plan_id: null }));
      setPlans((prev) =>
        prev.filter((plan) => plan.plan_id !== planModal.plan_id)
      );
    } catch (err) {
      console.log(err);
    }
  }, [planModal]);

  const onUnshare = useCallback(
    async (userInfo) => {
      try {
        const response = await deletePlanShare(
          userInfo.user_id,
          planModal.plan_id
        );
        if (!response.success) return;

        updatePlanUsers(planModal.plan_id, (prev) =>
          prev.filter((sharedUser) => sharedUser.user_id !== userInfo.user_id)
        );
      } catch (err) {
        console.log(err);
      }
    },
    [planModal]
  );

  return (
    <div className={styles.PlanModal}>
      <DraggableModal
        isOpen={planModal.opened}
        setIsOpen={() => {
          setPlanModal(DEFAULT_PLAN);
        }}
      >
        <div className={`customScroll ${styles.inner}`} ref={modalRef}>
          <ModalLayer>
            <CustomInput
              input={planModal.title}
              handleInput={(e) => {
                const title = e.target.value;
                handleInput({ title });
              }}
              placeHolder={"Enter title"}
            ></CustomInput>
          </ModalLayer>
          <ModalLayer>
            <DateSelector
              start={planModal.start}
              setStart={(start) => {
                handleInput({ start });
              }}
              end={planModal.end}
              setEnd={(end) => {
                handleInput({ end });
              }}
              setDate={({ start, end }) => {
                handleInput({ start, end });
              }}
            />
          </ModalLayer>
          <ModalLayer>
            <TextEditor
              setValue={(description) => {
                handleInput({ description });
              }}
              value={planModal.description}
            />
          </ModalLayer>
          <ModalLayer>
            <DropDownButton
              options={[
                { value: 0, name: "Does not repeat" },
                { value: 1, name: "Daily" },
                { value: 2, name: "Weekly" },
                { value: 3, name: "Monthly" },
              ]}
              setValue={(repeat) => {
                handleInput({ repeat });
              }}
              value={planModal.repeat}
            />
          </ModalLayer>
          {planModal.type === "local" ? (
            <ModalLayer>
              <DropDownButton
                options={subjects.map(({ subject_id, name }) => {
                  return { value: subject_id, name };
                })}
                setValue={(subject_id) => {
                  handleInput({ subject_id });
                }}
                value={planModal.subject_id}
              />
              <p>OR</p>
              <div ref={addSubjectBtnRef}>
                <BlobBtn
                  onClick={() => {
                    setIsAddSubjectModal(true);
                    if (tutorial === 3) {
                      setTutorial(4);
                    }
                  }}
                  data-tutorial={3}
                >
                  Add Subject
                </BlobBtn>
              </div>
            </ModalLayer>
          ) : null}
          <ModalLayer>
            <DropDownButton
              options={[
                { value: -1, name: "No notification" },
                { value: 0, name: "0 minutes before" },
                { value: 5 * 60, name: "5 minutes before" },
                { value: 10 * 60, name: "10 minutes before" },
                { value: 30 * 60, name: "30 minutes before" },
              ]}
              setValue={(notification) => {
                handleInput({ notification });
              }}
              value={planModal.notification}
              onClick={async () => {
                if (!vapidKeysData?.success) return;

                const response = await requestNotification(
                  vapidKeysData.data.publicKey
                );
                if (!response.success) {
                  unsubscribeFromPush();
                }
              }}
            />
          </ModalLayer>
          {planModal.type === "local" ? (
            <ModalLayer>
              <SliderAnimation
                min={0}
                max={100}
                step={1}
                sliderValue={planModal.priority}
                setSliderValue={(priority) => {
                  handleInput({ priority });
                }}
              />
            </ModalLayer>
          ) : null}
          {planModal.type === "local" ? (
            <ModalLayer>
              <div className={styles.UserBoxes}>
                {planUsersIsLoading ? (
                  <CircularLoading />
                ) : (
                  <div id={styles.share}>
                    {[...planUsers, ...newShare].map((userInfo, i) => {
                      const text =
                        userInfo.status === "pending"
                          ? `(Pending) Remove ${userInfo.name}`
                          : `Remove ${userInfo.name}`;
                      return (
                        <ShareUserBox
                          userInfo={userInfo}
                          key={i}
                          text={text}
                          onClick={() => {
                            onUnshare(userInfo);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </ModalLayer>
          ) : null}
          <div className={styles.buttons}>
            {planModal.type === "local" ? (
              <BlobBtn
                onClick={() => {
                  setSearchUsersModal((prev) => ({
                    opened: !prev.opened,
                    onClick: async (userInfo) => {
                      if (planModal.plan_id === "0000000000") {
                        return setNewShare((prev) => {
                          const sharedUser = prev.find(
                            (sharedUser) =>
                              sharedUser.user_id === userInfo.user_id
                          );
                          if (sharedUser) {
                            return prev;
                          }
                          return [...prev, { ...userInfo, status: "pending" }];
                        });
                      }

                      const response = await postPlanShare(
                        [userInfo.user_id],
                        planModal.plan_id
                      );
                      if (!response.success) return;

                      updatePlanUsers(planModal.plan_id, (prev) => [
                        ...prev,
                        { ...userInfo, status: "pending" },
                      ]);
                    },
                  }));
                }}
              >
                <FontAwesomeIcon icon={faShare} />
              </BlobBtn>
            ) : (
              <div> </div>
            )}
            <div ref={submitBtnRef}>
              <BlobBtn
                onClick={() => {
                  submit();
                }}
                data-tutorial={5}
              >
                SAVE
              </BlobBtn>
            </div>
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
    </div>
  );
}
