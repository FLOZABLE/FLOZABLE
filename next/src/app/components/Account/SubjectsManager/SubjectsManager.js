import React, { useCallback, useContext } from "react";
import { useState, useEffect } from 'react';
import styles from "./SubjectsManager.module.css";
import SubjectManager from "../SubjectManager/SubjectManager";
import styled from '@emotion/styled';
import config from "@/app/utils/config";
import { ResponseContext, SubjectsContext } from "@/app/utils/Contexts";
import { subjectIcons } from "@/app/utils/Constant";

function SubjectsManager() {
  const { subjects, setSubjects } = useContext(SubjectsContext);
  const { setResponse } = useContext(ResponseContext);

  const [selectedSubject, setSelectedSubject] = useState({
    submit: false,
    color: null,
    icon: null,
    name: null,
    id: null,
    tools: []
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
        tools
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          console.log("updating");
          let tempState = [...subjects];
          let updatedSubject = tempState.find((subject) => subject.id === data.subjectInfo.id);
          tempState = tempState.filter((subject) => subject.id !== data.subjectInfo.id);
          updatedSubject = {
            ...updatedSubject,
            color: data.subjectInfo.color,
            icon: data.subjectInfo.icon,
            name: data.subjectInfo.name,
            tools: data.subjectInfo.tools,
          }
          let newState = subjects;
          // Using {...subjects} results in an error because it would then be an object
          // and no longer have the .reduce() function from Array
          tempState.push(updatedSubject);
          for (let i = 0; i < tempState.length; i++) {
            newState[i] = tempState[i];
          }
          console.log(newState);
          setSubjects(newState);
        };
        setSelectedSubject(prev => ({ ...prev, submit: false }))
      })
      .catch((error) => console.error(error));
  }, [selectedSubject]);

  const restoreSubject = useCallback((subjectId, subjectName) => {
    fetch(`${config.server}/study/restore-subject`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId
        })
      }).then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setResponse({ success: true, msg: `Restored Subject ${subjectName}` });
          setSubjects(subjects.map((subject) => {
            if (subject.id === subjectId) {
              return { ...subject, hidden: -1 };
            }
            return { ...subject };
          }));
        }
      })
  }, [subjects]);

  const deleteSubject = useCallback(() => {
    fetch(`${config.server}/study/delete-subject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: selectedSubject.id
        }),
      }).then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubjects(subjects.map((subject) => {
            if (subject.id === selectedSubject.id) {
              return { ...subject, hidden: data.deleteTime };
            }
            return { ...subject };
          }));
          setSelectedSubject({ submit: false, color: null, icon: null, name: null, id: null, tools: [] })
        }
      })
  }, [selectedSubject]);

  return (
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
                subjects.filter((s) => s.hidden === -1).map((subject, i) => {

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

            <br /> <br />

            {
              subjects.filter((s) => s.hidden > 0).length ?
                <div>
                  <h2>Deleted Subjects</h2>
                  <br />
                  <table>
                    <tbody>
                      {
                        subjects.filter((s) => s.hidden > 0).map((subject, i) => {
                          return (
                            <tr key={i}>
                              <td>
                                <i style={{ color: subject.color, width: "5rem", height: '5rem' }}>
                                  {subjectIcons[subject.icon]}
                                </i>
                              </td>
                              <td className={styles.restoreSubjectName}>
                                {subject.name}
                              </td>
                              <td className={styles.restoreSubjectBtn} onClick={() => { restoreSubject(subject.id, subject.name) }}>
                                Restore
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
                :
                null
            }
          </div>
      }
    </div>
  );
}

export default SubjectsManager;