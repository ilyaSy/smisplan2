import React from 'react';

import { Dialog, DialogTitle, DialogActions, TextField, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  KeyboardTimePicker,
  KeyboardDateTimePicker
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/ru';

import CustomSelect from '../../SharedComponents/CustomSelect';
import { metaData, dataTable } from '../../config/data';
import DateW from '../../utils/date';
import getDefaultValues from '../../utils/defaultData';
import './PopupAddLinkedInfo.css';

const dateTimeChange = (mode, value) => {
  let date = undefined;
  if (typeof value === 'string') {
    date = value;
    if (mode === 'time') date = value.split('T')[1];
  }
  else if (typeof value === 'object' && value && value._isAMomentObject) {
    switch (mode) {
      case 'date':
        date = value.format("YYYY-MM-DD");
        break;
      case 'time':
        date = value.format("HH:mm:00");
        break;
      case 'datetime':
        date = value.format("YYYY-MM-DD HH:mm:00");
        break;
      default:
        date = undefined
    }
  }
  return date;
}

// Standart dialog:
export default class PopupAddLinkedInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.isOpened,
      emptyDataError: false,
    };

    // get list of not defined fields;
    let type = this.props.type;
    let fields = {}
    let metaTable = metaData.tables[`${type}_meta`];
    let realID = dataTable.map(task => { return task.id }).indexOf(this.props.id);
    for (let prop in metaTable.dataTable) {
      if (prop === 'id' || metaTable.dataTable[prop].defaultValue !== '') continue;
      fields[prop] = {
        type: metaTable.dataTable[prop].type,
        value: metaTable.dataTable[prop].value
      }

      if (metaTable.dataTable[prop].initialValue) {
        fields[prop].initialValue = getDefaultValues(realID, prop, metaTable.dataTable, 'initialValue');
      }

      if (['select', 'multi-select'].indexOf(metaTable.dataTable[prop].type) !== -1) {
        fields[prop].list = metaTable.dataTable[prop].vocabulary ?
          metaTable.dataTable[prop].vocabulary : prop;
      }
    }

    this.state.fields = fields;
    for (let field in fields) {
      if (fields[field].initialValue) {
        this.state[field] = fields[field].initialValue
      }
      else {
        if (['datetime', 'date', 'time'].indexOf(fields[field].type) !== -1) {
          this.state[field] = null;
        }
        else {
          this.state[field] = undefined;
        }
      }
    }
  }

  handleDateTimeChange = property => value => {
    this.setState({ [property]: value })
  }

  handleOk = () => {
    let editData = {};
    for (let field in this.state.fields) {
      editData[field] = '';
    }

    let emptyDataError = 0;
    let type = this.props.type;
    let metaTable = metaData.tables[`${type}_meta`];
    for (let key in editData) {
      editData[key] = this.state[key] ? this.state[key] : this[key] ? this[key].value : null;

      if (['datetime', 'date', 'time'].indexOf(metaTable.dataTable[key].type) !== -1) {
        editData[key] = dateTimeChange(metaTable.dataTable[key].type, this.state[key])
      }

      if (key !== 'week' && (!editData[key] || editData[key] === '')) emptyDataError++
    }

    if (metaTable.dataTable.week) {
      editData.week = new DateW(editData.date).getYearWeekStr();
    }

    if (emptyDataError) {
      this.setState({ emptyDataError: true });
    }
    else {
      this.setState({ emptyDataError: false });
      this.props.action(this.props.id, this.props.type, editData);
      // this.setOpen(false);
      this.props.onClose();
    }
  };

  render() {
    let editData = this.state.fields;
    return (
      <Dialog
        open={this.props.isOpened}
        onClose={() => { this.setState({ emptyDataError: false }); this.props.onClose(); }}
        aria-labelledby="dialog-title"
        fullWidth={true}
        style={{ overflow: 'visible' }}
        classes={{ paper: 'dialog-linked-data' }}>
        <DialogTitle id="dialog-title">
          <div className="popup-add-linked-info__title">
            <div>{this.props.title ? this.props.title : "Добавление информации"}</div>

            <Button variant="outlined" onClick={this.props.onClose} color="secondary"
              startIcon={<CloseIcon />}>
              Закрыть
            </Button>
          </div>
        </DialogTitle>
        <DialogContent>
          {this.state.emptyDataError &&
            <div className="popup-add-linked-info__err-no-data">Данные должны быть полностью заполнены</div>}
          {Object.keys(editData)
            .filter(property => property !== 'week')
            .sort((a, b) => { return editData[a].value >= editData[b].value ? 1 : -1 })
            .map(property => {
              let propertyInfo = editData[property];
              let listInfo = metaData[`${propertyInfo.list}List`];

              return (
                <div key={property} className="popup-add-linked-info__row">
                  <div className="popup-add-linked-info__value">{propertyInfo.value}</div>
                  {(propertyInfo.type === 'select' || propertyInfo.type === 'multi-select') &&
                    <CustomSelect
                      style={{ width: "100%", minHeight: '30px', marginTop: '5px' }}
                      options={Object.keys(listInfo)
                        .sort((a, b) => { return listInfo[a].value >= listInfo[b].value ? 1 : -1 })
                        .map(propertyKey => { return { value: propertyKey, label: listInfo[propertyKey].value } })}
                      defaultValue={editData[property].initialValue ?
                        editData[property].initialValue.split(",").map(v => { return { value: v, label: listInfo[v].value } }) : null}
                      ref={property} inputRef={el => this[property] = el}
                      setValue={(value) => { return this.setState({ [property]: value }) }}
                      label={'Выбрать...'}
                      isMulti={propertyInfo.type === 'multi-select' ? true : false}
                    />
                  }
                  {['fulltext', 'string', 'id'].indexOf(propertyInfo.type) !== -1 &&
                    <TextField defaultValue={editData[property].initialValue}
                      inputRef={el => this[property] = el}
                      fullWidth={true} multiline={propertyInfo.type === 'fulltext' ? true : false} />}
                  {propertyInfo.type === 'date' &&
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <KeyboardDatePicker
                        format="YYYY-MM-DD"
                        margin="normal"
                        onChange={this.handleDateTimeChange(property, propertyInfo.type)}
                        value={this.state[property]}
                        inputRef={el => this[property] = el}
                        fullWidth={true} />
                    </MuiPickersUtilsProvider>}
                  {propertyInfo.type === 'time' &&
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <KeyboardTimePicker
                        format="HH:mm"
                        margin="normal"
                        ampm={false}
                        minutesStep={5}
                        onChange={this.handleDateTimeChange(property)}
                        value={this.state[property]}
                        inputRef={el => this[property] = el}
                        fullWidth={true} />
                    </MuiPickersUtilsProvider>}
                  {propertyInfo.type === 'datetime' &&
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <KeyboardDateTimePicker
                        format="YYYY-MM-DD HH:mm"
                        ampm={false}
                        minutesStep={5}
                        margin="normal"
                        onChange={this.handleDateTimeChange(property, propertyInfo.type)}
                        value={this.state[property]}
                        inputRef={el => this[property] = el}
                        fullWidth={true} />
                    </MuiPickersUtilsProvider>}
                </div>
              )
            }
            )}
        </DialogContent>
        <DialogActions className="popup-add-linked-info__actions">
          <Button variant="outlined" onClick={this.handleOk} color="primary" className="MuiButton-outlinedOk"
            startIcon={<CheckIcon />}>
            Принять
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
