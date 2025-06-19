import { calendar_v3 } from 'googleapis';

import { Plan } from '../types/planTypes';

export function formatPlan(
  calendar: calendar_v3.Schema$CalendarListEntry,
  event: calendar_v3.Schema$Event,
): Plan {
  const isAllDay = !!event.start?.date;
  const editable =
    calendar.accessRole === 'owner' || calendar.accessRole === 'writer';

  return {
    id: event.id || '(no-id)',
    title: event.summary || '(No Title)',
    description: event.description || '',
    html_link: event.htmlLink || '',
    start: isAllDay
      ? event.start?.date || undefined
      : event.start?.dateTime || undefined,
    end: isAllDay
      ? event.end?.date || undefined
      : event.end?.dateTime || undefined,
    all_day: isAllDay,
    background_color: calendar.backgroundColor,
    calendar_id: calendar.id || '(no-calendar-id)',
    editable,
  };
}
