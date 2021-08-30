import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import './PopupSimpleOutput.css';

// Standart dialog: just modal popup with text
export default function PopupSimpleOutput(props) {
  return (
    <Dialog
      open={props.isOpened}
      onClose={props.onClose}
      aria-labelledby="dialog-title"
      fullWidth={true}>
      <DialogTitle id="dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        {props.format && props.format === 'listOfData' &&
          props.text.split("\n").map((rowData, index) => {
            let [dataTitle, dataValue] = rowData.split(";");
            return <div key={`simpleOutputDialog-field-${index}`} className="popup-simple-output__content">
              <div className="popup-simple-output__title">{dataTitle}:</div>
              <div className="popup-simple-output__info">{dataValue}</div>
            </div>
          })
        }
        {!props.format &&
          <span className="popup-simple-output__text">{props.text}</span>}
      </DialogContent>
      <DialogActions className="popup-simple-output__actions">
        <Button variant="outlined" onClick={props.onClose} color="secondary"
          startIcon={<CloseIcon />}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  )
}
