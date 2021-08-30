import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import './PopupConfirm.css';

export default function PopupConfirm(props) {
  const handleOk = () => {
    props.action(props.id);
    props.onClose();
  };

  return (
    <Dialog
      open={props.isOpened}
      onClose={props.onClose}
      aria-labelledby="dialog-title"
      fullWidth={true}>
      <DialogTitle id="dialog-title">Вы подтверждаете {props.actionName} ?</DialogTitle>
      <DialogContent>
        {
          props.actionText && 
          <div className="popup-confirm__content">{props.actionText}</div>
        }
        <span className="popup-confirm__content">Действие невозможно отменить!</span>
      </DialogContent>
      <DialogActions className="popup-confirm__actions">
        <Button variant="outlined" onClick={handleOk} color="primary" className="MuiButton-outlinedOk"
          startIcon={<CheckIcon />}>
          Да
        </Button>
        <Button variant="outlined" onClick={props.onClose} color="secondary"
          startIcon={<CloseIcon />}>
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  )
}
