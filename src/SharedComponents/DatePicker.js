import React from 'react';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/ru';

export default function DateTimePicker(props) {
  const [value, setValue] = React.useState(props?.value);
  const fullWidth = !props.fullWidth === 'no';
  const onChange = (e) => {
    setValue(e._d);
    props.onChange(e._d);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker
        format="YYYY-MM-DD"
        fullWidth={fullWidth}
        margin="normal"
        onChange={onChange}
        value={value}
        style={props.style}
      />
    </MuiPickersUtilsProvider>
  );
}
