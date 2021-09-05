import React from 'react';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/ru';

export default function DateTimePicker(props) {
  const [value, setValue] = React.useState();
  const onChange = (e) => {
    setValue(e._d);
    props.onChange(e._d);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDateTimePicker
        format="YYYY-MM-DD HH:mm"
        fullWidth
        ampm={false}
        minutesStep={5}
        margin="normal"
        onChange={onChange}
        value={value}
      />
    </MuiPickersUtilsProvider>
  );
}
