import styles from "./StudyHeatMap.module.css";
import { useSubjects } from "@/Hooks/subjectsHooks";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from "react-tooltip";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";
import { DateTime } from "luxon";
import { secondConverter } from "@/app/utils/Tool";
import styled from "@emotion/styled";

const StyleWrapper = styled.div`
  .react-calendar-heatmap .color-scale-0 {
    fill: #d6e685;
  }
  .react-calendar-heatmap .color-scale-1 {
    fill: #8cc665;
  }
  .react-calendar-heatmap .color-scale-2 {
    fill: #44a340;
  }
  .react-calendar-heatmap .color-scale-3 {
    fill: #1e6823;
  }

  .react-calendar-heatmap-weekday-labels {
    transform: translate(0px, 14px) !important;
  }
`;
export default function StudyHeatMap({ viewDate, setViewDate }) {
  const { groupedSubjects } = useSubjects();

  return (
    <div className={styles.StudyHeatMap}>
      <StyleWrapper>
        <CalendarHeatmap
          startDate={DateTime.fromJSDate(viewDate)
            .endOf("year")
            .minus({ year: 1 })
            .toJSDate()}
          endDate={DateTime.fromJSDate(viewDate).endOf("year").toJSDate()}
          /* titleForValue={(value) => "value"} */
          tooltipDataAttrs={(value) => {
            if (!value.date) {
              return null;
            }
            const label = secondConverter(value.count).formattedValue;
            return {
              "data-tooltip-id": "study-heatmap-tooltip",
              "data-tooltip-content": `${label} on ${value.date}`,
              title: "",
            };
          }}
          values={
            groupedSubjects.day?.total.map((day) => ({
              date: day.date,
              count: day.data,
            })) || []
          }
          showWeekdayLabels={true}
          onClick={(value) => {
            console.log(value);
            if (!value.date) return;
            const date = DateTime.fromISO(value.date).toJSDate();
            setViewDate(date);
          }}
          classForValue={(value) => {
            if (!value) {
              return "color-empty";
            }
            return `color-scale-${Math.floor(value.count / 3600)}`;
          }}
        />
        <Tooltip id="study-heatmap-tooltip" />
      </StyleWrapper>
    </div>
  );
}
