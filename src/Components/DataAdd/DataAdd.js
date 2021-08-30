import React, { Fragment } from 'react';
import { TextField, Tooltip, Button } from '@material-ui/core';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';

import { dataTable, metaData, filters } from '../../config/data';
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
    for (let key in metaData.dataTable) {
      let field = metaData.dataTable[key];
      if (!field.addMenuIndex || parseInt(field.addMenuIndex) === 0) continue;

      this.state[key] = '';
      this.state[`${key}Err`] = false;
      if (metaData.dataTable[key].type === 'select') {
        this.state[`${key}s`] = '';
      }
    }
  }

  addTask = () => {
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт добавление информации в БД...',
    });

    let task = {
      id:
        parseInt(
          dataTable
            .map((task) => task.id)
            .sort((a, b) => {
              return b - a;
            })[0]
        ) + 1,
    };

    // check empty fields in bottom menu
    let emptyDataError = false;
    for (let key in metaData.dataTable) {
      let field = metaData.dataTable[key];
      if (!field.addMenuIndex || parseInt(field.addMenuIndex) === 0) continue;

      let objName = `_addTask${field.id}`;
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
        if (!this.state[key] || this.state[key] === '') {
          this.setState({ [`${key}Err`]: true });
          this.refs[objName].setState({ valueErr: true });
          this.refs[objName].setFocus();
          emptyDataError = true;
        } else {
          this.setState({ [`${key}Err`]: false });
          this.refs[objName].setState({ valueErr: false });
          task[key] = this.state[key];
        }
      }
    }

    if (!emptyDataError) {
      if (metaData.dataTableName === 'spec_notes') {
        if (!filters.data.idTask) {
          let selectDialogOptions = [];
          if (Object.values(metaData.taskList).length > 0) {
            selectDialogOptions.push({
              id: 'task',
              name: 'Задачи',
              options: Object.values(metaData.taskList)
                .sort((a, b) => {
                  return a.value >= b.value ? 1 : -1;
                })
                .map((task) => {
                  return { id: task.id, value: task.value };
                }),
            });
          }
          if (Object.values(metaData.taskgroupList).length > 0) {
            selectDialogOptions.push({
              id: 'taskgroup',
              name: 'Темы',
              options: Object.values(metaData.taskgroupList)
                .sort((a, b) => {
                  return a.value >= b.value ? 1 : -1;
                })
                .map((task) => {
                  return { id: task.id, value: task.value };
                }),
            });
          }
          this.setState({ selectDialogOptions: selectDialogOptions });
          this._dialogSelect.current.setState({ open: true });
        }

        task.idTask = filters.data.idTask;
        task.theme = metaData.taskList[filters.data.idTask].value;
      }

      if (metaData.dataTableName === 'discussion') {
        task.mainTable = 'task';
        task.idTask = 42;
        task.participants = task.responsible;

        const now = moment();
        task.date = DateW.toDateTimeStr('date', this.state.date || now);
        task.time = DateW.toDateTimeStr('time', this.state.time || now);
        task.week = new DateW(this.state.date || now).getYearWeekStr();
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
        if (error) {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'fail',
            message: 'Ошибка при добавлении',
          });
        } else if (json && json.data && json.data.id) {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'success',
            message: 'Добавление успешно',
          });
          task.id = json.data.id;
          task.value = task[metaData.specificParameters.mainValue];
          if (metaData[`${metaData.dataTableName}List`]) {
            metaData[`${metaData.dataTableName}List`][task.id] = task;
          }
          dataTable.push(task);

          //redraw table after adding row
          storage.data.dispatch({ type: 'REDRAW', redraw: true });

          for (let key in metaData.dataTable) {
            let field = metaData.dataTable[key];
            if (!field.addMenuIndex || parseInt(field.addMenuIndex) === 0) continue;
            let objName = `_addTask${field.id}`;

            //clear states
            this.setState({ [`${key}Err`]: false });
            this.setState({ [key]: '' });

            //clear fields
            if (this[objName]) {
              this[objName].value = '';
            } else if (this.refs[objName]) {
              this.refs[objName].setState({ valueErr: false });
              this.refs[objName].setState({ value: null });
            }
          }
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
    this.setState({[field]: value});
  }

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      let dataLoading = storage.state.getState().STATE.dataLoading;
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

  render() {
    const { developers, addMenuTitle } = this.state;
    const textFieldClass = `data-add__text-field${metaData.dataTableName === 'discussion' && '_discussion'}`;

    return (
      <>
        {this.state.hasAddMenu && (
          <div className="data-add">
            <div className="data-add__title">
              <b>{addMenuTitle}</b>
            </div>

            {Object.values(metaData.dataTable)
              .filter((field) => {
                return field.addMenuIndex && parseInt(field.addMenuIndex) > 0;
              })
              .sort((a, b) => {
                return parseInt(a.addMenuIndex) - parseInt(b.addMenuIndex);
              })
              .map((field) => {
                let objName = `_addTask${field.id}`;

                return (
                  <Fragment key={field.id}>
                    {field.type === 'select' && (
                      <CustomSelect
                        style={{ width: '200px', marginTop: '-4px' }}
                        options={Object.values(developers)
                          .sort((a, b) => {
                            return a['value'] >= b['value'] ? 1 : -1;
                          })
                          .map((developer) => {
                            return { value: developer.id, label: developer.value };
                          })}
                        refName={objName}
                        ref={objName}
                        inputRef={(el) => (this[objName] = el)}
                        setValue={(value) => {
                          return this.setState({ [field.id]: value });
                        }}
                        label={`${field.value}*`}
                      />
                    )}

                    {field.type === 'string' && (
                      <div className={textFieldClass}>
                        <TextField
                          required
                          fullWidth={true}
                          placeholder={field.value}
                          error={this.state[`${field.id}Err`] ? true : false}
                          ref={objName}
                          inputRef={(el) => (this[objName] = el)}
                        />
                      </div>
                    )}

                    {field.type === 'date' &&
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                          format="YYYY-MM-DD"
                          margin="normal"
                          value={this.state[field.id] || new Date()}
                          onChange={this.handleDateClick(field.id)}
                          style={{ width: "140px", margin: "0 0 9px 0" }}
                          className="tbl-header-btn-menu__datepicker"
                          inputRef={(el) => (this[objName] = el)}
                        />
                      </MuiPickersUtilsProvider>
                    }

                    {field.type === 'time' &&
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardTimePicker
                          format="HH:mm:ss"
                          ampm={false}
                          minutesStep={5}
                          margin="normal"
                          value={this.state[field.id] || new Date()}
                          onChange={this.handleDateClick(field.id)}
                          style={{ width: "97px", margin: "0 0 9px 0" }}
                          className="tbl-header-btn-menu__datepicker"
                          inputRef={(el) => (this[objName] = el)}
                        />
                      </MuiPickersUtilsProvider>
                    }
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
