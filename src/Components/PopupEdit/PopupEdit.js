import React from 'react';

import {
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  DialogContent,
  Input,
} from '@material-ui/core';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import PrintIcon from '@material-ui/icons/Print';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import ReactToPrint from 'react-to-print';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  KeyboardTimePicker,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/ru';

import { metaData, dataTable } from '../../config/data';
import { getData, fileUpload } from '../../utils/api';
import storage from '../../storages/commonStorage';
import CustomSelect from '../../SharedComponents/CustomSelect';
// import CustomCreatableSelect from '../../SharedComponents/CustomCreatableSelect';
import CustomIcon from '../../SharedComponents/CustomIcon';
import exportDocx from '../../SharedComponents/exportDocx';
import DateW from '../../utils/date';
import './PopupEdit.css';

const textToDoc = (task, tasksList) => {
  let rows = ['Планировщик задач', metaData.specificParameters.tableName, ''];

  let properties = [];
  Object.keys(metaData.dataTable)
    .filter((key) => {
      return (
        key !== 'specificParameters' && key !== 'undefined' && metaData.dataTable[key].isEditable
      );
    })
    .sort((a, b) => {
      return metaData.dataTable[a].tableIndex >= metaData.dataTable[b].tableIndex ? 1 : -1;
    })
    .map((property) => {
      return properties.push(property);
    });
  Object.keys(metaData.dataTable)
    .filter((key) => {
      return (
        key !== 'specificParameters' && key !== 'undefined' && !metaData.dataTable[key].isEditable
      );
    })
    .sort((a, b) => {
      return metaData.dataTable[a].tableIndex >= metaData.dataTable[b].tableIndex ? 1 : -1;
    })
    .map((property) => {
      return properties.push(property);
    });

  for (let property of properties) {
    let propertyInfo = metaData.dataTable[property];
    let listInfo = metaData.dataTable[property].vocabulary
      ? metaData[`${metaData.dataTable[property].vocabulary}List`]
      : metaData[`${property}List`];

    let value = task[property] ? task[property] : '';
    if (property === 'mainTable' && metaData.tables[`${value}_meta`].specificParameters) {
      value = metaData.tables[`${value}_meta`].specificParameters.tableName;
    }

    if (
      ['select', 'multi-select'].indexOf(metaData.dataTable[property].type) !== -1 &&
      value !== ''
    ) {
      let selectString = value;
      value = '';
      for (let v of selectString.split(',')) {
        value += value === '' ? (listInfo[v]?.value || v) : `,${listInfo[v]?.value || v}`;
      }
    }

    rows.push(`${propertyInfo.value}:   ${value}`);
  }

  if (metaData.dataTableName === 'discussion') {
    let tasks = tasksList;
    rows.push('');
    if (tasks.length > 0) {
      rows.push('Незакрытые задачи:');
      tasks.map((t) => {
        return rows.push(t);
      });
    } else {
      rows.push('Незакрытые задачи: отсутствуют');
    }
  }

  return rows;
};

//Standart dialog: full edit current task (anything loaded as main table)
export default class PopupEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // open: props.isOpened || false,
      openConfirm: false,
      confirmMessage: '',
      printPDF: false,
      tasksList: [],
    };
    this._dataRef = React.createRef();
    this.setOpen = this.setOpen.bind(this);
    if (this.props.id) {
      this.realId = dataTable
        .map((task) => task.id)
        .indexOf(this.props.id);
      this.task = dataTable[this.realId];
      for (let property in metaData.dataTable) {
        if (['datetime', 'date'].indexOf(metaData.dataTable[property].type) !== -1) {
          this.state[property] =
            this.task[property] && this.task[property] !== '' ? this.task[property] : null;
        } else if (['time'].indexOf(metaData.dataTable[property].type) !== -1) {
          this.state[property] =
            this.task[property] && this.task[property] !== ''
              ? `2000-01-01T${this.task[property]}`
              : null;
        } else if (['select', 'multi-select'].indexOf(metaData.dataTable[property].type) !== -1) {
          this.state[property] = this.task[property];
        }

        let filesAttached = [];
        if (
          /\b(http:.+?)(txt|docx?|xlsx?|pptx?|pdf|png|bmp|img|jpg|jpeg)\b/im.test(
            this.task[property]
          )
        ) {
          filesAttached.push(
            this.task[property].match(
              /\b(http:.+?)(txt|doc|docx|ppt|pptx|xls|xlsx|pdf|png|bpm|img|jpg|jpeg)\b/gi
            )
          );
          this.state[`${property}FilesAttached`] = filesAttached[0];
        }
      }
    }
  }

  setOpenConfirm = (openConfirm) => {
    this.setState({ openConfirm });
  };

  setOpen = (open) => {
    this.setState({ open });

    if (open) {
      for (let property in metaData.dataTable) {
        if (
          !metaData.dataTable[property].isEditable ||
          ['select', 'multi-select'].indexOf(metaData.dataTable[property].type) === -1
        )
          continue;

        //Reset property values (maybe we want to edit one more time ?)
        this.task[property] = dataTable[this.realId][property];

        let listName = metaData.dataTable[property].vocabulary
          ? metaData.dataTable[property].vocabulary
          : property;
        if (!metaData[`${listName}List`]) {
          getData(listName, 'direct').then((data) => {
            let listInfo = {};
            data.map((d) => {
              return (listInfo[d.id] = d);
            });
            this.setState({ [`${listName}List`]: listInfo });
          });
        }
      }
    }
    else {
      this.props.onClose();
    }
  };

  handleDateTimeChange = (property) => (value) => {
    this.setState({ [property]: value });
  };

  handleOk = () => {
    let realId = dataTable
      .map((task) => task.id)
      .indexOf(this.props.id);
    let task = dataTable[realId];
    // let task = this.props.task;

    let dataEdited = {};
    for (let key in metaData.dataTable) {
      if (key === 'specificParameters' || key === 'undefined') continue;

      if (key === 'mainTable') {
        dataEdited[key] = task[key];
        continue;
      }

      dataEdited[key] = this.state[key] ? this.state[key] : this[key] ? this[key].value : null;

      if (['datetime', 'date', 'time'].indexOf(metaData.dataTable[key].type) !== -1) {
        // dataEdited[key] = dateTimeChange(metaData.dataTable[key].type, this.state[key]);
        dataEdited[key] = DateW.toDateTimeStr(metaData.dataTable[key].type, this.state[key]);
      }
    }

    //check if something changed and send if fields only if changed;
    let isDataEdited = false;
    for (let key in dataEdited) {
      let propertyInfo = metaData.dataTable[key];
      let dataEditedValue =
        propertyInfo.type === 'int' ? parseInt(dataEdited[key]) : dataEdited[key];
      if (propertyInfo.type !== 'int' && dataEditedValue !== task[key]) {
        isDataEdited = true;
        break;
      }
    }

    if (metaData.dataTableName === 'discussion') {
      if (!dataEdited.participants.split(',').includes(dataEdited.responsible)) {
        dataEdited.participants = dataEdited.responsible + ',' + dataEdited.participants
      }
    }

    isDataEdited
      ? this.props.action(this.props.id, dataEdited)
      : console.log('Изменений внесено не было');
    this.setOpen(false);
  };

  handleSaveAsNew = () => {
    let realId = dataTable
      .map((task) => {
        return task.id;
      })
      .indexOf(this.props.id);
    let task = dataTable[realId];

    let dataEdited = {};
    for (let key in metaData.dataTable) {
      if (key === 'specificParameters' || key === 'undefined') continue;
      dataEdited[key] = this.state[key] ? this.state[key] : this[key] ? this[key].value : null;

      if (key === 'mainTable') {
        dataEdited[key] = task[key];
      }

      if (['datetime', 'date', 'time'].indexOf(metaData.dataTable[key].type) !== -1) {
        // dataEdited[key] = dateTimeChange(metaData.dataTable[key].type, this.state[key]);
        dataEdited[key] = DateW.toDateTimeStr(metaData.dataTable[key].type, this.state[key]);
      }
    }

    if (dataEdited.week) {
      dataEdited.week = parseFloat(new DateW(dataEdited.date).getYearWeekStr());
    }

    if (task.date === dataEdited.date && task.time === dataEdited.time) {
      this.setOpenConfirm(true);
      this.setState({ confirmMessage: '(дата и время не были изменены!)' });
    } else {
      this.props.actionNew(dataEdited);
      this.setOpen(false);
    }
  };

  confirmSaveAsNew = () => {
    let realId = dataTable
      .map((task) => {
        return task.id;
      })
      .indexOf(this.props.id);
    let task = dataTable[realId];

    let dataEdited = {};
    for (let key in metaData.dataTable) {
      if (key === 'specificParameters' || key === 'undefined') continue;
      dataEdited[key] = this.state[key] ? this.state[key] : this[key] ? this[key].value : null;

      if (key === 'mainTable') {
        dataEdited[key] = task[key];
      }

      if (['datetime', 'date', 'time'].indexOf(metaData.dataTable[key].type) !== -1) {
        // dataEdited[key] = dateTimeChange(metaData.dataTable[key].type, this.state[key]);
        dataEdited[key] = DateW.toDateTimeStr(metaData.dataTable[key].type, this.state[key]);
      }
    }

    if (dataEdited.week) {
      dataEdited.week = parseFloat(new DateW(dataEdited.date).getYearWeekStr());
    }

    this.props.actionNew(dataEdited);
    this.setOpen(false);
  };

  handleUpload = (e, property) => {
    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Файл загружается...' });
    fileUpload(e.target.files[0]).then(([response, error]) => {
      if (!error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Файл загружен успешно, ссылка добавлена',
        });
        let fileUrl = 'http://' + window.location.host + '/smisplan-docs/' + response.fileName;
        this[property].value = this[property].value + '\n' + fileUrl;

        const filesAttached = [];
        if (this.state[`${property}FilesAttached`])
          filesAttached.push(...this.state[`${property}FilesAttached`]);
        filesAttached.push(fileUrl);
        this.setState({ [`${property}FilesAttached`]: filesAttached });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при загрузке',
        });
      }
    });
  };

  openUrl = (url) => window.open(url, '_blank', '');

  filterValidKeys = (key) => {
    return key !== 'specificParameters' && key !== 'undefined'
  }

  sortValidKeys = (a, b) => {
    return metaData.dataTable[a].tableIndex >= metaData.dataTable[b].tableIndex ? 1 : -1;
  }

  render() {
    let properties = [].concat(
      Object.keys(metaData.dataTable)
        .filter(this.filterValidKeys)
        .filter((key) => metaData.dataTable[key].isEditable)
        .sort(this.sortValidKeys),
      Object.keys(metaData.dataTable)
        .filter(this.filterValidKeys)
        .filter((key) => !metaData.dataTable[key].isEditable)
        .sort(this.sortValidKeys)
    );

    return this.task && (
      <Dialog
        open={this.props.isOpened}
        onClose={this.props.onClose}
        aria-labelledby="dialog-title"
        fullWidth={true}
        classes={{ paper: 'dialog-edit' }}
      >
        <div className="popup-edit__header">
          <DialogTitle id="dialog-title">Редактирование</DialogTitle>
          <div className="popup-edit__print-doc">
            <ReactToPrint
              trigger={() => (
                <Tooltip title="Печатать">
                  <IconButton className="icn" style={{ padding: '0px' }}>
                    <PrintIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              )}
              content={() => {
                this.setState({ printPDF: true });
                return this._dataRef.current;
              }}
              onAfterPrint={() => {
                this.setState({ printPDF: false });
              }}
            />
            {metaData.dataTableName === 'discussion' && (
              <CustomIcon
                class="icn_save"
                tip="Сохранить как документ MS Word"
                fontSize="large"
                action={() => exportDocx(textToDoc(this.task, this.state.tasksList), metaData)}
              />
            )}
          </div>
        </div>
        <DialogContent ref={this._dataRef}>
          {properties.map((property, index) => {
            let propertyInfo = metaData.dataTable[property];
            let listName = metaData.dataTable[property].vocabulary
              ? metaData.dataTable[property].vocabulary
              : property;
            let listInfo = metaData[`${listName}List`]
              ? metaData[`${listName}List`]
              : this.state[`${listName}List`];

            let value = this.task[property];
            if (property === 'mainTable' && metaData.tables[`${value}_meta`].specificParameters) {
              value = metaData.tables[`${value}_meta`].specificParameters.tableName;
            }

            return (
              <div key={`dialogEdit-${property}-main`}>
                <div key={`dialogEdit-${property}-subMain`} className="popup-edit__row">
                  <div
                    style={{
                      width: '200px',
                      fontSize: '14px',
                      color: !propertyInfo.isEditable ? 'var(--font-color-disabled)' : '',
                    }}
                  >
                    {propertyInfo.value}
                  </div>
                  {propertyInfo.isEditable &&
                    (propertyInfo.type === 'multi-select' || propertyInfo.type === 'select') &&
                    listInfo && (
                      <CustomSelect
                        style={{ width: '100%', minHeight: '30px', marginTop: '5px' }}
                        options={Object.keys(listInfo)
                          .sort((a, b) => listInfo[a].value >= listInfo[b].value ? 1 : -1)
                          .map((pKey) => {
                            return { value: pKey, label: listInfo[pKey].value }
                          })}
                        bottom
                        ref={property}
                        inputRef={(el) => (this[property] = el)}
                        refName={property}
                        defaultValue={
                          this.task[property]
                            ? this.task[property].split(',').map((v) => {
                              return listInfo[v]
                                ? { value: v, label: listInfo[v].value }
                                : { value: v, label: v };
                            })
                            : null
                        }
                        setValue={(value) => {
                          return this.setState({ [property]: value });
                        }}
                        label={'Выбрать...'}
                        isMulti={propertyInfo.type === 'multi-select' ? true : false}
                        isCreatable={propertyInfo.isSelectCreatable}
                      />
                    )}
                  {propertyInfo.isEditable &&
                    ['string', 'int', 'fulltext'].indexOf(propertyInfo.type) !== -1 && (
                      <Input
                        defaultValue={this.task[property]}
                        fullWidth={true}
                        multiline={true}
                        onKeyDown={(e) => {
                          //  need this to fix bug: home/end/arrow keys did not work
                          e.stopPropagation();
                        }}
                        inputRef={(el) => (this[property] = el)}
                        inputProps={{
                          style: {
                            fontSize: '14px',
                            fontFamily: 'var(--font-main)',
                            maxHeight: this.state.printPDF ? '2000px' : '200px',
                            overflow: 'unset !important',
                          },
                        }}
                        endAdornment={
                          propertyInfo.hasFileUploader &&
                          !this.state.printPDF && (
                            <div className="popup-edit__upload-file">
                              <InputAdornment position="end">
                                <input
                                  id="editDialog-fileUploader"
                                  //accept="image/*"
                                  type="file"
                                  style={{ display: 'none' }}
                                  multiple
                                  onChange={(e) => this.handleUpload(e, property)}
                                />
                                <label htmlFor="editDialog-fileUploader">
                                  <Tooltip title="Загрузить">
                                    <IconButton color="default" component="span">
                                      <CloudUploadIcon />
                                    </IconButton>
                                  </Tooltip>
                                </label>
                              </InputAdornment>
                            </div>
                          )
                        }
                      />
                    )}
                  {propertyInfo.isEditable && propertyInfo.type === 'datetime' && (
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <KeyboardDateTimePicker
                        format="YYYY-MM-DD HH:mm"
                        ampm={false}
                        minutesStep={5}
                        margin="normal"
                        onChange={this.handleDateTimeChange(property)}
                        value={this.state[property]}
                        inputRef={(el) => (this[property] = el)}
                        fullWidth={true}
                      />
                    </MuiPickersUtilsProvider>
                  )}
                  {propertyInfo.isEditable && propertyInfo.type === 'date' && (
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <KeyboardDatePicker
                        format="YYYY-MM-DD"
                        margin="normal"
                        onChange={this.handleDateTimeChange(property)}
                        value={this.state[property]}
                        inputRef={(el) => (this[property] = el)}
                        fullWidth={true}
                      />
                    </MuiPickersUtilsProvider>
                  )}
                  {propertyInfo.isEditable && propertyInfo.type === 'time' && (
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <KeyboardTimePicker
                        format="HH:mm"
                        ampm={false}
                        minutesStep={5}
                        margin="normal"
                        onChange={this.handleDateTimeChange(property)}
                        value={this.state[property]}
                        inputRef={(el) => (this[property] = el)}
                        fullWidth={true}
                      />
                    </MuiPickersUtilsProvider>
                  )}
                  {!propertyInfo.isEditable && (
                    <TextField
                      defaultValue={value}
                      inputProps={{
                        style: { fontSize: '14px', fontFamily: 'var(--font-main)' },
                      }}
                      inputRef={(el) => (this[property] = el)}
                      fullWidth={true}
                      disabled
                    />
                  )}
                </div>

                {this.state[`${property}FilesAttached`] &&
                  this.state[`${property}FilesAttached`].length > 0 && (
                    <div className="popup-edit__attached-file">
                      {this.state[`${property}FilesAttached`].map((fileUrl, index) => {
                        return (
                          <CustomIcon
                            class="icn_attachment"
                            tip={`Открыть: ${fileUrl.replace(/^.+\/(.+)$/, '$1')}`}
                            type="material-ui"
                            fontSize="large"
                            action={() => this.openUrl(fileUrl)}
                            key={`${fileUrl}_${index}`}
                          />
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </DialogContent>
        <DialogActions className="popup-edit__actions">
          <Button
            variant="outlined"
            onClick={this.handleOk}
            color="primary"
            className="MuiButton-outlinedOk"
            startIcon={<CheckIcon />}
          >
            Принять изменения
            </Button>
          {metaData.specificParameters.hasEditMenuSaveAsNew && (
            <Button
              variant="outlined"
              onClick={this.handleSaveAsNew}
              color="default"
              className="MuiButton-outlinedDefault"
              startIcon={<SaveAltIcon />}
            >
              Сохранить как новую
              </Button>
          )}
          <Button
            variant="outlined"
            onClick={this.props.onClose}
            color="secondary"
            startIcon={<CloseIcon />}
          >
            Закрыть
            </Button>

          <Dialog
            open={this.state.openConfirm}
            onClose={() => this.setOpenConfirm(false)}
            aria-labelledby="dialog-title"
            fullWidth={true}
          >
            <DialogTitle id="dialog-title">
              Вы подтверждаете сохранение {this.state.confirmMessage} ?
              </DialogTitle>
            <DialogActions className="popup-edit__actions">
              <Button
                variant="outlined"
                onClick={this.confirmSaveAsNew}
                color="primary"
                className="MuiButton-outlinedOk"
                startIcon={<CheckIcon />}
              >
                Да
                </Button>
              <Button
                variant="outlined"
                onClick={() => { this.setOpenConfirm(false); }}
                color="secondary"
                startIcon={<CloseIcon />}
              >
                Отмена
                </Button>
            </DialogActions>
          </Dialog>
        </DialogActions>
      </Dialog>
    );
  }
}
