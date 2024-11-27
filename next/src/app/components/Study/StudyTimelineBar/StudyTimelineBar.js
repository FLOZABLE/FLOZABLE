import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import styles from "./StudyTimelineBar.module.css";
import { DateTime } from "luxon";
import styled from "@emotion/styled";
import { PlanModalContext, PlansContext } from "@/app/utils/Contexts";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timelinePlugin from "@fullcalendar/timeline";

const StyleWrapper = styled.div`
  table {
  }
`;

function StudyTimelineBar() {
  const { setPlanModal } = useContext(PlanModalContext);
  const { plans } = useContext(PlansContext);
  useEffect(() => {}, [plans]);

  return (
    <StyleWrapper className={styles.StudyTimelineBar}>
      {/* {[...Array(24)].map((_, i) => {
        return (
          <div className={styles.hour} key={i}>
            {i}
          </div>
        );
      })} */}
      <FullCalendar
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        height={"100%"}
        slotMinWidth={200}
        plugins={[timelinePlugin]}
        events={plans}
        headerToolbar={false}
        initialView="timelineDay"
        slotDuration="01:00:00" // 1-hour slots
        initialDate="2024-11-26" //
        over
      />
    </StyleWrapper>
  );
}

export default StudyTimelineBar;
