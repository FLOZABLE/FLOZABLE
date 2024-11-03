"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import styles from "./SubjectsModal.module.css";
import { ModalsContext, SubjectsContext } from "@/app/utils/Contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faShare,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import SubjectsManager from "../../Subjects/SubjectsManager/SubjectsManager";
import CustomInput from "../../Inputs/CustomInput/CustomInput";
import ColorPalette from "../../Inputs/ColorPalette/ColorPalette";
import { BackArrow } from "@/app/utils/Svg";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import Draggable from "react-draggable";
import {
  deleteSubjectShare,
  deleteSubjectsSubject,
  patchSubjectsSubject,
  postSubjectShare,
} from "@/Api/subjectsApi";
import { useSubjectUsers } from "@/Hooks/subjectsHooks";
import ShareUserBox from "../../Users/ShareUserBox/ShareUserBox";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";

export default function SubjectsModal() {
  const { isSubjectsModal, setIsSubjectsModal, setSearchUsersModal } =
    useContext(ModalsContext);
  const { subjects, setSubjects } = useContext(SubjectsContext);

  const [subject, setSubject] = useState({
    name: "",
    color: null,
    subject_id: null,
  });
  const [share, setShare] = useState([]);
  const [shared, setShared] = useState([]);
  const [isSelectColor, setIsSelectColor] = useState(false);

  const { subjectUsersData, subjectUsersIsLoading, clearSubjectUsers } =
    useSubjectUsers(subject.subject_id);

  const modalRef = useRef(null);

  useEffect(() => {
    if (!isSubjectsModal?.subject_id || !subjects) return;

    const subject = subjects.find(
      (subject) => subject.subject_id === isSubjectsModal.subject_id
    );

    if (!subject) return;

    const { name, color, subject_id } = subject;
    setSubject({ name, color, subject_id });
  }, [isSubjectsModal, subjects]);

  useEffect(() => {
    if (!subjectUsersData?.success) return;

    const { share, shared } = subjectUsersData.data.subject;
    setShare(share);
    setShared(shared);
  }, [subjectUsersData]);

  const onShare = useCallback(
    async (userInfo) => {
      const subjectId = subject.subject_id;
      const users = [userInfo.user_id];
      try {
        const response = await postSubjectShare({ subjectId, users });
        if (!response.success) return;

        const filteredUsers = [userInfo].filter(
          (user) =>
            ![...share, ...shared].find(
              (sharedUser) => sharedUser.user_id === user.user_id
            )
        );
        setShare([...share, ...filteredUsers]);
        clearSubjectUsers();
      } catch (err) {
        console.log(err);
      }
    },
    [subject, share, shared]
  );

  const onSave = useCallback(
    (subject) => {
      (async () => {
        const { subject_id, name, color } = subject;
        const response = await patchSubjectsSubject({
          subjectId: subject_id,
          name,
          color,
        });

        if (!response.success) return;

        const { data } = response;

        const subjectIndex = subjects.findIndex(
          (subject) => subject.subject_id === subject_id
        );

        if (subjectIndex === -1) return;
        const newSubjects = [...subjects];
        newSubjects[subjectIndex] = {
          ...newSubjects[subjectIndex],
          ...data.subject,
        };

        setSubjects(newSubjects);
        setIsSubjectsModal((prev) => ({ ...prev, subject_id: null }));
      })();
    },
    [subjects]
  );

  const onDelete = useCallback(
    async (subject) => {
      try {
        const subjectId = subject.subject_id;

        const response = await deleteSubjectsSubject(subjectId);
        if (!response.success) return;

        setIsSubjectsModal((prev) => ({ ...prev, subject_id: null }));
        const subjectIndex = subjects.findIndex(
          (subject) => subject.subject_id === subjectId
        );

        if (subjectIndex === -1) return;
        const newSubjects = JSON.parse(JSON.stringify(subjects)).filter(
          (subject) => subject.subject_id !== subjectId
        );
        const deletedSubject = subjects.find(
          (subject) => subject.subject_id === subjectId
        );

        const otherSubjectIndex = newSubjects.findIndex(
          (subject) => subject.name === "others"
        );
        if (otherSubjectIndex !== -1 && deletedSubject) {
          newSubjects[otherSubjectIndex].day.total.map(
            (value, i) => (value.data += deletedSubject.day.total[i].data)
          );
          newSubjects[otherSubjectIndex].week.total.map(
            (value, i) => (value.data += deletedSubject.week.total[i].data)
          );
          newSubjects[otherSubjectIndex].month.total.map(
            (value, i) => (value.data += deletedSubject.month.total[i].data)
          );

          newSubjects[otherSubjectIndex].day.timeline.map((value, i) => {
            value.data.push(...deletedSubject.day.timeline[i].data);
            value.data.sort((a, b) => a[0] - b[0]);
          });
          newSubjects[otherSubjectIndex].week.timeline.map((value, i) => {
            value.data.push(...deletedSubject.week.timeline[i].data);
            value.data.sort((a, b) => a[0] - b[0]);
          });
          newSubjects[otherSubjectIndex].month.timeline.map((value, i) => {
            value.data.push(...deletedSubject.month.timeline[i].data);
            value.data.sort((a, b) => a[0] - b[0]);
          });

          newSubjects[otherSubjectIndex].week.focus.map((value, i) => {
            const deletedSubjectFocus = deletedSubject.week.focus[i].data;
            value.data =
              value.data > deletedSubjectFocus
                ? value.data
                : deletedSubjectFocus;
          });
          newSubjects[otherSubjectIndex].month.focus.map((value, i) => {
            const deletedSubjectFocus = deletedSubject.month.focus[i].data;
            value.data =
              value.data > deletedSubjectFocus
                ? value.data
                : deletedSubjectFocus;
          });

          newSubjects[otherSubjectIndex].timeline.push(
            ...deletedSubject.timeline
          );
          newSubjects[otherSubjectIndex].timeline.sort((a, b) => a[0] - b[0]);
        }
        setSubjects(newSubjects);
      } catch (err) {
        console.log(err);
      }
    },
    [subjects]
  );

  const onUnshare = useCallback(
    async (userInfo) => {
      try {
        const targetId = userInfo.user_id;
        const subjectId = subject.subject_id;
        const response = await deleteSubjectShare({ subjectId, targetId });
        if (!response.success) return;

        clearSubjectUsers();
        setShare((prev) => prev.filter((users) => users.user_id !== targetId));
      } catch (err) {
        console.log(err);
      }
    },
    [subject]
  );

  const onUnshared = useCallback(
    async (userInfo) => {
      try {
        const targetId = userInfo.user_id;
        const subjectId = subject.subject_id;
        const response = await deleteSubjectShare({ subjectId, targetId });
        if (!response.success) return;

        clearSubjectUsers();
        setShared((prev) => prev.filter((users) => users.user_id !== targetId));
      } catch (err) {
        console.log(err);
      }
    },
    [subject]
  );

  return (
    <Draggable nodeRef={modalRef} handle=".header">
      <div
        className={`modal ${styles.SubjectsModal} ${
          isSubjectsModal?.opened ? "open" : ""
        }`}
        ref={modalRef}
      >
        <div className={`${styles.header} header`}>
          <i
            onClick={() => {
              setIsSubjectsModal((prev) => ({ ...prev, subject_id: null }));
            }}
          >
            <BackArrow />
          </i>
          <i
            onClick={() => {
              setIsSubjectsModal({ opened: false, subject_id: null });
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <div className={`${styles.contents}`}>
          <div className={`customScroll ${styles.SubjectsManager}`}>
            <SubjectsManager />
          </div>
          <div
            className={`customScroll ${styles.editSubject} ${
              isSubjectsModal?.subject_id ? styles.opened : null
            }`}
          >
            <div className={styles.inputs}>
              <CustomInput
                input={subject.name}
                handleInput={(e) =>
                  setSubject((prev) => ({ ...prev, name: e.target.value }))
                }
                placeHolder={"Subject Name"}
                type={"text"}
              >
                <FontAwesomeIcon icon={faBook} />
              </CustomInput>
              <ColorPalette
                setSelectedColor={(color) => {
                  setSubject((prev) => ({ ...prev, color }));
                }}
                selectedColor={subject.color}
                isSelectColor={isSelectColor}
                setIsSelectColor={setIsSelectColor}
              />
              <div className={styles.share}>
                {subjectUsersIsLoading ? (
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
            </div>
            <div className={styles.buttons}>
              <BlobBtn
                onClick={() => {
                  setSearchUsersModal((prev) => ({
                    opened: !prev.opened,
                    onClick: (userInfo) => {
                      /* setSubject((prev) => ({
                        ...prev,
                        share: [...prev.share, userInfo],
                      })); */
                      //setShare((prev) => [...prev, userInfo]);
                      onShare(userInfo);
                    },
                  }));
                }}
              >
                <FontAwesomeIcon icon={faShare} />
              </BlobBtn>
              <BlobBtn
                onClick={() => {
                  onSave(subject);
                }}
              >
                Save
              </BlobBtn>
              <BlobBtn
                onClick={() => {
                  onDelete(subject);
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </BlobBtn>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
