import styles from "./SubjectsLabels.module.css";

export default function SubjectsLabels({
  subjects,
  filteredSubjects,
  setFilteredSubjects,
}) {
  return (
    <div className={`customScroll ${styles.SubjectsLabels}`}>
      {subjects?.map((subject, i) => {
        const { subject_id } = subject;
        const isFiltered = filteredSubjects.includes(subject_id);
        return (
          <div
            className={`${styles.label} ${isFiltered ? styles.filtered : null}`}
            key={i}
            onClick={() => {
              if (isFiltered) {
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
