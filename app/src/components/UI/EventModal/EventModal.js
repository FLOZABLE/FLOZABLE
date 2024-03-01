import React, { useEffect, useRef, useState } from "react";
import styles from "./EventModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faBook,
  faCircleExclamation,
  faClock,
  faFileLines,
  faRepeat,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import TextEditor from "../TextEditor/TextEditor";
import DateSelector from "../DateSelector/DateSelector";
import DropDownButton from "../DropDownButton/DropDownButton";
import BlobBtn from "../BlobBtn/BlobBtn";
import SliderAnimation from "../SliderAnimation/SliderAnimation";
import generateRandomId from "../../../utils/RandomId";
import { requestNotification } from "../../../utils/Tool";
import { useSearchParams } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function EventModal({
  subjects,
  setIsAddSubjectModal,
  events,
  setEvents,
  setResponse,
  planModal,
  setPlanModal
}) {

  const [searchParams, setSearchParams] = useSearchParams();
  const eventModalRef = useRef(null);
  const titleRef = useRef(null);
  const addSubjectRef = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    if (tutorial && parseInt(tutorial) === 2) {
      setTimeout(() => {
        if (!planModal.opened) {
          searchParams.delete('tutorial');
          setSearchParams(searchParams);
          return;
        }

        setPlanModal(prev => ({...prev, 
        title: 'example',
        description: 'example'
        }))

        const hole = document.getElementById("tutorialHole");
        const text = document.getElementById("tutorialText");

        const { width, top, left, height, bottom } = eventModalRef.current.getBoundingClientRect();
        hole.style.left = left + 'px';
        hole.style.top = top + 'px';
        hole.style.width = width + 'px';
        hole.style.height = height + 'px';

        text.style.top = top + height + 30 + 'px';
        text.style.left = left + 'px';
        text.innerText = "Enter information of the plan!";
        setTimeout(() => {
          setSearchParams({...searchParams, tutorial: 3})
        }, 5000);
      }, 500);
      /* hole.style.height = top + 'px'; */
    } else if (tutorial  && parseInt(tutorial) === 3) {
      setTimeout(() => {
        if (!planModal.opened) {
          searchParams.delete('tutorial');
          setSearchParams(searchParams);
          return;
        }

        const hole = document.getElementById("tutorialHole");
        const text = document.getElementById("tutorialText");

        const { width, top, left, height } = addSubjectRef.current.getBoundingClientRect();
        hole.style.left = left + 'px';
        hole.style.top = top + 'px';
        hole.style.width = width + 'px';
        hole.style.height = height + 'px';

        text.style.top = top + height + 30 + 'px';
        text.style.left = left + 'px';
        text.innerText = "Add subject!";
      }, 500);
    } else if (tutorial  && parseInt(tutorial) === 5) {
      const hole = document.getElementById("tutorialHole");
      const text = document.getElementById("tutorialText");

      const { width, top, left, height } = submitRef.current.getBoundingClientRect();
      hole.style.left = left + 'px';
      hole.style.top = top + 'px';
      hole.style.width = width + 'px';
      hole.style.height = height + 'px';

      text.style.top = top + height + 30 + 'px';
      text.style.left = left + 'px';
      text.innerText = "Save the plan!";
    }
  }, [searchParams]);


  const submit = () => {
    if (!planModal.editable) {
      setResponse({ success: false, reason: "This event is view only" });
      return;
    };
    const startSec = Math.floor(planModal.start.getTime() / (1000 * 60));
    const endSec = Math.floor(planModal.end.getTime() / (1000 * 60));
    const notification = parseInt(planModal.notification);
    const repeat = parseInt(planModal.repeat);
    const completed = planModal.completed ? 1 : 0;
    fetch(`${serverOrigin}/plan/update`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...planModal, start: startSec, end: endSec, completed, notification, repeat }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          const eventIndex = events.findIndex((event) => event.id === planModal.id);
          if (eventIndex !== -1) {
            const updatedEvents = [...events];
            updatedEvents[eventIndex].saved = true;
            setEvents(updatedEvents);
          }
          setPlanModal(prev => ({ ...prev, opened: false, id: null }));
          setSearchParams(prev => ({...prev, tutorial: 6}));
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (!planModal || !planModal.opened || !subjects) return;
    if (!planModal.id) {
      const planInfo = { ...planModal };
      delete planInfo.opened;
      planInfo.id = generateRandomId(10);
      setPlanModal((prev) => ({ ...prev, id: planInfo.id }));
      setEvents(prev => (
        [...prev, planInfo]
      ));
    } else {
      setEvents((prev) => {
        const foundIndex = prev.findIndex((val) => val.id === planModal.id);
        const subject = subjects.find(subject => subject.id === planModal.subject);
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
        };
      });
    }
  }, [planModal, subjects]);

  useEffect(() => {
    if (!planModal) return;
    if (!planModal.opened) {
      setPlanModal(prev => (
        {
          ...prev,
          opened: false,
          title: '',
          description: '',
          start: new Date(),
          end: new Date(new Date().getTime() + 60 * 1000 * 30),
          repeat: 0,
          priority: 50,
          notification: -1,
          id: null,
          saved: false,
          completed: false,
          editable: true
        }
      ));
      if (!planModal.saved) {
        setEvents((prev) => {
          const foundIndex = prev.findIndex((val) => val.id === planModal.id);
          if (foundIndex !== -1) {
            return [
              ...prev.slice(0, foundIndex),
              ...prev.slice(foundIndex + 1),
            ];
          }
          return prev;
        });
      };
    }
  }, [planModal.opened]);

  return (
    <div
      className={`${styles.EventModal} modal ${planModal.opened ? "open" : ""}`}
      ref={eventModalRef}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setPlanModal((prev) => ({ ...prev, opened: false }));
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={`${styles.container} customScroll`}>
        <div className={`${styles.wrapper} ${styles.title}`}>
          <div className={styles.iconWrapper}></div>
          <div className={styles.contentWrapper}>
            <input
              ref={titleRef}
              type="text"
              placeholder="Enter title"
              value={planModal.title}
              onChange={(e) => {
                if (!planModal.editable) {
                  setResponse({ success: false, reason: "This event is view only" });
                } else {
                  setPlanModal((prev) => ({ ...prev, title: e.target.value }));
                }
              }}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faClock} />
            <div className={styles.hoverEl}>
              <p>Select Time</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <DateSelector
              start={planModal.start}
              setStart={(start) => {
                if (!planModal.editable) {
                  setResponse({ success: false, reason: "This event is view only" });
                } else {
                  setPlanModal((prev) => ({ ...prev, start }));
                }
              }}
              end={planModal.end}
              setEnd={(end) => {
                if (!planModal.editable) {
                  setResponse({ success: false, reason: "This event is view only" });
                } else {
                  setPlanModal((prev) => ({ ...prev, end }));
                }
              }}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faFileLines} />
            <div className={styles.hoverEl}>
              <p>Add Description</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <TextEditor
              setDescription={(description) => {
                if (!planModal.editable) {
                  setResponse({ success: false, reason: "This event is view only" });
                } else {
                  setPlanModal((prev) => ({ ...prev, description }));
                }
              }}
              description={planModal.description}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faRepeat} />
            <div className={styles.hoverEl}>
              <p>Repeat</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <DropDownButton
              options={{
                "0": "Does not repeat",
                "1": "Daily",
                "2": "Weekly",
                "3": "Monthly"
              }}
              setValue={(repeat) => {
                if (!planModal.editable) {
                  setResponse({ success: false, reason: "This event is view only" });
                } else {
                  setPlanModal((prev) => ({ ...prev, repeat }));
                }
              }}
              value={planModal.repeat}
            />
          </div>
        </div>
        {planModal.editable ?
          <div className={styles.wrapper}>
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon icon={faBook} />
              <div className={styles.hoverEl}>
                <p>Select Subject</p>
              </div>
            </div>
            <div className={styles.contentWrapper}>
              <div className={styles.subjectWrapper}>
                <DropDownButton
                  options={subjects.reduce((acc, subject) => {
                    const { name, id } = subject;
                    acc[id] = name;
                    return acc;
                  }, {})}
                  setValue={(subject) => {
                    if (!planModal.editable) {
                      setResponse({ success: false, reason: "This event is view only" });
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
                  name={"Add Subject"}
                  setClicked={() => {
                    setIsAddSubjectModal(true);
                    const tutorial = searchParams.get("tutorial");
                    if (tutorial === "3") {
                      setSearchParams({...searchParams, tutorial: 4})
                    }
                  }}
                  delay={-1}
                  id="tutorial-3"
                />
              </div>
            </div>
          </div>
          : null
        }
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faBell} />
            <div className={styles.hoverEl}>
              <p>Select Notification</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.notificationWrapper}>
              <DropDownButton
                options={{
                  "-1": "no notification",
                  "5": "5 minutes before",
                  "10": "10 minutes before",
                  "30": "30 minutes before",
                  "60": "1 hour before"
                }}
                setValue={(notification) => {
                  setPlanModal((prev) => ({ ...prev, notification }));
                }}
                value={planModal.notification}
                onClick={() => {
                  requestNotification();
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faCircleExclamation} />
            <div className={styles.hoverEl}>
              <p>Select Importance</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
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
          </div>
        </div>
        <div className={styles.submit} ref={submitRef}>
          <BlobBtn
            name={"SUBMIT"}
            setClicked={() => {
              submit();
            }}
            id="tutorial-5"
          />
        </div>
      </div>
    </div>
  );
}

export default EventModal;