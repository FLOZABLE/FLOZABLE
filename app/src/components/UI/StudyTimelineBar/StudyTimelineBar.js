import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from "./StudyTimelineBar.module.css";
import Timeline, { TimelineMarkers, TodayMarker, TimelineHeaders, DateHeader, CustomHeader } from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';
import { DateTime } from 'luxon';
import styled from "@emotion/styled";

const StyleWrapper = styled.div`
  .react-calendar-timeline .rct-horizontal-lines .rct-hl-even,
  .react-calendar-timeline .rct-horizontal-lines .rct-hl-odd {
    border: 1px solid #bbb;
    background-color: #ffffffd0;
  }

  .react-calendar-timeline .rct-outer {
    border-bottom-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
  }

  .react-calendar-timeline .rct-header-root {
    transform: translate(0px, 200%);
  }

  .react-calendar-timeline .rct-items .rct-item {
    top: 0px !important;
    height: 3rem !important;
    border: transparent !important;
    line-height: 1.5rem !important;
    color: black !important;
  }

  .react-calendar-timeline .rct-vertical-lines {
    border: 0.125rem rgb(63, 61, 61) !important;
  }
`;

function StudyTimelineBar({ events, setPlanModal }) {

  const groups = [{ id: 1, title: 'Events' }]
  const [items, setItems] = useState([]);
  const timelineRef = useRef();

  function openModal(eventObj) {
    eventObj.opened = true;
    console.log(eventObj)
    setPlanModal({ ...eventObj });
  }


  useEffect(() => {
    console.log(events);
    const tempItems = events.map((event, i) => {
      return {
        id: i,
        group: 1,
        canResize: false,
        canMove: false,
        title: <div>{event.title}<br/>{DateTime.fromMillis(event.start.getTime()).toFormat("hh:mm")} - {DateTime.fromMillis(event.end.getTime()).toFormat("hh:mm")}</div>,
        start_time: event.start.getTime(),
        end_time: event.end.getTime(),
        height: 100,
        itemProps: {
          onDoubleClick: () => { openModal(event) },
          style: {
            background: event.backgroundColor ? event.backgroundColor : 'rgb(159, 225, 231)',
            textAlign: 'center',
            fontSize: '1rem',
            zIndex: event.completed ? 0 : event.priority ? event.priority + 100 : 99,
            textDecoration: event.completed ? "line-through" : "",
          }
        }
      }
    });
    setItems(tempItems);
  }, [events]);

  const zoomTimeline = useCallback((e) => {
    const movement = e.nativeEvent.deltaY;
    console.log(movement)
    if (movement > 5) {
      timelineRef.current.changeZoom(1.2);
    }
    else if (movement < -5){
      timelineRef.current.changeZoom(0.8);
    }
  }, [timelineRef]);

  return (
    <StyleWrapper
      className={styles.StudyTimelineBar}
      onWheel={(e) => { zoomTimeline(e) }}
    >
      <Timeline
        ref={timelineRef}
        groups={groups}
        items={items}
        timeSteps={{
          day: 1,
          hour: 1,
          minute: 60,
          second: 1,
        }}
        defaultTimeStart={DateTime.now().minus({ hours: 1 }).toMillis()}
        defaultTimeEnd={DateTime.now().plus({ hours: 1 }).toMillis()}
        minZoom={60 * 1000}
        maxZoom={24 * 60 * 60 * 1000}
        sidebarWidth={0}
        lineHeight={parseFloat(getComputedStyle(document.documentElement).fontSize) * 3}
      >
        <TimelineHeaders style={{ background: "rgba(0,0,0,0)", border: "0px solid black" }} className={styles.timeView}>
          <CustomHeader height={parseFloat(getComputedStyle(document.documentElement).fontSize) * 3} headerData={{ someData: 'data' }} unit="hour" >
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
                          {interval.startTime.format('h A')}
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
                return <div style={{ ...styles, zIndex: 250, width: '0.2rem', backgroundColor: 'brown' }} />
              }
            }
          </TodayMarker>
        </TimelineMarkers>
      </Timeline>
    </StyleWrapper>
  )
}

export default StudyTimelineBar;