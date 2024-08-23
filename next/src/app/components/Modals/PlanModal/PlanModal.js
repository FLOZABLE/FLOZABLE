"use client";

import { PlansContext } from "@/app/utils/Contexts";
import styles from "./PlanModal.module.css";
import { useContext } from "react";
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
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import SliderAnimation from "../../Inputs/SliderAnimation/SliderAnimation";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import TextEditor from "../../Inputs/TextEditor/TextEditor";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";

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
  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);

  console.log(planModal);
  return (
    <DraggableModal
      isOpen={planModal.opened}
      setIsOpen={() => {
        setPlanModal((prev) => ({ ...prev, opened: false }));
      }}
    >
      <div className={styles.PlanModal}>
        <PlanModalLayer>
          <CustomInput
            input={planModal.title}
            handleInput={(e) => {
              const title = e.target.value;
              setPlanModal((prev) => ({ ...prev, title }));
            }}
          ></CustomInput>
        </PlanModalLayer>
        <PlanModalLayer
          icon={<FontAwesomeIcon icon={faClock} />}
          hoverText={"Select Time"}
        >
          <DateSelector
            start={planModal.start}
            setStart={(start) => {
              setPlanModal((prev) => ({ ...prev, start }));
            }}
            end={planModal.end}
            setEnd={(end) => {
              setPlanModal((prev) => ({ ...prev, end }));
            }}
          />
        </PlanModalLayer>

        <PlanModalLayer
          icon={<FontAwesomeIcon icon={faFileLines} />}
          hoverText={"Add Description"}
        >
          <TextEditor
            setValue={(description) => {
              setPlanModal((prev) => ({ ...prev, description }));
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
              setPlanModal((prev) => ({ ...prev, repeat }));
            }}
            value={planModal.repeat}
          />
        </PlanModalLayer>
        {/* {planModal.editable ? (
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
          </PlanModalLayer>
        ) : null} */}
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
              setPlanModal((prev) => ({ ...prev, notification }));
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
                setPlanModal((prev) => ({ ...prev, priority }));
              }}
            />
          </div>
        </PlanModalLayer>
        {/* <PlanModalLayer
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
        </PlanModalLayer> */}
      </div>
    </DraggableModal>
  );
}
