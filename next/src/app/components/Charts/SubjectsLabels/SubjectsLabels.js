import styles from "./SubjectsLabels.module.css";

export default function SubjectsLabels({
  subjects,
  filteredSubjects,
  setFilteredSubjects,
}) {
  return (
    <div className={styles.SubjectsLabels}>
      {subjects.map((subject, i) => {
        return (
          <div
            className={styles.label}
            key={i}
            onClick={() => {
              if (filteredSubjects.includes(subject.subject_id)) {
                setFilteredSubjects(
                  filteredSubjects.filter(
                    (subjectId) => subjectId !== subject.subject_id
                  )
                );
              } else {
                setFilteredSubjects((prev) => [...prev, subject.subject_id]);
              }
            }}
          >
            <p>{subject.name}</p>
          </div>
        );
      })}
      {subjects.map((subject, i) => {
        return (
          <div
            className={styles.label}
            key={i}
            onClick={() => {
              if (filteredSubjects.includes(subject.subject_id)) {
                setFilteredSubjects(
                  filteredSubjects.filter(
                    (subjectId) => subjectId !== subject.subject_id
                  )
                );
              } else {
                setFilteredSubjects((prev) => [...prev, subject.subject_id]);
              }
            }}
          >
            <p>{subject.name}</p>
          </div>
        );
      })}
    </div>
  );
}
