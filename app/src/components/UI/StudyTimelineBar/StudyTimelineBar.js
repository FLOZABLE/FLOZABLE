import React, { useState, useEffect } from 'react';
import styles from "./StudyTimelineBar.module.css";
import Timeline, { TimelineMarkers, TodayMarker, TimelineHeaders, DateHeader, CustomHeader } from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';
import { DateTime } from 'luxon';

function StudyTimelineBar({ events, setPlanModal }) {

  const groups = [{ id: 1, title: 'Events' }]
  const [items, setItems] = useState([]);

  function openModal(event){
    setPlanModal({ ...event, opened: true });
  }

  useEffect(() => {
    console.log(events);
    const tempItems = events.map((event, i) => {
      return {
        id: i,
        group: 1,
        canResize: false,
        canMove: false,
        title: event.title,
        start_time: event.start.getTime(),
        end_time: event.end.getTime(),
        itemProps: {
          onDoubleClick: () => { openModal(event) },
          style: {
            background: event.backgroundColor,
            textAlign: 'center',
            fontSize: '1rem',
            zIndex: event.completed ? 0 : event.priority,
            textDecoration: event.completed ? "line-through" : ""
          }
        }
      }
    });
    setItems(tempItems);
  }, [events])

  return (
    <div className={styles.StudyTimelineBar}>
      <Timeline
        groups={groups}
        items={items}
        timeSteps={{
          day: 1,
          hour: 1,
          minute: 5,
          second: 1,
        }}
        defaultTimeStart={DateTime.now().startOf('hour').toMillis()}
        defaultTimeEnd={DateTime.now().endOf('hour').toMillis()}
        minZoom={60 * 1000}
        maxZoom={24 * 60 * 60 * 1000}
        traditionalZoom={true}
        sidebarWidth={0}
        lineHeight={parseFloat(getComputedStyle(document.documentElement).fontSize) * 3}
      >
        <TimelineHeaders style={{ background: "rgba(0,0,0,0)", border: "0px solid black" }}>
          <CustomHeader height={30} headerData={{ someData: 'data' }} unit="minute" style={{ transform: "translate(0px, 500px)" }}>
            {({
              headerContext: { intervals },
              getRootProps,
              getIntervalProps,
              showPeriod,
              data,
            }) => {
              return (
                <div {...getRootProps()}>
                  {intervals.map(interval => {
                    if (intervals.length > 70) {
                      if (interval.startTime.format("mm") !== "00") {
                        return <div />
                      }
                    }
                    const intervalStyle = {
                      lineHeight: '30px',
                      textAlign: 'center',
                      color: 'white',
                      transform: 'translate(-50%)',
                    }
                    return (
                      <div
                        {...getIntervalProps({
                          interval,
                          style: intervalStyle
                        })}
                      >
                        <div className="sticky">
                          {interval.startTime.format('h:mm A')}
                          {interval.intervalText}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }}
          </CustomHeader>
        </TimelineHeaders>
        <TimelineMarkers>
          <TodayMarker interval={5000}>
            {
              ({ styles, date }) => {
                return <div style={{ ...styles, zIndex: 100, width: '0.5rem', backgroundColor: 'rgba(255, 0, 0, 0.7)' }} />
              }
            }
          </TodayMarker>
        </TimelineMarkers>
      </Timeline>
    </div>
  )
}

export default StudyTimelineBar;