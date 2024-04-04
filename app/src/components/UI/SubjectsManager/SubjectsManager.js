import React, { useCallback } from "react";
import { useState, useEffect } from 'react';
import styles from "./SubjectsManager.module.css";
import SubjectManager from "../SubjectManager/SubjectManager";
import SubjectIcon from "../SubjectIcon/SubjectIcon";
import styled from '@emotion/styled';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SubjectsManager({ subjects, setSubjects, setResponse }) {
  const [selectedSubject, setSelectedSubject] = useState({
    submit: false,
    color: null,
    icon: null,
    name: null,
    id: null,
    tools: []
  });

  useEffect(() => {
    console.log("Subjects", subjects);
    if (!selectedSubject || !selectedSubject.submit) return;

    const { id, icon, color, name, tools } = selectedSubject;
    fetch(`${serverOrigin}/study/modify-subject`, {
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
          /* let newState = [...subjects];
          newState = newState.filter((subject) => subject.id != data.subjectInfo.id);
          newState.push({ ...data.subjectInfo });
          setSubjects(newState); */
          //clear new subject info from modal
        };
        setSelectedSubject(prev => ({ ...prev, submit: false }))
      })
      .catch((error) => console.error(error));
  }, [selectedSubject]);

  const restoreSubject = useCallback((subjectId, subjectName) => {
    fetch(`${process.env.REACT_APP_ORIGIN}/study/restore-subject`,
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
          setResponse({success: true, msg: `Restored Subject ${subjectName}`});
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
    fetch(`${process.env.REACT_APP_ORIGIN}/study/delete-subject`,
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
                        <SubjectIcon name={subject.icon} width="5rem" height="5rem" fill="black" opt1={subject.color} />
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
                                <SubjectIcon name={subject.icon} width="1rem" height="1rem" fill="black" opt1={subject.color} />
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