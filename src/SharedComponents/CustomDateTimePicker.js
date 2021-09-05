import DateTimePicker from './DateTimePicker';
import TimePicker from './TimePicker';
import DatePicker from './DatePicker';

export default function CustomDateTimePicker(props) {
  return (
    <>
      {props.type === 'datetime' && <DateTimePicker {...props} />}
      {props.type === 'date' && <DatePicker {...props} />}
      {props.type === 'time' && <TimePicker {...props} />}
    </>
  );
}
