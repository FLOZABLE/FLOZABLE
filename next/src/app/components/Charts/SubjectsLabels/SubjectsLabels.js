import styles from "./SubjectsLabels.module.css";

export default function SubjectsLabels({
  subjects,
  filteredSubjects,
  setFilteredSubjects,
}) {
  return (
    <div className={styles.SubjectsLabels}>
      {subjects?.map((subject, i) => {
        const { subject_id } = subject;
        return (
          <div
            className={`${styles.label} ${
              filteredSubjects.includes(subject_id) ? styles.filtered : null
            }`}
            key={i}
            onClick={() => {
              if (filteredSubjects.includes(subject_id)) {
                setFilteredSubjects(
                  filteredSubjects.filter(
                    (subjectId) => subjectId !== subject_id
                  )
                );
              } else {
                setFilteredSubjects((prev) => [...prev, subject_id]);
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
