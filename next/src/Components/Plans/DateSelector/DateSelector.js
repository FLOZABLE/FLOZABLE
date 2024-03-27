import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers";
import { StyledEngineProvider } from "@mui/material/styles";
import { DateTime } from "luxon";
import { deDE } from "@mui/x-date-pickers/locales";
import "./DateSelector.css";
import React from 'react';

export default function DateSelector({ start, setStart, end, setEnd }) {
  const handleDateChange = (newDate) => {
    const updatedStart = DateTime.fromObject({
      year: newDate.year,
      month: newDate.month,
      day: newDate.day,
      hour: start.getHours(),
      minute: start.getMinutes(),
    });
    const updatedEnd = DateTime.fromObject({
      year: newDate.year,
      month: newDate.month,
      day: newDate.day,
      hour: end.getHours(),
      minute: end.getMinutes(),
    });

    setStart(updatedStart.toJSDate());
    setEnd(updatedEnd.toJSDate());
  };

  const handleStartTimeChange = (newTime) => {
    const newTimeTs = new Date(newTime.ts);
    const updatedStart = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      newTimeTs.getHours(),
      newTimeTs.getMinutes(),
    );
    setStart(updatedStart);
  };

  const handleEndTimeChange = (newTime) => {
    const newTimeTs = new Date(newTime.ts);
    const updatedEnd = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      newTimeTs.getHours(),
      newTimeTs.getMinutes(),
    );

    setEnd(updatedEnd);
  };

  return (
    <div className="DateSelector">
      <StyledEngineProvider>
        <LocalizationProvider
          dateAdapter={AdapterLuxon}
          localeText={deDE.components.MuiLocalizationProvider.defaultlocaleText}
        >
          <div className="selectorWrapper">
            <div className="DateWrapper inputWrapper">
              <DatePicker
                value={DateTime.fromMillis(start.getTime())}
                format="MMM, dd"
                onChange={handleDateChange}
              />
              <div className="hoverEl">Start Date</div>
            </div>
            <div className="startWrapper inputWrapper">
              <TimePicker
                className="timeStart"
                slotProps={{ textField: { placeholder: "Start Time" } }}
                value={DateTime.fromMillis(start.getTime())}
                onChange={handleStartTimeChange}
              />
              <div className="hoverEl">Start Time</div>
            </div>
            <div className="stopWrapper inputWrapper">
              <TimePicker
                className="timeStop"
                slotProps={{ textField: { placeholder: "End Time" } }}
                value={DateTime.fromMillis(end.getTime())}
                onChange={handleEndTimeChange}
              />
              <div className="hoverEl">End Time</div>
            </div>
          </div>
        </LocalizationProvider>
      </StyledEngineProvider>
    </div>
  );
}