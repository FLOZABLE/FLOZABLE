import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers';
import { StyledEngineProvider } from '@mui/material/styles';
import { DateTime } from "luxon";
import { deDE } from '@mui/x-date-pickers/locales';
import "./DateSelector.css";


export default function DateSelector(props) {
  const handleDateChange = (newDate) => {
    const updatedStart = DateTime.fromObject({
      year: newDate.year,
      month: newDate.month,
      day: newDate.day,
      hour: props.start.hour,
      minute: props.start.minute,
    });
    const updatedEnd = DateTime.fromObject({
      year: newDate.year,
      month: newDate.month,
      day: newDate.day,
      hour: props.end.hour,
      minute: props.end.minute,
    });

    props.setStart(updatedStart.toJSDate());
    props.setEnd(updatedEnd.toJSDate());
  };

  const handleStartTimeChange = (newTime) => {
    const updatedStart = DateTime.fromObject({
      year: props.start.year,
      month: props.start.month,
      day: props.start.day,
      hour: newTime.hour,
      minute: newTime.minute,
    });

    props.setStart(updatedStart.toJSDate());
  };


  const handleEndTimeChange = (newTime) => {
    const updatedEnd = DateTime.fromObject({
      year: props.end.year,
      month: props.end.month,
      day: props.end.day,
      hour: newTime.hour,
      minute: newTime.minute,
    });

    props.setEnd(updatedEnd.toJSDate());
  };

  return (
    <div className="DateSelector">
      <StyledEngineProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}
          localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
        >
          <div className="selectorWrapper">
            <div className="DateWrapper inputWrapper">
            <DatePicker value={DateTime.fromMillis(props.start.getTime())}
              format="MMM, dd"
              onChange={handleDateChange}
            />
            <div className="hoverEl">
              Start Date
            </div>
            </div>
            <div className="startWrapper inputWrapper">
              <TimePicker className='timeStart'
                slotProps={{ textField: { placeholder: 'Start Time' } }}
                value={DateTime.fromMillis(props.start.getTime())}
                onChange={handleStartTimeChange}
              />
              <div className="hoverEl">
                Start Time
              </div>
            </div>
            <div className='stopWrapper inputWrapper'>
              <TimePicker className='timeStop'
                slotProps={{ textField: { placeholder: 'Stop Time' } }}
                value={DateTime.fromMillis(props.end.getTime())}
                onChange={handleEndTimeChange}
              />
              <div className="hoverEl">
                Stop Time
              </div>
            </div>
          </div>
        </LocalizationProvider>
      </StyledEngineProvider>
    </div>
  );
}
