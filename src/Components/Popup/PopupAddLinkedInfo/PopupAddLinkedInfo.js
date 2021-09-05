import React from 'react';

import { Dialog, DialogTitle, DialogActions, TextField, DialogContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import 'moment/locale/ru';

import CustomSelect from '../../../SharedComponents/CustomSelect';
import CustomDateTimePicker from '../../../SharedComponents/CustomDateTimePicker';
import { metaData, dataTable } from '../../../config/data';
import DateW from '../../../utils/date';
import getDefaultValues from '../../../utils/defaultData';
import './PopupAddLinkedInfo.css';

// Standart dialog:
export default class PopupAddLinkedInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.isOpened,
      emptyDataError: false,
    };

    // get list of not defined fields;
    const { type } = this.props;
    const fields = {};
    const metaTable = metaData.tables[`${type}_meta`];
    const realID = dataTable.map((task) => task.id).indexOf(this.props.id);
    Object.keys(metaTable.dataTable).forEach((prop) => {
      if (prop !== 'id' && metaTable.dataTable[prop].defaultValue === '') {
        fields[prop] = {
          type: metaTable.dataTable[prop].type,
          value: metaTable.dataTable[prop].value,
        };

        if (metaTable.dataTable[prop].initialValue) {
          fields[prop].initialValue = getDefaultValues(
            realID,
            prop,
            metaTable.dataTable,
            'initialValue'
          );
        }

        if (['select', 'multi-select'].includes(metaTable.dataTable[prop].type)) {
          fields[prop].list = metaTable.dataTable[prop].vocabulary || prop;
        }
      }
    });

    this.state.fields = fields;
    Object.keys(fields).forEach((field) => {
      if (fields[field].initialValue) {
        this.state[field] = fields[field].initialValue;
      } else if (['datetime', 'date', 'time'].includes(fields[field].type)) {
        this.state[field] = null;
      } else {
        this.state[field] = undefined;
      }
    });
  }

  handleDateTimeChange = (property) => (value) => this.setState({ [property]: value });

  handleOk = () => {
    const editData = {};
    Object.keys(this.state.fields).forEach((field) => {
      editData[field] = '';
    });

    let emptyDataError = 0;
    const { type } = this.props;
    const metaTable = metaData.tables[`${type}_meta`];
    Object.keys(editData).forEach((key) => {
      editData[key] = this.state[key] ? this.state[key] : this[key]?.value || null;

      if (['datetime', 'date', 'time'].includes(metaTable.dataTable[key].type)) {
        editData[key] = DateW.toDateTimeStr(metaTable.dataTable[key].type, this.state[key]);
      }

      if (key !== 'week' && (!editData[key] || editData[key] === '')) emptyDataError++;
    });

    if (metaTable.dataTable.week) {
      editData.week = new DateW(editData.date).getYearWeekStr();
    }

    if (emptyDataError) {
      this.setState({ emptyDataError: true });
    } else {
      this.setState({ emptyDataError: false });
      this.props.action(this.props.id, this.props.type, editData);
      this.props.onClose();
    }
  };

  render() {
    const editData = this.state.fields;
    return (
      <Dialog
        open={this.props.isOpened}
        onClose={() => {
          this.setState({ emptyDataError: false });
          this.props.onClose();
        }}
        aria-labelledby="dialog-title"
        fullWidth
        style={{ overflow: 'visible' }}
        classes={{ paper: 'dialog-linked-data' }}
      >
        <DialogTitle id="dialog-title">
          <div className="popup-add-linked-info__title">
            <div>{this.props.title ? this.props.title : 'Добавление информации'}</div>

            <Button
              variant="outlined"
              onClick={this.props.onClose}
              color="secondary"
              startIcon={<CloseIcon />}
            >
              Закрыть
            </Button>
          </div>
        </DialogTitle>
        <DialogContent>
          {this.state.emptyDataError && (
            <div className="popup-add-linked-info__err-no-data">
              Данные должны быть полностью заполнены
            </div>
          )}
          {Object.keys(editData)
            .filter((property) => property !== 'week')
            .sort((a, b) => (editData[a].value >= editData[b].value ? 1 : -1))
            .map((property) => {
              const propertyInfo = editData[property];
              const listInfo = metaData[`${propertyInfo.list}List`];
              const { initialValue } = propertyInfo;

              return (
                <div key={property} className="popup-add-linked-info__row">
                  <div className="popup-add-linked-info__value">{propertyInfo.value}</div>
                  {['select', 'multi-select'].includes(propertyInfo.type) && (
                    <CustomSelect
                      style={{ width: '100%', minHeight: '30px', marginTop: '5px' }}
                      options={Object.keys(listInfo)
                        .sort((a, b) => (listInfo[a].value >= listInfo[b].value ? 1 : -1))
                        .map((k) => ({ value: k, label: listInfo[k].value }))}
                      defaultValue={
                        initialValue
                          ? initialValue.split(',').map((v) => ({ value: v, label: listInfo[v].value }))
                          : null
                      }
                      ref={property}
                      inputRef={(el) => {
                        this[property] = el;
                      }}
                      setValue={(value) => this.setState({ [property]: value })}
                      label="Выбрать..."
                      isMulti={propertyInfo.type === 'multi-select'}
                    />
                  )}
                  {['fulltext', 'string', 'id'].includes(propertyInfo.type) && (
                    <TextField
                      fullWidth
                      value={initialValue}
                      onChange={this.handleDateTimeChange(property)}
                      multiline={propertyInfo.type === 'fulltext'}
                    />
                  )}
                  {['datetime', 'date', 'time'].includes(propertyInfo.type) && (
                    <CustomDateTimePicker
                      type={propertyInfo.type}
                      onChange={this.handleDateTimeChange(property)}
                    />
                  )}
                </div>
              );
            })}
        </DialogContent>
        <DialogActions className="popup-add-linked-info__actions">
          <Button
            variant="outlined"
            onClick={this.handleOk}
            color="primary"
            className="MuiButton-outlinedOk"
            startIcon={<CheckIcon />}
          >
            Принять
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
