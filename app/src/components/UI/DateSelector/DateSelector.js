import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers';
import { StyledEngineProvider } from '@mui/material/styles';
import { DateTime } from "luxon";
import { deDE } from '@mui/x-date-pickers/locales';
import "./DateSelector.css";


export default function DateSelector(props) {
  return (
    <div className="DateSelector">
      <StyledEngineProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}
          localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
        >
          <div className="selectorWrapper">
            <div className="DateWrapper inputWrapper">
            <DatePicker value={DateTime.fromMillis(props.viewDate.getTime())}
              format="MMM, dd"
            />
            <div className="hoverEl">
              Start Date
            </div>
            </div>
            <div className="startWrapper inputWrapper">
              <TimePicker className='timeStart'
                slotProps={{ textField: { placeholder: 'Start Time' } }}
                value={DateTime.fromMillis(props.startTime.getTime())}
              />
              <div className="hoverEl">
                Start Time
              </div>
            </div>
            <div className='stopWrapper inputWrapper'>
              <TimePicker className='timeStop'
                slotProps={{ textField: { placeholder: 'Stop Time' } }}
                value={DateTime.fromMillis(props.stopTime.getTime())}
                
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
