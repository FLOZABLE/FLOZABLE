import React, { useCallback, useContext } from "react";
import { useState, useEffect } from "react";
import styles from "./SubjectsManager.module.css";
import SubjectManager from "../SubjectManager/SubjectManager";
import config from "@/app/utils/config";
import { ResponseContext, SubjectsContext } from "@/app/utils/Contexts";
import { subjectIcons } from "@/app/utils/Constant";
import { Alert } from "@/app/utils/Svg";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";

function SubjectsManager() {
  const { subjects, setSubjects, bringSubjects } = useContext(SubjectsContext);
  const { setResponse } = useContext(ResponseContext);

  const [selectedSubject, setSelectedSubject] = useState({
    submit: false,
    color: null,
    icon: null,
    name: null,
    id: null,
    tools: [],
  });

  useEffect(() => {
    if (!selectedSubject || !selectedSubject.submit) return;

    const { id, icon, color, name, tools } = selectedSubject;
    fetch(`${config.server}/study/modify-subject`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        color,
        icon,
        id,
        tools,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          console.log("updating");
          let tempState = [...subjects];
          let updatedSubject = tempState.find(
            (subject) => subject.id === data.subjectInfo.id
          );
          tempState = tempState.filter(
            (subject) => subject.id !== data.subjectInfo.id
          );
          updatedSubject = {
            ...updatedSubject,
            color: data.subjectInfo.color,
            icon: data.subjectInfo.icon,
            name: data.subjectInfo.name,
            tools: data.subjectInfo.tools,
          };
          let newState = subjects;
          // Using {...subjects} results in an error because it would then be an object
          // and no longer have the .reduce() function from Array
          tempState.push(updatedSubject);
          for (let i = 0; i < tempState.length; i++) {
            newState[i] = tempState[i];
          }
          console.log(newState);
          setSubjects(newState);
        }
        setSelectedSubject((prev) => ({ ...prev, submit: false }));
      })
      .catch((error) => console.error(error));
  }, [selectedSubject]);

  const deleteSubject = useCallback(() => {
    fetch(`${config.server}/study/subject`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectId: selectedSubject.id,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          bringSubjects();
        }
      });
  }, [selectedSubject]);

  /* return (
    <div className={`${styles.SubjectsManager} customScroll`}>
      {
        selectedSubject.id !== null ?
          <div>
            <SubjectManager
              subject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedSubject={selectedSubject}
              deleteSubject={deleteSubject}
            />
          </div>
          :
          <div>
            <div className={styles.SubjectSelector}>
              {
                subjects.map((subject, i) => {

                  const StyleWrapper = styled.div`
                    div {
                      background-color: ${subject.color};
                      transition: 0.3s;
                    }
                    div:hover {
                      box-shadow: 5px 5px 5px rgb(100,100,100);
                      cursor: pointer;
                    }
                  `;

                  return (
                    <StyleWrapper key={i}>
                      <div className={styles.iconContainer} onClick={() => { setSelectedSubject(subject) }}>
                        <i style={{ color: subject.color, width: "5rem", height: '5rem' }}>
                          {subjectIcons[subject.icon]}
                        </i>
                        <br />
                        {subject.name}
                      </div>
                    </StyleWrapper>
                  )
                })
              }
            </div>
          </div>
      }
    </div>
  ); */

  return (
    <div className={`customScroll ${styles.SubjectsManager}`}>
      {selectedSubject.id !== null ? (
        <SubjectManager
          subject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedSubject={selectedSubject}
          deleteSubject={deleteSubject}
        />
      ) : (
        <div className={styles.subjectSelector}>
          {subjects.map((subject, i) => {
            let icon = subjectIcons[subject.icon];

            if (!icon) {
              icon = <Alert />;
            }

            return (
              <div key={i} className={styles.subject}>
                <BlobBtn
                  color2={subject.color}
                  onClick={() => {
                    setSelectedSubject(subject);
                  }}
                  style={{width: '100%', display: 'flex', justifyContents: 'center'}}
                >
                  <i>{icon}</i>
                  <div className={`overflowDot ${styles.name}`}>{subject.name}</div>
                </BlobBtn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SubjectsManager;
