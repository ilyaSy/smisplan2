import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import './PopupConfirm.css';

function PopupConfirm({ id, action, actionName, actionText, isOpened, onClose }) {
  const handleOk = () => {
    action(id);
    onClose();
  };

  return (
    <Dialog open={isOpened} onClose={onClose} aria-labelledby="dialog-title" fullWidth>
      <DialogTitle id="dialog-title">Вы подтверждаете {actionName} ?</DialogTitle>
      <DialogContent>
        {actionText && <div className="popup-confirm__content">{actionText}</div>}
        <span className="popup-confirm__content">Действие невозможно отменить!</span>
      </DialogContent>
      <DialogActions className="popup-confirm__actions">
        <Button
          variant="outlined"
          onClick={handleOk}
          color="primary"
          className="MuiButton-outlinedOk"
          startIcon={<CheckIcon />}
        >
          Да
        </Button>
        <Button variant="outlined" onClick={onClose} color="secondary" startIcon={<CloseIcon />}>
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(PopupConfirm);
