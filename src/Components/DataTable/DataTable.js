import React, { Fragment, Suspense, lazy } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Input } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';
import 'moment/locale/ru';

import { dataTable, metaData, filters, filterTasks } from '../../config/data';
import { doData, getData } from '../../utils/api';
import storage from '../../storages/commonStorage';
import TblHeadEnhanced from '../TblHeadEnhanced/TblHeadEnhanced';
import CustomIcon from '../../SharedComponents/CustomIcon';
import TblHeaderSearch from '../TblHeaderSearch/TblHeaderSearch';
import TblHeaderPagination from '../TblHeaderPagination/TblHeaderPagination';
import TblGroupRow from '../TblGroupRow/TblGroupRow';
import getDefaultValues from '../../utils/defaultData';
import './DataTable.css';

const TblActionMenu = lazy(() => import('../TblActionMenu/TblActionMenu'));
const PopupEditFullText = lazy(() => import('../PopupEditFullText/PopupEditFullText'));
const TblSecondaryList = lazy(() => import('../TblSecondaryList/TblSecondaryList'));
const TblFullTextRow = lazy(() => import('../TblFullTextRow/TblFullTextRow'));

const descSort = (a, b, sort) => {
  let desc = 0;

  for (let i = 0; i < sort.length; i++) {
    const field = sort[i];
    const orderBy = field.field;
    let valA = Number.isInteger(a[orderBy]) ? a[orderBy] : a[orderBy] ? a[orderBy].toString() : '';
    let valB = Number.isInteger(b[orderBy]) ? b[orderBy] : b[orderBy] ? b[orderBy].toString() : '';

    if (metaData.dataTable[orderBy].type === 'select') {
      if (valA !== '' && typeof valA === 'string') {
        valA = metaData[`${orderBy}List`][valA].value;
      }
      if (valB !== '' && typeof valB === 'string') {
        valB = metaData[`${orderBy}List`][valB].value;
      }

      if (typeof valA !== 'string') valA = '';
      if (typeof valB !== 'string') valB = '';
    }

    desc = 0;
    if (valB < valA) desc = -1;
    if (valB > valA) desc = 1;
    if (field.order === 'asc') desc *= -1;
    if (desc !== 0) break;
  }
  return desc;
};

const stableSort = (array, cmp) => {
  const stabilizedThis = array.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
};

const getSorting = (sort) => (a, b) => descSort(a, b, sort);

const getAdditionalCellProps = () => {
  let hasAdditionalCell = false;
  if (
    metaData.specificParameters &&
    (metaData.specificParameters.hasSpecAction ||
      metaData.specificParameters.hasSpecNotes ||
      metaData.specificParameters.hasEditMenu ||
      metaData.specificParameters.hasDeleteButton ||
      metaData.specificParameters.hasDoneButton)
  ) {
    hasAdditionalCell = true;
  }

  return hasAdditionalCell;
};

export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadData: false,
      page: 0,
      rowsPerPage: 100,
      sort: [{ field: 'id', order: 'asc' }],
      groupBy: '',
      groupHide: {},
      editID: -1,
      editItem: '',
      showFullTextID: -1,
      showAddRows: -1,
      data: dataTable,
      headCells: metaData.dataTable,
      titleRow: '',
      secDataList: [],
      weekDescription: undefined,
    };

    this.setSearch = this.setSearch.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;
      if (dataLoading && dataLoading === 'data') {
        // default sort
        const order = metaData.specificParameters.defaultSortDirection || 'desc';
        const orderBy = metaData.specificParameters.defaultSortField || 'id';
        let sort = [];
        const sortSString = sessionStorage.getItem('sort');
        if (sortSString) {
          const sortObj = JSON.parse(sortSString);
          if (Array.isArray(sortObj)) sort = sortObj;
        } else {
          orderBy.split(',').map((field, i) => sort.push({ field, order: order.split(',')[i] }));
        }

        let groupBy = '';
        if (metaData.specificParameters && metaData.specificParameters.defaultGroupField) {
          groupBy = metaData.specificParameters.defaultGroupField;
        }

        this.setState({
          headCells: metaData.dataTable,
          sort,
          // search: '',
          groupBy,
          editID: -1,
          data: filterTasks(true),
          loadData: true,
        });
      }
    });

    this.unsubscribeData = storage.data.subscribe(() => {
      if (storage.data.getState().DATA.redraw) {
        this.setData(filterTasks());
        this.setPage(0);
      }
    });

    this.unsubscribeTable = storage.table.subscribe(() => {
      this.setState({ loadData: false, secDataList: [], titleRow: '' });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribeData();
    this.unsubscribeTable();
  }

  setData = (data) => {
    this.setEditID(-1);
    this.setState({ data });
  };

  setPage = (page) => {
    this.setEditID(-1);
    this.setState({ page });
  };

  setOrder = (order) => {
    this.setState({ order });
  };

  setOrderBy = (orderBy) => {
    this.setState({ orderBy });
  };

  setEditID = (editID) => {
    this.setState({ editID });
  };

  setEditItem = (editItem) => {
    this.setState({ editItem });
  };

  setShowFullTextID = (showFullTextID) => {
    this.setState({ showFullTextID });
  };

  setRowsPerPage = (rowsPerPage) => {
    this.setState({ rowsPerPage });
  };

  setHeadCells = (headCells) => {
    this.setState({ headCells });
  };

  setWeekDescription = (weekDescription) => {
    this.setState({ weekDescription });
  };

  /* handle search */
  setSearch = (search) => {
    filters.data.commonFieldSearch = search;
    this.setData(filterTasks());
  };

  /* handle change sort order */
  setSort = (field) => {
    const { sort } = this.state;
    const sortFieldIndex = sort.map((f) => f.field).indexOf(field);
    if (sortFieldIndex !== -1) {
      if (sort[sortFieldIndex].order === 'asc') {
        sort[sortFieldIndex].order = 'desc';
      } else {
        sort.splice(sortFieldIndex, 1);
      }
    } else {
      sort.push({ field, order: 'asc' });
    }
    sessionStorage.setItem('sort', JSON.stringify(sort));
    this.setState({ sort });
  };

  /* handle sort click */
  handleRequestSort = (event, field) => {
    this.setSort(field);
  };

  /* handle group click */
  handleRequestGroup = (event, field) => {
    const { sort } = this.state;
    if (field && field !== '' && sort.field !== field) {
      if (field === 'week') {
        this.setState({
          sort: [
            { field, order: 'desc' },
            { field: 'date', order: 'asc' },
            { field: 'time', order: 'asc' },
          ],
        });
      } else {
        this.setState({ sort: [{ field, order: 'asc' }] });
      }
    }
    this.setState({ groupBy: field, byWeek: false });
  };

  /* handle change page click */
  handleChangePage = (event, newPage) => {
    this.setPage(newPage);
  };

  /* handle change row per page click */
  handleChangeRowsPerPage = (event) => {
    this.setRowsPerPage(parseInt(event.target.value, 10));
    this.setPage(0);
  };

  /* set sort/group to default options */
  defaultSort = (order = 'desc', orderBy = 'id') => {
    let sort = [];
    const sortSString = sessionStorage.getItem('sort');
    if (sortSString) {
      const sortObj = JSON.parse(sortSString);
      if (Array.isArray(sortObj)) sort = sortObj;
    } else {
      orderBy.split(',').forEach((field, i) => {
        sort.push({ field, order: order.split(',')[i] });
      });
    }

    this.setState({
      sort,
      groupBy: '',
      // search: ''
    });

    if (metaData.specificParameters && metaData.specificParameters.defaultGroupField) {
      this.setState({ groupBy: metaData.specificParameters.defaultGroupField });
    }
  };

  /* get array index (main data table) from given main task/theme (etc) ID */
  realID = (id) => dataTable.map((task) => task.id).indexOf(id);

  /* called after OK click in edit dialog */
  editTableRow = (id, rowData) => {
    let errorResult = false;
    doData('patch', rowData, id, metaData.dataTableName)
      .then(([error]) => {
        if (error) {
          errorResult = true;
        } else {
          const realID = this.realID(id);
          Object.keys(rowData).forEach((key) => {
            dataTable[realID][key] = rowData[key];
          });
          this.setData(filterTasks());
          storage.upd.dispatch({ type: 'UPDATE', update: true });
        }
      })
      .then(() => {
        if (errorResult) {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'fail',
            message: 'Ошибка при изменении',
          });
        } else {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'success',
            message: 'Изменение успешно',
          });
        }
      });
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });
  };

  /* called if you click 'SAVE AS NEW' button */
  addTableRow = (rowData, updateTable = true) => {
    this.addTableRowArray([rowData], updateTable);
  };

  addTableRowArray = (rowDataArray, updateTable = true) => {
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });

    Promise.all(
      rowDataArray.map((rowData) => doData('put', rowData, undefined, metaData.dataTableName))
    ).then((returnDataArray) => {
      let error = 0;
      let jsonOk = 1;
      returnDataArray.forEach((returnData) => {
        const returnError = returnData[0];
        const returnJson = returnData[1];
        if (returnError) error = 1;
        if (!returnJson || !returnJson.data || !returnJson.data.id) jsonOk = 0;
      });

      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при добавлении',
        });
      } else if (jsonOk) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Добавление успешно',
        });

        for (let i = 0; i < rowDataArray.length; i++) {
          const rowData = rowDataArray[i];
          const json = returnDataArray[i][1];

          rowData.id = json.data.id;
          rowData.value = rowData[metaData.specificParameters.mainValue];
          if (metaData[`${metaData.dataTableName}List`]) {
            metaData[`${metaData.dataTableName}List`][rowData.id] = rowData;
          }
          dataTable.push(rowData);
        }

        if (updateTable) this.setData(filterTasks());
      }
    });
  };

  /* called after OK click in DELETE dialog */
  deleteTableRow = (id) => {
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });
    let errorResult = false;
    doData('delete', {}, id, metaData.dataTableName)
      .then(([error]) => {
        if (error) {
          errorResult = true;
        } else {
          this.setShowFullTextID(-1);
          const realID = this.realID(id);
          dataTable.splice(realID, 1);
          this.setData(filterTasks());

          storage.upd.dispatch({ type: 'UPDATE', update: true });
        }
      })
      .then(() => {
        if (errorResult) {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'fail',
            message: 'Ошибка при изменении',
          });
        } else {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'success',
            message: 'Удаление успешно',
          });
        }
      });
  };

  /* called after inline edit of something */
  inlineEditOk = (id) => () => {
    const editProperty = this.state.editItem;
    const realID = this.realID(id);
    const rowData = {};
    Object.keys(dataTable[realID]).forEach((key) => {
      rowData[key] = dataTable[realID][key];
    });
    rowData[editProperty] = this[`edit-${editProperty}-${id}`].value;

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });
    doData('patch', rowData, id, metaData.dataTableName).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при изменении',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Изменение успешно',
        });

        // dataTable[realID][editProperty] = this[`edit-${editProperty}-${id}`].value;
        dataTable[realID][editProperty] = rowData[editProperty];
        this.setData(filterTasks());
      }
    });
  };

  dialogEditOk = (id, editProperty, editPropertyValue) => {
    const realID = this.realID(id);
    const rowData = {};
    Object.keys(dataTable[realID]).forEach((key) => {
      rowData[key] = dataTable[realID][key];
    });
    rowData[editProperty] = editPropertyValue;

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });
    doData('patch', rowData, id, metaData.dataTableName).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при изменении',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Изменение успешно',
        });

        dataTable[realID][editProperty] = editPropertyValue;
        this.setData(filterTasks());
      }
    });
  };

  /* called after set task/theme etc status as DONE */
  completeTableRow = (id) => {
    const realID = this.realID(id);
    const task = {};
    Object.keys(dataTable[realID]).forEach((key) => {
      task[key] = dataTable[realID][key];
    });
    task.status = 'done';

    const today = new Date();
    task.dateEnd = today.toISOString().replace(/(.+)T(.+)/, '$1');

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });
    doData('patch', task, id).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при изменении',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Изменение успешно',
        });

        dataTable[realID].status = task.status;
        dataTable[realID].dateEnd = task.dateEnd;
        this.setData(filterTasks());
      }
    });
  };

  setStatusTableRow = (id, status) => {
    const realID = this.realID(id);
    const task = {};
    Object.keys(dataTable[realID]).forEach((key) => {
      task[key] = dataTable[realID][key];
    });
    task.status = status;

    if (status === 'done') {
      const today = new Date();
      task.dateEnd = today.toISOString().replace(/(.+)T(.+)/, '$1');
    }

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });
    doData('patch', task, id, metaData.dataTableName).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при изменении',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Изменение успешно',
        });

        dataTable[realID].status = task.status;
        dataTable[realID].dateEnd = task.dateEnd;
        this.setData(filterTasks());
      }
    });
  };

  /* handle show full text row */
  showFullText = (id) => () => {
    if (this.state.showFullTextID === id) {
      return this.setShowFullTextID(-1);
    }
    return this.setShowFullTextID(id);
  };

  /* go to linked table (questions, discussion) for given task */
  loadLinked = async (id, loadTableName) => {
    const mainTable = metaData.dataTableName;
    storage.table.dispatch({ type: 'SET_TABLE', tableName: metaData.dataTableName });

    const data = await getData(mainTable, 'direct', { id });

    this.props.reloadDataTable(loadTableName, () => {
      filters.data.idTask = id;
      filters.perm.mainTable = mainTable;

      this.setState({ titleRow: `${data[0].id} - ${data[0].value}` });
    });
  };

  /* show results */
  showResults = async (id, loadTableName = 'discussion') => {
    const data = await getData(loadTableName, 'direct', {
      idTask: id,
      mainTable: metaData.dataTableName,
    });

    this.setState({
      showAddRows: id,
      secDataList: data
        .sort((a, b) => (a.date.toString() > b.date.toString() ? -1 : 1))
        .map((task) => {
          const result = [];
          result.push(moment(task.date).format('DD MMMM YYYY'));
          result.push(
            task.participants
              .split(',')
              .map((d) => (metaData.developerList[d]?.value ? metaData.developerList[d].value : d))
              .join(', ')
          );
          result.push(task.result);
          return { string: result.join('\n') };
        }),
    });
  };

  /* add 'linked' data: question for tasks, discussion for theme, etc */
  addLinkedData = (id, type, infoData) => {
    const realID = this.realID(id);
    const linkedData = {};
    const metaTable = metaData.tables[`${type}_meta`];

    metaTable.dataTable.forEach((prop) => {
      if (metaTable.dataTable[prop].defaultValue) {
        linkedData[prop] = getDefaultValues(realID, prop, metaTable.dataTable);
      }
    });

    infoData.forEach((prop) => {
      linkedData[prop] = infoData[prop];
    });

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт обновление информации в БД...',
    });
    doData('put', linkedData, undefined, type).then(([error, json]) => {
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
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при добавлении записи в БД',
        });
      }
    });

    return false;
  };

  /* create and show sub list data (tasks for theme, etc) */
  loadSecondaryList = async (id, field, dataListName) => {
    if (this.state.showAddRows === id) {
      this.setState({ showAddRows: -1, secDataList: [] });
    } else {
      this.setState({ showAddRows: id });

      const secDataList = [];
      field = 'taskgroup';

      if (metaData.dataTableName === 'discussion') {
        const realID = this.realID(id);
        id = dataTable[realID].idTask;
      }

      const data = await getData(dataListName, 'direct', { [field]: id });
      data
        .filter((task) => parseInt(task[field], 10) === parseInt(id, 10) && task.status !== 'done')
        .sort((a, b) => (a.value <= b.value ? -1 : 1))
        .forEach((info) => {
          secDataList.push({ id: info.id, value: info.value });
        });

      this.setState({ secDataList: secDataList.map((task) => ({ string: ` ${task.value}` })) });
    }
  };

  menuActionLoadDiscussions = (id) => this.loadLinked(id, 'discussion');

  menuActionLoadThemeTasks = (id) => this.loadSecondaryList(id, metaData.dataTableName, 'task');

  /* handle send notifiction */
  sendNotification = (id) => {
    const rowData = {
      id,
      mode: 'notify',
      feature: metaData.dataTableName,
    };

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт отправка уведомлений...',
    });
    doData('notify', rowData, id, 'notification').then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при отправке уведомления',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Уведомление послано успешно',
        });
      }
    });
  };

  sendNotificationWeekDate = (notifyWeek, date) => {
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт отправка уведомлений...',
    });
    const data = {
      week: notifyWeek,
      mode: 'done',
      feature: 'discussion',
    };
    if (date) data.date = date;
    doData('notify', data, undefined, 'notification').then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при отправке уведомления',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Уведомление послано успешно',
        });
      }
    });
  };

  /* create action menu list (edit/delete/done, etc) */
  actionMenuList = () => {
    const menuList = [];
    // if (metaData.specificParameters.hasQuestions) {
    // }
    if (metaData.specificParameters.haveDiscussion) {
      const action = {
        id: 'discussion',
        value: 'Добавить обсуждение',
        type: 'discussion',
        action: this.addLinkedData,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasGoToDiscussion) {
      const action = {
        id: 'goToDiscussion',
        value: 'Связанные обсуждения',
        type: 'discussion',
        action: this.menuActionLoadDiscussions,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasSublistData) {
      const action = {
        id: 'secDataList',
        value: 'Связанные задачи',
        action: this.menuActionLoadThemeTasks,
      };
      menuList.push(action);
      menuList.push({ id: 'divider' });
    }
    if (metaData.specificParameters.hasEditMenu) {
      const action = {
        id: 'tasks_edit',
        value: 'Редактировать',
        actionName: 'Редактирование',
        action: this.editTableRow,
        actionNew: this.addTableRow,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasSetStatusMenu) {
      const action = {
        id: 'tasks_status',
        value: 'Изменить статус',
        actionName: 'Изменить статус',
        isListOfItems: true,
        listItems: metaData.statusList,
        action: this.setStatusTableRow,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasDeleteButton) {
      const action = {
        id: 'tasks_delete',
        value: 'Удалить',
        actionName: 'Удаление',
        action: this.deleteTableRow,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasNotificationButton) {
      menuList.push({ id: 'divider' });
      const action = {
        id: 'notification',
        value: 'Отправить уведомление',
        action: this.sendNotification,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasShowResults) {
      const action = {
        id: 'showThemeResults',
        value: 'История обсуждений',
        type: 'discussion',
        action: this.showResults,
      };
      menuList.push(action);
    }

    return menuList;
  };

  // setIsOpenedPopupEdit = (taskID, state = true) => {
  //   console.log(taskID, state);

  //   this.setState({ taskPopupEdit: taskID });
  //   this.setState({ isOpenedPopupEdit: state });
  // };

  getDateGroup = (date) => {
    const weekNum = this.state.byWeek ? moment(date, 'YYYY-MM-DD').week() : date;
    return weekNum;
  };

  toggleDescription = (week) => {
    const { weekDescription } = this.state;
    if (weekDescription && weekDescription === week) {
      this.setWeekDescription(undefined);
    } else {
      this.setWeekDescription(week);
    }
  };

  // chosenWeek = 0 - this week, 1 - next week, 2 - ...
  copyPreviousWeekDiscussions(selectedWeek, chosenWeek) {
    const weekData = dataTable.filter((row) => row.week === selectedWeek);

    const infoArray = [];
    weekData.forEach((data) => {
      const info = { ...data };
      info.result = '';
      info.status = 'new';
      info.videoConf = '';

      const newWeekDate = moment()
        .startOf('week')
        .day(moment(info.date).day() + 7 * chosenWeek);

      info.date = moment(newWeekDate).format('YYYY-MM-DD');
      info.week = moment(newWeekDate).format('YYYY.WW');

      infoArray.push(info);
    });

    this.addTableRowArray(infoArray);
  }

  render() {
    const {
      page,
      order,
      orderBy,
      sort,
      groupBy,
      headCells,
      weekDescription,
      secDataList,
      groupHide,
    } = this.state;
    let { rowsPerPage, data } = this.state;
    const groupList = {};
    let d = new Date();
    d = d.toLocaleDateString().replace(/(\d+).(\d+).(\d+)/, '$3-$2-$1');

    // for `noPagination` parameter (print PDF click)
    if (this.props.noPagination) {
      data = filterTasks();
      rowsPerPage = data.length;
    }

    const hasAdditionalCell = getAdditionalCellProps();
    const fullColsNum =
      Object.values(metaData.dataTable).filter((a) => a.showInTable).length +
      (hasAdditionalCell ? 1 : 0);

    return this.state.loadData ? (
      <Table size="small" stickyHeader className="data-table__table">
        <TableHead>
          {/* Table head */}
          <TblHeadEnhanced
            order={order}
            sort={sort}
            orderBy={orderBy}
            groupBy={groupBy}
            onRequestSort={this.handleRequestSort}
            onRequestGroup={this.handleRequestGroup}
            rowCount={data.length}
            onFilter={(_data) => {
              this.setData(_data);
              this.setPage(0);
            }}
            headCells={headCells}
          />
          {/* Search & pagination options row */}
          {!this.props.noPagination && (
            <TableRow>
              <TableCell
                colSpan={hasAdditionalCell ? fullColsNum + 1 : fullColsNum}
                className="data-table__pagination-cell"
              >
                <TblHeaderSearch setSearch={this.setSearch} />

                <TblHeaderPagination
                  count={data.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </TableCell>
            </TableRow>
          )}
          {/* Title row (for questions mode) */}
          {metaData.specificParameters?.hasTitleRow && this.state.titleRow !== '' && (
            <TableRow>
              <TableCell colSpan={fullColsNum} className="data-table__row-title">
                {this.state.titleRow}
              </TableCell>
            </TableRow>
          )}
        </TableHead>

        <TableBody>
          {data.length > 0 ? (
            stableSort(data, getSorting(sort))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                let rowClass = '';
                if (row.status === 'new') rowClass = 'task_alert';
                if (
                  metaData.dataTableName === 'discussion' &&
                  row.status === 'new' &&
                  row.date >= d
                ) {
                  rowClass = '';
                }
                if (row.priority === 'hard') rowClass = 'task_bad';
                if (row.status === 'rejected') rowClass = 'task_bad';
                if (row.status === 'done') rowClass = 'task_good';
                if (
                  metaData.dataTableName === 'discussion' &&
                  !row.result &&
                  row.status === 'done'
                ) {
                  rowClass = 'task_noresult';
                }

                let showGroupByRow = false;
                let groupValue = '';
                let dayName = '';

                if (groupBy && groupBy !== '') {
                  let date = '';
                  if (headCells[groupBy].type === 'date') {
                    date = moment(row[groupBy], 'YYYY-MM-DD');
                  } else if (groupBy === 'week') {
                    date = moment(row.date, 'YYYY-MM-DD');
                  }

                  const groupField = this.getDateGroup(row[groupBy]);
                  if (!groupList[groupField]) {
                    groupList[groupField] = 1;
                    showGroupByRow = true;
                  }

                  if (headCells[groupBy].type === 'date') {
                    dayName = `${date.format('dddd')}
${date.format('DD MMMM')}`;
                    // dayName = date.format('dddd') + '<br>' + date.format('DD MMMM');
                    groupValue = date.format('DD MMMM YYYY');
                  } else if (groupBy === 'week') {
                    dayName = `${date.format('dddd')}
${date.format('DD MMMM')}`;
                    groupValue = `${date.startOf('week').format('DD MMMM YYYY')} - ${date
                      .endOf('week')
                      .format('DD MMMM YYYY')}`;
                  } else {
                    groupValue = metaData[`${groupBy}List`]
                      ? metaData[`${groupBy}List`][row[groupBy]].value
                      : row[groupBy];
                  }
                }

                // big text data, like description, change_all. get Index of cell where Icon for click, value && property name
                const fullText = { display: false };
                Object.values(headCells).forEach((property) => {
                  if (
                    property.type === 'fulltext' &&
                    row[property.id] !== '' &&
                    typeof row[property.id] === 'string'
                  ) {
                    fullText.value = row[property.id];
                    fullText.title = property.value;
                    fullText.id = property.id;
                    fullText.display = true;
                    fullText.fullTextIndexCell = property.tableIndex;
                  }
                });

                let ZoomLink = '';
                if (
                  row.videoConf &&
                  /https:\/\/us02web\.zoom\.us\/j\/\d+\?pwd=.+/.test(row.videoConf)
                ) {
                  const url = row.videoConf.replace(
                    /^[\s\S]*(https:\/\/us02web\.zoom\.us\/j\/\d+\?pwd=\S+\b)[\s\S]*/,
                    '$1'
                  );
                  const tip = url.replace(/^https:\/\/us02web\.zoom\.us\/j\/\d{7}(\d{4}).+/, '$1');
                  ZoomLink = <CustomIcon type="link" class="icn_zoom" tip={tip} href={url} />;
                }

                let YouTubeLink = '';
                if (row.videoConf && /youtu\.?be/.test(row.videoConf)) {
                  const url = row.videoConf.replace(
                    /^[\s\S]*(https:\/\/(www\.)?youtu\.?be.+\b)[\s\S]*/,
                    '$1'
                  );
                  YouTubeLink = <CustomIcon type="link" class="icn_youtube" href={url} />;
                }

                return (
                  <Fragment key={`${row.id}`}>
                    {/* Group row with show/hide icons */}
                    {groupBy && groupBy !== '' && showGroupByRow && (
                      <TblGroupRow
                        tableName={metaData.dataTableName}
                        fullColsNum={hasAdditionalCell ? fullColsNum + 2 : fullColsNum}
                        headCells={headCells}
                        groupBy={groupBy}
                        groupValue={groupValue}
                        groupHide={groupHide}
                        setGroup={(_groupHide) => {
                          this.setState({ groupHide: _groupHide });
                        }}
                        row={row}
                        weekData={dataTable.filter((r) => r.week === row.week)}
                        getDateGroup={this.getDateGroup}
                        sendNotification={(id, day) => {
                          this.sendNotificationWeekDate(id, day);
                        }}
                        toggleDescription={() => {
                          this.toggleDescription(row.week);
                        }}
                        copyPreviousWeekDiscussions={(id, week) => {
                          this.copyPreviousWeekDiscussions(id, week);
                        }}
                      />
                    )}
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={`row-main-${row.id}`}
                      className={`${rowClass} data-table__row`}
                      style={{
                        height: '31px',
                        display:
                          !groupBy ||
                          (groupBy &&
                            groupList[this.getDateGroup(row[groupBy])] &&
                            !groupHide[this.getDateGroup(row[groupBy])])
                            ? 'table-row'
                            : 'none',
                      }}
                    >
                      {Object.values(headCells)
                        .filter((a) => a.showInTable)
                        .sort((a, b) => (a.tableIndex >= b.tableIndex ? 1 : -1))
                        .map((headCell, index) => {
                          const property = headCell.id;
                          let value =
                            groupBy &&
                            groupBy !== '' &&
                            (headCell.id === groupBy ||
                              (headCell.id === 'date' && groupBy === 'week'))
                              ? dayName
                              : row[headCell.id];
                          if (headCell.type === 'time')
                            value = value.replace(/(\d\d:\d\d):\d\d/, '$1');
                          if (headCell.id === 'mainTable')
                            value = metaData.tables[`${value}_meta`].specificParameters.tableName;
                          const { id } = row;
                          let whiteSpace = '';
                          if (['datetime', 'date', 'time'].indexOf(headCell.type) !== -1) {
                            whiteSpace = 'nowrap';
                          }
                          if (
                            groupBy &&
                            groupBy !== '' &&
                            (headCell.id === groupBy ||
                              (headCell.id === 'date' && groupBy === 'week'))
                          ) {
                            whiteSpace = 'pre';
                          }

                          const paddingLeft = index === 0 ? '10px' : '0px';

                          return (
                            <Fragment key={`td-${property}-${id}`}>
                              <TableCell
                                className="data-table__cell"
                                align="left"
                                padding="none"
                                style={{
                                  whiteSpace,
                                  paddingLeft,
                                  fontSize: 'var(--font-size-table)',
                                }}
                              >
                                {headCell.isInlineEditable &&
                                  headCell.type === 'string' &&
                                  (this.state.editID !== id ||
                                    this.state.editItem !== property) && (
                                    <>
                                      {fullText.display &&
                                        metaData.dataTable[property].hasFullTextLink && (
                                          <CustomIcon
                                            class="icn_description"
                                            tip={`Показать ${fullText.title}`}
                                            action={this.showFullText(row.id)}
                                          />
                                        )}
                                      {ZoomLink}
                                      {YouTubeLink}
                                      {value}
                                    </>
                                  )}

                                {/* edit item textbox */}
                                {this.state.editID === id && this.state.editItem === property && (
                                  <Input
                                    type="text"
                                    autoFocus
                                    defaultValue={value}
                                    ref={`edit-${property}-${id}`}
                                    inputRef={(el) => {
                                      this[`edit-${property}-${id}`] = el;
                                    }}
                                    inputProps={{
                                      style: { fontSize: 'var(--font-size-table)' },
                                    }}
                                    /* edit item ok / cancel buttons */
                                    endAdornment={
                                      <InputAdornment position="end">
                                        <div className="data-table__cell-edit-buttons">
                                          <CustomIcon
                                            class="icn_ok"
                                            action={this.inlineEditOk(id)}
                                          />
                                          <CustomIcon
                                            class="icn_cancel"
                                            action={() => {
                                              this.setEditID(-1);
                                              this.setEditItem('');
                                            }}
                                          />
                                        </div>
                                      </InputAdornment>
                                    }
                                    fullWidth
                                  />
                                )}

                                {/* Fulltext editable cell value */}
                                {headCell.isInlineEditable && headCell.type === 'fulltext' && (
                                  <div
                                    ref={`div-${property}-${id}`}
                                    className="data-table__cell-fulltext"
                                  >
                                    {/* text */}
                                    <div className="data-table__cell-fulltext-value">
                                      {fullText.display &&
                                        metaData.dataTable[property].hasFullTextLink && (
                                          <CustomIcon
                                            class="icn_description"
                                            action={this.showFullText(row.id)}
                                          />
                                        )}
                                      {value}
                                    </div>

                                    {/* dialog to edit */}
                                    {this.state.hoverID === id &&
                                      (this.state.editID !== id ||
                                        this.state.editItem !== property) && (
                                        <Suspense fallback={<p>...</p>}>
                                          <PopupEditFullText
                                            class="icn_tasks_edit"
                                            id={row.id}
                                            property={property}
                                            text={value}
                                            action={this.dialogEditOk}
                                          />
                                        </Suspense>
                                      )}
                                  </div>
                                )}

                                {/* None of the other cell values */}
                                {!headCell.isInlineEditable &&
                                  headCell.type !== 'multi-select' &&
                                  (headCell.type !== 'select' ||
                                    typeof metaData[`${property}List`][value] === 'undefined') && (
                                    <>
                                      {fullText.display &&
                                        metaData.dataTable[property].hasFullTextLink && (
                                          <CustomIcon
                                            class="icn_description"
                                            action={this.showFullText(row.id)}
                                          />
                                        )}
                                      {value}
                                    </>
                                  )}

                                {/* Select non-editable cell value */}
                                {!headCell.isInlineEditable &&
                                  headCell.type === 'select' &&
                                  typeof metaData[`${property}List`][value] !== 'undefined' && (
                                    <>
                                      {fullText.display &&
                                        index + 1 === fullText.fullTextIndexCell &&
                                        metaData.dataTable[property].hasFullTextLink && (
                                          <CustomIcon
                                            class="icn_description"
                                            action={this.showFullText(row.id)}
                                          />
                                        )}
                                      {metaData[`${property}List`][value].value}
                                    </>
                                  )}

                                {/* Multi-select non-editable cell value */}
                                {!headCell.isInlineEditable && headCell.type === 'multi-select' && (
                                  <div className="data-table__cell-multiselect">
                                    {fullText.display &&
                                      index + 1 === fullText.fullTextIndexCell &&
                                      metaData.dataTable[property].hasFullTextLink && (
                                        <CustomIcon
                                          class="icn_description"
                                          action={this.showFullText(row.id)}
                                        />
                                      )}
                                    {/* <DescriptionIcon fontSize={fontSize}/>} */}
                                    {value
                                      .split(',')
                                      .map((_d) => metaData[`${property}List`][_d]?.value || _d)
                                      .join(', ')}
                                  </div>
                                )}
                              </TableCell>

                              {headCell.isInlineEditable && headCell.type === 'string' && (
                                <TableCell
                                  className="data-table__cell"
                                  align="center"
                                  padding="none"
                                  style={{
                                    width: '10px',
                                    whiteSpace,
                                    paddingLeft,
                                    borderBottom:
                                      (this.state.showFullTextID === row.id ||
                                        (weekDescription && weekDescription === row.week)) &&
                                      fullText.display &&
                                      0,
                                  }}
                                >
                                  {this.state.editID !== id && (
                                    <div className="data-table__hover-icon data-table__cell-inline-edit">
                                      <CustomIcon
                                        class="icn_tasks_edit"
                                        tip={`Изменить: ${metaData.dataTable[property].value}`}
                                        action={() => {
                                          this.setEditID(id);
                                          this.setEditItem(property);
                                        }}
                                      />
                                    </div>
                                  )}
                                </TableCell>
                              )}
                            </Fragment>
                          );
                        })}

                      {/* Right column with actions menu */}
                      {hasAdditionalCell && (
                        <TableCell
                          className="data-table__cell data-table__hover-icon"
                          padding="none"
                          style={{ paddingLeft: metaData.mobile ? '10px' : '' }}
                        >
                          <div className="data-table__hover-icon">
                            <Suspense fallback={<p>...</p>}>
                              <TblActionMenu id={row.id} task={row} list={this.actionMenuList} />
                            </Suspense>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Full text row - if click to show */}
                    {(this.state.showFullTextID === row.id ||
                      (weekDescription && weekDescription === row.week)) &&
                      fullText.display && (
                        <Suspense
                          fallback={
                            <TableRow>
                              <TableCell>...</TableCell>
                            </TableRow>
                          }
                        >
                          <TblFullTextRow data={fullText} headCells={headCells} id={row.id} />
                        </Suspense>
                      )}

                    {/* Secondary List: show and hide */}
                    {this.state.showAddRows === row.id && !groupHide[row[groupBy]] && (
                      <Suspense
                        fallback={
                          <TableRow>
                            <TableCell>...</TableCell>
                          </TableRow>
                        }
                      >
                        <TblSecondaryList
                          secDataList={secDataList}
                          fullColsNum={fullColsNum}
                          loadSecondaryList={() => this.loadSecondaryList(row.id, 'task')}
                        />
                      </Suspense>
                    )}
                  </Fragment>
                );
              })
          ) : (
            <TableRow>
              <TableCell colSpan={fullColsNum}>
                {metaData.specificParameters?.tableName
                  ? `${metaData.specificParameters?.tableName}: отсутствуют`
                  : 'Данные загружаются...'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    ) : (
      <div className="data-table__loading">
        <CircularProgress style={{ width: '100px', height: '100px' }} />
      </div>
    );
  }
}
