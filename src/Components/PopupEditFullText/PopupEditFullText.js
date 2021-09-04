import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  DialogContent,
  Button,
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import { metaData } from '../../config/data';
import CustomIcon from '../../SharedComponents/CustomIcon';

// Standart dialog: edit single property in modal popup
export default class PopupEditFullText extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false, fullText: this.props.text };
  }

  handleOk = () => {
    if (this.props.text !== this.fullText.value) {
      this.props.action(this.props.id, this.props.property, this.fullText.value);
    } else {
      console.log('Изменений внесено не было');
    }

    this.setState({ open: false });
  };

  render() {
    return (
      <>
        <CustomIcon
          class={this.props.class}
          tip="Изменить"
          action={() => this.setState({ open: true })}
        />

        <Dialog
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
          aria-labelledby="dialog-title"
          fullWidth
        >
          <DialogTitle id="dialog-title">
            {this.props.value ? this.props.value : metaData.dataTable[this.props.property].value}
          </DialogTitle>
          <DialogContent>
            <TextField
              defaultValue={this.state.fullText}
              inputRef={(el) => {
                this.fullText = el;
              }}
              fullWidth
              multiline
            />
          </DialogContent>
          <DialogActions
            style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}
          >
            <Button
              variant="outlined"
              onClick={this.handleOk}
              color="primary"
              className="MuiButton-outlinedOk"
              startIcon={<CheckIcon />}
            >
              Принять изменения
            </Button>
            <Button
              variant="contained"
              onClick={() => this.setState({ open: false })}
              color="secondary"
              startIcon={<CloseIcon />}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
