import React from 'react';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/ru';

export default function DateTimePicker(props) {
  const [value, setValue] = React.useState(props?.value);
  const onChange = (e) => {
    setValue(e._d);
    props.onChange(e._d);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardTimePicker
        format="HH:mm"
        fullWidth
        margin="normal"
        ampm={false}
        minutesStep={5}
        onChange={onChange}
        value={value}
      />
    </MuiPickersUtilsProvider>
  );
}
