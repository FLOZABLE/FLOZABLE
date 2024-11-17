import styles from "./StudyHeatMap.module.css";
import { useSubjects } from "@/Hooks/subjectsHooks";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

export default function StudyHeatMap() {
  const { groupedSubjects } = useSubjects();
  console.log(groupedSubjects, "gg");

  return (
    <div className={styles.StudyHeatMap}>
      <CalendarHeatmap
        startDate={new Date("2016-01-01")}
        endDate={new Date("2016-04-01")}
        titleForValue={(value) => "value"}
        tooltipDataAttrs={(value) => {
          return {
            "data-tip": `${value.date} has count: ${value.count}`,
          };
        }}
        values={[
          { date: "2016-01-01", count: 12 },
          { date: "2016-01-22", count: 122 },
          { date: "2016-01-30", count: 38 },
          // ...and so on
        ]}
        showWeekdayLabels={true}
        onClick={value => alert(`Clicked on value with count: ${value.count}`)}
      />
    </div>
  );
}
