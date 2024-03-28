import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers";
import { StyledEngineProvider } from "@mui/material/styles";
import { DateTime } from "luxon";
import { deDE } from "@mui/x-date-pickers/locales";
//import "./DateSelector.css";
import React from 'react';
import styled from "@emotion/styled";

const StyleWrapper = styled.div`
.DateSelector .selectorWrapper {
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100%;
}

.DateSelector .selectorWrapper fieldset {
  border: none;
}

.DateSelector .selectorWrapper .timeStart input {
  width: 5rem;
}

.DateSelector .selectorWrapper .timeStop input {
  width: 5rem;
}

.DateSelector .DateWrapper input {
  width:  3.75rem;
}

.DateSelector .selectorWrapper .inputWrapper:hover .hoverEl {
  opacity: 1;
  visibility: visible;
}

.DateSelector .selectorWrapper .hoverEl {
  z-index: 2;
  position: absolute;
  transition: opacity .3s ease-in-out, visibility .3s ease-in-out;
  background-color: #000000C0;
  opacity: 0;
  width: fit-content;
  border-radius: 1.25rem;
  height: 1.25rem;
  padding: 0em 1.25rem;
  font-size: 0.938rem;
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: hidden;
  color: #fff;
  pointer-events: none;
  white-space: nowrap;
  top: 2.5rem;
}

.DateSelector ul.MuiMultiSectionDigitalClock-root {
  width:  3.75rem !important;
}

.DateSelector ul.MuiMultiSectionDigitalClock-root::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, 0.3);
  border-radius: 0.625rem;

}

.DateSelector ul.MuiMultiSectionDigitalClock-root::-webkit-scrollbar {
  width: 0.75rem;

}

.DateSelector ul.MuiMultiSectionDigitalClock-root::-webkit-scrollbar-thumb {
  border-radius: 0.625rem;
  -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, .3);
  background-color: #555555;
}

.DateSelector .MuiInputBase-formControl {
  padding-right: 0rem;
}

.DateSelector .MuiInputAdornment-root.MuiInputAdornment-positionEnd {
  margin-left: 0rem;
}

@media (max-width: 1300px) {
  .DateSelector .MuiButtonBase-root.MuiIconButton-root {
    padding: 0rem;
  }
}
`;

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
    <StyleWrapper>
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
    </StyleWrapper>
  );
}