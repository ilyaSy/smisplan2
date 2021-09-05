import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import CustomIcon from '../../../SharedComponents/CustomIcon';
import './PopupConfirmChoice.css';

// Standart dialog: confirm with choice
function PopupConfirmChoice(props) {
  const { id, action, actionName, class: className } = props;
  const [open, setOpen] = React.useState(false);
  const [choice, setChoice] = React.useState(0);
  const [options, setOptions] = React.useState([]);

  React.useEffect(() => {
    if (open) setOptions(props.options());
  }, [open, props]);

  const handleOk = () => {
    action(id, choice);
    setOpen(false);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const handleChange = (event) => {
    const value = /^\d+$/.test(event.target.value)
      ? parseInt(event.target.value, 10)
      : event.target.value;
    setChoice(value);
  };

  return (
    <>
      <CustomIcon class={className} tip={actionName} action={handleOpen} />

      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="dialog-title" fullWidth>
        <DialogTitle id="dialog-title">Вы подтверждаете действие: {actionName} ?</DialogTitle>
        <DialogContent>
          <span className="popup-confirm-choice__content">Действие невозможно отменить!</span>

          <RadioGroup
            aria-label="choice"
            name="choice"
            value={choice}
            onChange={handleChange}
            className="popup-confirm-choice__radio-group"
          >
            {options.map((item) => (
              <FormControlLabel
                key={`modal-choice-${item.value}`}
                value={item.value}
                control={<Radio />}
                label={item.name}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions className="popup-confirm-choice__actions">
          <Button
            variant="outlined"
            onClick={handleOk}
            color="primary"
            className="MuiButton-outlinedOk"
            startIcon={<CheckIcon />}
          >
            Да
          </Button>
          <Button variant="outlined" onClick={handleClose} color="secondary" startIcon={<CloseIcon />}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(PopupConfirmChoice);
