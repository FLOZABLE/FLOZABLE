import { useSubjects } from "@/Hooks/subjectsHooks";
import styles from "./SubjectsTimeline.module.css";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { IconBook } from "@/app/utils/Svg";
import { useInView } from "react-intersection-observer";
import { secondConverter } from "@/app/utils/Tool";

const pageLength = 20;

export default function SubjectsTimeline({ viewDate }) {
  const { subjects } = useSubjects();
  const { ref, inView } = useInView();
  const { ref: bottomTimelineRef, inView: inViewBottomTimeline } = useInView();
  const [page, setPage] = useState(1);

  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (!viewDate) return;

    const isoDate = DateTime.fromJSDate(viewDate).toISODate();
    const timeline = [];
    subjects.map((subject) => {
      const day = subject.day.timeline.find((day) => day.date === isoDate);
      if (!day) return;
      const subjectTimeline = day.data.map((data) => {
        const start = DateTime.fromSeconds(data[0]).toLocaleString(
          DateTime.TIME_SIMPLE
        );
        const end = DateTime.fromSeconds(data[1]).toLocaleString(
          DateTime.TIME_SIMPLE
        );

        const duration = secondConverter({
          sec: data[1] - data[0],
          options: ["seconds", "minutes", "hours"],
        });

        return {
          name: subject.name,
          subject_id: subject.subject_id,
          color: subject.color,
          start,
          end,
          duration,
          data,
        };
      });
      timeline.push(...subjectTimeline);
    });
    timeline.sort((a, b) => a.data[0] - b.data[0]);
    setTimeline(timeline);
    setPage(1);
  }, [subjects, viewDate]);

  useEffect(() => {
    if (!inViewBottomTimeline) return;

    setPage((prev) => prev + 1);
  }, [inViewBottomTimeline]);

  return (
    <div className={`Box ${styles.SubjectsTimeline}`} ref={ref}>
      <div className="header">Study Timeline</div>
      {timeline.length ? (
        <div className={`${styles.timeline} customScroll`}>
          <VerticalTimeline>
            {timeline.slice(0, page * pageLength).map((data, i) => {
              return (
                <VerticalTimelineElement
                  contentStyle={{ background: data.color, color: "#fff" }}
                  contentArrowStyle={{
                    borderRight: `7px solid  ${data.color}`,
                  }}
                  iconStyle={{ background: data.color, color: "#fff" }}
                  icon={<IconBook />}
                  visible={inView}
                  key={i}
                >
                  <div
                    className={styles.element}
                    ref={(el) => {
                      if (
                        i ===
                        timeline.slice(0, page * pageLength).length - 5
                      ) {
                        setTimeout(() => {
                          bottomTimelineRef(el);
                        }, 100);
                      }
                    }}
                  >
                    <h3>{data.name}</h3>
                    <p>
                      {data.start}-{data.end}
                    </p>
                    <p>
                      Studied {data.name} for {data.duration}
                    </p>
                  </div>
                </VerticalTimelineElement>
              );
            })}
          </VerticalTimeline>
        </div>
      ) : (
        <div className={styles.noTimeline}>
          <a href="/dashboard/study">Study to view the timeline</a>
        </div>
      )}
    </div>
  );
}
