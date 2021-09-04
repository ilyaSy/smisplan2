import React, { Fragment } from 'react';
import { TextField, Tooltip, Button } from '@material-ui/core';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  KeyboardTimePicker,
} from '@material-ui/pickers';

import { dataTable, metaData } from '../../config/data';
import { doData } from '../../utils/api';
import storage from '../../storages/commonStorage';
import CustomSelect from '../../SharedComponents/CustomSelect';
import DateW from '../../utils/date';
import getDefaultValues from '../../utils/defaultData';
import './DataAdd.css';

export default class DataAdd extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      hasAddMenu: true,
      addMenuTitle: ' ',
      developers: '',
      selectDialogOptions: [],
    };
    this._dialogSelect = React.createRef();

    Object.keys(metaData.dataTable).forEach((key) => {
      const field = metaData.dataTable[key];
      if (field.addMenuIndex && !parseInt(field.addMenuIndex, 10)) {
        this.state[key] = '';
        this.state[`${key}Err`] = false;
        if (metaData.dataTable[key].type === 'select') {
          this.state[`${key}s`] = '';
        }
      }
    });
  }

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;
      if (dataLoading && dataLoading === 'root') {
        this.setState({ developers: metaData.developerList });
      }
      //   if (dataLoading && dataLoading === 'meta') {
      if (dataLoading && dataLoading === 'data') {
        this.setState({
          developers: metaData.developerList,
          hasAddMenu: metaData.specificParameters.hasAddMenu,
          addMenuTitle: metaData.specificParameters.addMenuTitle,
        });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  addTask = () => {
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт добавление информации в БД...',
    });

    const task = {
      id: parseInt(dataTable.map((t) => t.id).sort((a, b) => b - a)[0], 10) + 1,
    };

    // check empty fields in bottom menu
    let emptyDataError = false;
    Object.keys(metaData.dataTable).forEach((key) => {
      const field = metaData.dataTable[key];
      const state = this.state[key];
      if (!field.addMenuIndex || parseInt(field.addMenuIndex, 10) === 0) {
        const objName = `_addTask${field.id}`;
        if (this[objName]) {
          if (this[objName].value === '') {
            this.setState({ [`${key}Err`]: true });
            this[objName].focus();
            emptyDataError = true;
          } else {
            this.setState({ [`${key}Err`]: false });
            task[key] = this[objName].value;
          }
        } else if (this.refs[objName]) {
          if (!state || state === '') {
            this.setState({ [`${key}Err`]: true });
            this.refs[objName].setState({ valueErr: true });
            this.refs[objName].setFocus();
            emptyDataError = true;
          } else {
            this.setState({ [`${key}Err`]: false });
            this.refs[objName].setState({ valueErr: false });
            task[key] = state;
          }
        }
      }
    });

    if (!emptyDataError) {
      if (metaData.dataTableName === 'discussion') {
        task.mainTable = 'task';
        task.idTask = 42;
        task.participants = task.responsible;

        const now = moment();
        const { date, time } = this.state;
        task.date = DateW.toDateTimeStr('date', date || now);
        task.time = DateW.toDateTimeStr('time', time || now);
        task.week = new DateW(date || now).getYearWeekStr();
      }

      // set default values
      Object.keys(metaData.dataTable).forEach((property) => {
        if (typeof task[property] === 'undefined' || task[property] === '') {
          if (['datetime', 'date', 'time'].includes(metaData.dataTable[property].type)) {
            task[property] = undefined;
            if (['datetime', 'date', 'time'].includes(metaData.dataTable[property].defaultValue)) {
              task[property] = getDefaultValues(undefined, property, metaData.dataTable);
            }
          } else {
            switch (property) {
              case 'author':
                task[property] = metaData.user.login;
                break;
              case 'mainTable':
                task[property] = metaData.dataTableName;
                break;
              default:
                task[property] =
                  metaData.dataTable[property].defaultValue === 'empty'
                    ? ''
                    : metaData.dataTable[property].defaultValue;
            }
          }
        }
      });

      doData('put', task, undefined, metaData.dataTableName).then(([error, json]) => {
        console.log(json);
        if (error) {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'fail',
            message: 'Ошибка при добавлении',
          });
        } else if (json && json.id) {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'success',
            message: 'Добавление успешно',
          });
          task.id = json.id;
          task.value = task[metaData.specificParameters.mainValue];
          if (metaData[`${metaData.dataTableName}List`]) {
            metaData[`${metaData.dataTableName}List`][task.id] = task;
          }
          dataTable.push(task);

          // redraw table after adding row
          storage.data.dispatch({ type: 'REDRAW', redraw: true });

          Object.keys(metaData.dataTable).forEach((key) => {
            const field = metaData.dataTable[key];
            if (!field.addMenuIndex || parseInt(field.addMenuIndex, 10) === 0) {
              const objName = `_addTask${field.id}`;

              // clear states
              this.setState({ [`${key}Err`]: false });
              this.setState({ [key]: '' });

              // clear fields
              if (this[objName]) {
                this[objName].value = '';
              } else if (this.refs[objName]) {
                this.refs[objName].setState({ valueErr: false });
                this.refs[objName].setState({ value: null });
              }
            }
          });
        } else {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'fail',
            message: 'Ошибка при добавлении записи в БД',
          });
        }
      });
    }
  };

  handleChange = (value) => {
    if (value && value !== '' && value !== 'null') {
      this.setDeveloperErr(false);
    }
    this.setState({ developer: value });
  };

  handleDateClick = (field) => (value) => {
    this.setState({ [field]: value });
  };

  render() {
    const { developers, addMenuTitle, hasAddMenu } = this.state;
    const textFieldClass = `data-add__text-field${
      metaData.dataTableName === 'discussion' && '_discussion'
    }`;

    return (
      <>
        {hasAddMenu && (
          <div className="data-add">
            <div className="data-add__title">
              <b>{addMenuTitle}</b>
            </div>

            {Object.values(metaData.dataTable)
              .filter((field) => field.addMenuIndex && parseInt(field.addMenuIndex, 10) > 0)
              .sort((a, b) => parseInt(a.addMenuIndex, 10) - parseInt(b.addMenuIndex, 10))
              .map((field) => {
                const objName = `_addTask${field.id}`;

                return (
                  <Fragment key={field.id}>
                    {field.type === 'select' && (
                      <CustomSelect
                        style={{ width: '200px', marginTop: '-4px' }}
                        options={Object.values(developers)
                          .sort((a, b) => (a.value >= b.value ? 1 : -1))
                          .map((developer) => ({ value: developer.id, label: developer.value }))}
                        refName={objName}
                        ref={objName}
                        inputRef={(el) => {
                          this[objName] = el;
                        }}
                        setValue={(value) => this.setState({ [field.id]: value })}
                        label={`${field.value}*`}
                      />
                    )}

                    {field.type === 'string' && (
                      <div className={textFieldClass}>
                        <TextField
                          required
                          fullWidth
                          placeholder={field.value}
                          error={!!this.state[`${field.id}Err`]}
                          ref={objName}
                          inputRef={(el) => {
                            this[objName] = el;
                          }}
                        />
                      </div>
                    )}

                    {field.type === 'date' && (
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                          format="YYYY-MM-DD"
                          margin="normal"
                          value={this.state[field.id] || new Date()}
                          onChange={this.handleDateClick(field.id)}
                          style={{ width: '140px', margin: '0 0 9px 0' }}
                          className="tbl-header-btn-menu__datepicker"
                          inputRef={(el) => {
                            this[objName] = el;
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}

                    {field.type === 'time' && (
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardTimePicker
                          format="HH:mm:ss"
                          ampm={false}
                          minutesStep={5}
                          margin="normal"
                          value={this.state[field.id] || new Date()}
                          onChange={this.handleDateClick(field.id)}
                          style={{ width: '97px', margin: '0 0 9px 0' }}
                          className="tbl-header-btn-menu__datepicker"
                          inputRef={(el) => {
                            this[objName] = el;
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}
                  </Fragment>
                );
              })}

            <div className="data-add__button">
              <Tooltip title={addMenuTitle}>
                <Button
                  variant="outlined"
                  component="span"
                  color="primary"
                  onClick={this.addTask}
                  style={{ paddingBottom: '0px', paddingTop: '0px' }}
                  startIcon={<PlaylistAddIcon />}
                >
                  Добавить
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </>
    );
  }
}
