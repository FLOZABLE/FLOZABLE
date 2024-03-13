import React, { useState, useEffect } from 'react';
import styles from "./StudyTimelineBar.module.css";
import Timeline, { TimelineMarkers, TodayMarker, TimelineHeaders, DateHeader } from 'react-calendar-timeline';
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
      end_time: DateTime.now().plus({ hours: 1 }).toMillis()
    }
  ]

  return (
    <div>
      <Timeline
        groups={groups}
        items={items}
        timeSteps={{
          day: 1,
          hour: 1,
          minute: 5,
        }}
        defaultTimeStart={DateTime.now().startOf('hour').toMillis()}
        defaultTimeEnd={DateTime.now().endOf('hour').toMillis()}
        minZoom={60 * 1000}
        maxZoom={24 * 60 * 60 * 1000}
      >
        <TimelineMarkers>
          <TodayMarker interval={5000}>
            {
              ({ styles, date }) => {
                return <div style={{ ...styles, zIndex: 100, width: '1px', backgroundColor: 'rgba(255, 0, 0, 0.7)' }} />
              }
            }
          </TodayMarker>
        </TimelineMarkers>
      </Timeline>
    </div>
  )
}

export default StudyTimelineBar;