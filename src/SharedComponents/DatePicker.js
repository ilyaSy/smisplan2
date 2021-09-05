import React from 'react';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/ru';

export default function DateTimePicker(props) {
  const [value, setValue] = React.useState(props?.value);
  const onChange = (e) => {
    // console.log(e);
    // setValue(e.target.value);
    setValue(e._d);
    props.onChange(e._d);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker
        format="YYYY-MM-DD"
        fullWidth
        margin="normal"
        onChange={onChange}
        value={value}
        // inputRef={(el) => {
        //   this[property] = el;
        // }}
      />
    </MuiPickersUtilsProvider>
  );
}
