import React from 'react';
import { Dialog, DialogTitle, DialogActions, TextField, DialogContent, Button } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import CustomIcon from '../../SharedComponents/CustomIcon';

function PopupEditFullText({ id, property, text, action, class: className, value, metaData }) {
  const [open, setOpen] = React.useState(false);
  const [fullText, setFullText] = React.useState(text);

  const handleOk = () => {
    if (text !== fullText) {
      action(id, property, fullText);
    } else {
      console.log('Изменений внесено не было');
    }

    setOpen(false);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => setFullText(e.target.value);

  return (
    <>
      <CustomIcon class={className} tip="Изменить" action={handleOpen} />

      <Dialog open={open} onClose={handleClose} aria-labelledby="dialog-title" fullWidth>
        <DialogTitle id="dialog-title">{value || metaData.dataTable[property].value}</DialogTitle>
        <DialogContent>
          <TextField value={fullText} onChange={handleChange} fullWidth multiline />
        </DialogContent>
        <DialogActions style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleOk}
            color="primary"
            className="MuiButton-outlinedOk"
            startIcon={<CheckIcon />}
          >
            Принять изменения
          </Button>
          <Button variant="contained" onClick={handleClose} color="secondary" startIcon={<CloseIcon />}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(PopupEditFullText);
