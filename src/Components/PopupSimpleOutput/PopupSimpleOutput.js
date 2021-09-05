import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import './PopupSimpleOutput.css';

// Standart dialog: just modal popup with text
function PopupSimpleOutput({ isOpened, onClose, title, format, text }) {
  return (
    <Dialog open={isOpened} onClose={onClose} aria-labelledby="dialog-title" fullWidth>
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <DialogContent>
        {format &&
          format === 'listOfData' &&
          text.split('\n').map((rowData) => {
            const [dataTitle, dataValue] = rowData.split(';');
            return (
              <div
                key={`simpleOutputDialog-field-${dataTitle}`}
                className="popup-simple-output__content"
              >
                <div className="popup-simple-output__title">{dataTitle}:</div>
                <div className="popup-simple-output__info">{dataValue}</div>
              </div>
            );
          })}
        {!format && <span className="popup-simple-output__text">{text}</span>}
      </DialogContent>
      <DialogActions className="popup-simple-output__actions">
        <Button variant="outlined" onClick={onClose} color="secondary" startIcon={<CloseIcon />}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(PopupSimpleOutput);
