import React, { useState, useEffect } from 'react';
import styles from "./StudyTimelineBar.module.css";
import Timeline, { TimelineMarkers, TodayMarker, TimelineHeaders, DateHeader, CustomHeader } from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';
import { DateTime } from 'luxon';

function StudyTimelineBar({ events }) {

  const groups = [{ id: 1, title: 'group 1' }]

  const items = [
    {
      id: 1,
      group: 1,
      canResize: false,
      canMove: false,
      title: 'item 1',
      start_time: DateTime.now().toMillis(),
      end_time: DateTime.now().plus({ hours: 1 }).toMillis(),
      itemProps: {
        onDoubleClick: () => { console.log('You clicked double!') },
        style: {
          background: 'cornflowerblue',
          textAlign: 'center',
          fontSize: '1rem'
        }
      }
    }
  ]

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
                    if (intervals.length > 70){
                      if (interval.startTime.format("mm") !== "00"){
                        return <div/>
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