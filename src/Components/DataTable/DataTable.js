import React, { Fragment, Suspense, lazy } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';
import moment from 'moment';
import 'moment/locale/ru';

import { dataTable, metaData } from '../../config/data';
import { filters, filterTasks } from '../../utils/filters';
import { doData, getData } from '../../utils/apiFunctions';
import storage from '../../storages/commonStorage';
import TblHeadEnhanced from '../Table/TblHeadEnhanced/TblHeadEnhanced';
import CustomIcon from '../../SharedComponents/CustomIcon';
import CustomSuspenseFallback from '../../SharedComponents/CustomSuspenseFallback';
import TblCell from '../Table/TblCell/TblCell';
import TblCellInput from '../Table/TblCellInput/TblCellInput';
import TblCellIcon from '../Table/TblCellIcon/TblCellIcon';
import TblHeader from '../Table/TblHeader/TblHeader';
import TblGroupRow from '../Table/TblGroupRow/TblGroupRow';
import TblRowText from '../Table/TblRowText/TblRowText';
import TblLoading from '../Table/TblLoading/TblLoading';
import getDefaultValues from '../../utils/defaultData';
import './DataTable.css';

const TblSecondaryList = lazy(() => import('../Table/TblSecondaryList/TblSecondaryList'));
const TblFullTextRow = lazy(() => import('../Table/TblFullTextRow/TblFullTextRow'));

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

const getHasMenuCell = () => {
  let hasMenuCell = false;
  if (
    metaData.specificParameters &&
    (metaData.specificParameters.hasSpecAction ||
      metaData.specificParameters.hasSpecNotes ||
      metaData.specificParameters.hasEditMenu ||
      metaData.specificParameters.hasDeleteButton ||
      metaData.specificParameters.hasDoneButton)
  ) {
    hasMenuCell = true;
  }

  return hasMenuCell;
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
      editItem: { id: -1, property: '', value: '' },
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
        const sort = [];
        orderBy.split(',').map((field, i) => sort.push({ field, order: order.split(',')[i] }));

        let groupBy = '';
        if (metaData.specificParameters && metaData.specificParameters.defaultGroupField) {
          groupBy = metaData.specificParameters.defaultGroupField;
        }

        this.setState({
          headCells: metaData.dataTable,
          sort,
          groupBy,
          editItem: { id: -1, property: '', value: '' },
          data: filterTasks(true),
          loadData: true,
        });
      } else if (dataLoading && dataLoading === 'meta') {
        this.setState({
          headCells: metaData.dataTable,
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
    this.setEditItem({ id: -1, property: '', value: '' });
    this.setState({ data });
  };

  setPage = (page) => {
    this.setEditItem({ id: -1, property: '', value: '' });
    this.setState({ page });
  };

  setOrder = (order) => this.setState({ order });

  setOrderBy = (orderBy) => this.setState({ orderBy });

  setEditItem = (editItem) => this.setState({ editItem });

  setShowFullTextID = (showFullTextID) => this.setState({ showFullTextID });

  setRowsPerPage = (rowsPerPage) => this.setState({ rowsPerPage });

  setHeadCells = (headCells) => this.setState({ headCells });

  setWeekDescription = (weekDescription) => this.setState({ weekDescription });

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
    this.setState({ sort });
  };

  /* handle sort click */
  handleRequestSort = (event, field) => this.setSort(field);

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
    const sort = [];
    orderBy.split(',').forEach((field, i) => {
      sort.push({ field, order: order.split(',')[i] });
    });

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
            message: '???????????? ?????? ??????????????????',
          });
        } else {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'success',
            message: '?????????????????? ??????????????',
          });
        }
      });
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
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
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
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
          message: '???????????? ?????? ????????????????????',
        });
      } else if (jsonOk) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '???????????????????? ??????????????',
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
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
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
            message: '???????????? ?????? ??????????????????',
          });
        } else {
          storage.alert.dispatch({
            type: 'SHOW_ALERT',
            status: 'success',
            message: '???????????????? ??????????????',
          });
        }
      });
  };

  /* called after inline edit of something */
  handleInlineEditOk = (id) => (editProperty, editValue) => {
    const realID = this.realID(id);
    const rowData = {};
    Object.keys(dataTable[realID]).forEach((key) => {
      rowData[key] = dataTable[realID][key];
    });
    rowData[editProperty] = editValue;

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
    });
    doData('patch', rowData, id, metaData.dataTableName).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: '???????????? ?????? ??????????????????',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '?????????????????? ??????????????',
        });

        dataTable[realID][editProperty] = rowData[editProperty];
        this.setData(filterTasks());
      }
    });
  };

  handleInlineEditClose = () => this.setEditItem({ id: -1, property: '', value: '' });

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
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
    });
    doData('patch', rowData, id, metaData.dataTableName).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: '???????????? ?????? ??????????????????',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '?????????????????? ??????????????',
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
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
    });
    doData('patch', task, id).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: '???????????? ?????? ??????????????????',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '?????????????????? ??????????????',
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
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
    });
    doData('patch', task, id, metaData.dataTableName).then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: '???????????? ?????? ??????????????????',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '?????????????????? ??????????????',
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

    Object.keys(metaTable.dataTable).forEach((prop) => {
      if (metaTable.dataTable[prop].defaultValue) {
        linkedData[prop] = getDefaultValues(realID, prop, metaTable.dataTable);
      }
    });

    Object.keys(infoData).forEach((prop) => {
      linkedData[prop] = infoData[prop];
    });

    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: '???????? ???????????????????? ???????????????????? ?? ????...',
    });
    doData('put', linkedData, undefined, type).then(([error, json]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: '???????????? ?????? ????????????????????',
        });
      } else if (json && json.id) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '???????????????????? ??????????????',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: '???????????? ?????? ???????????????????? ???????????? ?? ????',
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
      message: '???????? ???????????????? ??????????????????????...',
    });
    doData('notify', rowData, id, 'notification').then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: '???????????? ?????? ???????????????? ??????????????????????',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '?????????????????????? ?????????????? ??????????????',
        });
      }
    });
  };

  sendNotificationWeekDate = (notifyWeek, date) => {
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: '???????? ???????????????? ??????????????????????...',
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
          message: '???????????? ?????? ???????????????? ??????????????????????',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: '?????????????????????? ?????????????? ??????????????',
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
        value: '???????????????? ????????????????????',
        type: 'discussion',
        action: this.addLinkedData,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasGoToDiscussion) {
      const action = {
        id: 'goToDiscussion',
        value: '?????????????????? ????????????????????',
        type: 'discussion',
        action: this.menuActionLoadDiscussions,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasSublistData) {
      const action = {
        id: 'secDataList',
        value: '?????????????????? ????????????',
        action: this.menuActionLoadThemeTasks,
      };
      menuList.push(action);
      menuList.push({ id: 'divider' });
    }
    if (metaData.specificParameters.hasEditMenu) {
      const action = {
        id: 'tasks_edit',
        value: '??????????????????????????',
        actionName: '????????????????????????????',
        action: this.editTableRow,
        actionNew: this.addTableRow,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasSetStatusMenu) {
      const action = {
        id: 'tasks_status',
        value: '???????????????? ????????????',
        actionName: '???????????????? ????????????',
        isListOfItems: true,
        listItems: metaData.statusList,
        action: this.setStatusTableRow,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasDeleteButton) {
      const action = {
        id: 'tasks_delete',
        value: '??????????????',
        actionName: '????????????????',
        action: this.deleteTableRow,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasNotificationButton) {
      menuList.push({ id: 'divider' });
      const action = {
        id: 'notification',
        value: '?????????????????? ??????????????????????',
        action: this.sendNotification,
      };
      menuList.push(action);
    }
    if (metaData.specificParameters.hasShowResults) {
      const action = {
        id: 'showThemeResults',
        value: '?????????????? ????????????????????',
        type: 'discussion',
        action: this.showResults,
      };
      menuList.push(action);
    }

    return menuList;
  };

  getDateGroup = (date) => {
    const weekNum = this.state.byWeek ? moment(date, 'YYYY-MM-DD').week() : date;
    return weekNum;
  };

  toggleDescription = (week) => () => {
    const { weekDescription } = this.state;
    if (weekDescription && weekDescription === week) {
      this.setWeekDescription(undefined);
    } else {
      this.setWeekDescription(week);
    }
  };

  getYouTubeLink = (videoConf) => {
    let youTubeLink = '';
    if (videoConf && /youtu\.?be/.test(videoConf)) {
      const url = videoConf.replace(/^[\s\S]*(https:\/\/(www\.)?youtu\.?be.+\b)[\s\S]*/, '$1');
      youTubeLink = <CustomIcon type="link" class="icn_youtube" href={url} />;
    }
    return youTubeLink;
  };

  getZoomLink = (videoConf) => {
    let zoomLink = '';
    if (videoConf && /https:\/\/us02web\.zoom\.us\/j\/\d+\?pwd=.+/.test(videoConf)) {
      const url = videoConf.replace(
        /^[\s\S]*(https:\/\/us02web\.zoom\.us\/j\/\d+\?pwd=\S+\b)[\s\S]*/,
        '$1'
      );
      const tip = url.replace(/^https:\/\/us02web\.zoom\.us\/j\/\d{7}(\d{4}).+/, '$1');
      zoomLink = <CustomIcon type="link" class="icn_zoom" tip={tip} href={url} />;
    }
    return zoomLink;
  };

  getRowClass = (row) => {
    const date = new Date().toLocaleDateString().replace(/(\d+).(\d+).(\d+)/, '$3-$2-$1');
    let rowClass = '';
    if (row.status === 'new') rowClass = 'task_alert';
    if (metaData.dataTableName === 'discussion' && row.status === 'new' && row.date >= date) {
      rowClass = '';
    }
    if (row.priority === 'hard') rowClass = 'task_bad';
    if (row.status === 'rejected') rowClass = 'task_bad';
    if (row.status === 'done') rowClass = 'task_good';
    if (metaData.dataTableName === 'discussion' && !row.result && row.status === 'done') {
      rowClass = 'task_noresult';
    }
    return rowClass;
  };

  getGroupRowNames = (groupBy, row, headCells) => {
    let groupValue = '';
    let dayName = '';

    if (groupBy && groupBy !== '') {
      let date = '';
      if (headCells[groupBy].type === 'date') {
        date = moment(row[groupBy], 'YYYY-MM-DD');
      } else if (groupBy === 'week') {
        date = moment(row.date, 'YYYY-MM-DD');
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

    return { groupValue, dayName };
  };

  getFullText = (row, headCells) => {
    const fullText = { display: false, element: null };
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

        fullText.element =
          fullText.display && metaData.dataTable[property.id].hasFullTextLink ? (
            <CustomIcon class="icn_description" action={this.showFullText(row.id)} />
          ) : null;
      }
    });

    return fullText;
  };

  getFullTextIcon = (fullText, property, row) => {
    const element =
      fullText.display && metaData.dataTable[property].hasFullTextLink ? (
        <CustomIcon class="icn_description" action={this.showFullText(row.id)} />
      ) : null;
    return element;
  };

  getCellValue = (row, groupBy, headCell, dayName) => {
    let value =
      groupBy && (headCell.id === groupBy || (headCell.id === 'date' && groupBy === 'week'))
        ? dayName
        : row[headCell.id];
    if (headCell.type === 'time') {
      value = value.replace(/(\d\d:\d\d):\d\d/, '$1');
    } else if (headCell.id === 'mainTable') {
      value = metaData.tables[`${value}_meta`].specificParameters.tableName;
    } else if (headCell.type === 'select' && metaData[`${headCell.id}List`]) {
      ({ value } = metaData[`${headCell.id}List`][value]);
    } else if (headCell.type === 'multi-select') {
      value = value
        .split(',')
        .map((_d) => metaData[`${headCell.id}List`][_d]?.value || _d)
        .join(', ');
    }

    return value;
  };

  getWhiteSpace = (headCell, groupBy) => {
    let whiteSpace = '';
    if (['datetime', 'date', 'time'].includes(headCell.type)) {
      whiteSpace = 'nowrap';
    }
    if (groupBy && (headCell.id === groupBy || (headCell.id === 'date' && groupBy === 'week'))) {
      whiteSpace = 'pre';
    }
    return whiteSpace;
  };

  getRowDisplayIfGroup = (row, groupBy) => {
    const display =
      groupBy && this.state.groupHide[this.getDateGroup(row[groupBy])] ? 'none' : 'table-row';
    return display;
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
    const { page, order, orderBy, sort, groupBy, headCells, weekDescription, secDataList, groupHide } =
      this.state;
    const groupList = {};
    let { rowsPerPage, data } = this.state;
    const { tableName } = metaData?.specificParameters || {};

    // for `noPagination` parameter (print PDF click)
    if (this.props.noPagination) {
      data = filterTasks();
      rowsPerPage = data.length;
    }

    const hasMenuCell = getHasMenuCell();
    const fullColsNum =
      Object.values(headCells).filter((a) => a.showInTable).length + (hasMenuCell ? 1 : 0);

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
          <TblHeader
            showCondition={!this.props.noPagination}
            colSpan={hasMenuCell ? fullColsNum + 1 : fullColsNum}
            count={data.length}
            onSearch={this.setSearch}
            page={page}
            rowsPerPage={rowsPerPage}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
          {/* Title row (for questions mode) */}
          <TblRowText
            showCondition={metaData.specificParameters?.hasTitleRow && this.state.titleRow !== ''}
            className="data-table__row-title"
            colSpan={fullColsNum}
            text={this.state.titleRow}
          />
        </TableHead>

        <TableBody>
          {data.length > 0 &&
            stableSort(data, getSorting(sort))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                // It`s about how to show while 'group rows by' mode
                let showGroupByRow = false;
                const { groupValue, dayName } = this.getGroupRowNames(groupBy, row, headCells);

                if (groupBy) {
                  const groupField = this.getDateGroup(row[groupBy]);
                  if (!groupList[groupField]) {
                    groupList[groupField] = 1;
                    showGroupByRow = true;
                  }
                }

                const fullText = this.getFullText(row, headCells);
                const zoomLink = this.getZoomLink(row.videoConf);
                const youTubeLink = this.getYouTubeLink(row.videoConf);

                return (
                  <Fragment key={`${row.id}`}>
                    {groupBy && groupBy !== '' && showGroupByRow ? (
                      <TblGroupRow
                        tableName={metaData.dataTableName}
                        fullColsNum={hasMenuCell ? fullColsNum + 2 : fullColsNum}
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
                        toggleDescription={this.toggleDescription(row.week)}
                        copyPreviousWeekDiscussions={(id, week) => {
                          this.copyPreviousWeekDiscussions(id, week);
                        }}
                      />
                    ) : null}
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={`row-main-${row.id}`}
                      className={`${this.getRowClass(row)} data-table__row`}
                      style={{ display: this.getRowDisplayIfGroup(row, groupBy) }}
                    >
                      {Object.values(headCells)
                        .filter((a) => a.showInTable)
                        .sort((a, b) => (a.tableIndex >= b.tableIndex ? 1 : -1))
                        .map((headCell) => {
                          const { id } = row;

                          const property = headCell.id;
                          const value = this.getCellValue(row, groupBy, headCell, dayName);
                          const whiteSpace = this.getWhiteSpace(headCell, groupBy);
                          const fullTextIcon = this.getFullTextIcon(fullText, headCell.id, row);

                          return (
                            <Fragment key={`td-${property}-${id}`}>
                              <TableCell
                                className="data-table__cell"
                                align="left"
                                padding="none"
                                style={{ whiteSpace }}
                              >
                                {(this.state.editItem.id !== id ||
                                  this.state.editItem.property !== property) && (
                                  <TblCell
                                    value={value}
                                    headCell={headCell}
                                    zoomLink={zoomLink}
                                    youTubeLink={youTubeLink}
                                    fullTextIcon={fullTextIcon}
                                  />
                                )}

                                {/* edit item textbox */}
                                {this.state.editItem.id === id &&
                                  this.state.editItem.property === property && (
                                    <TblCellInput
                                      defaultValue={this.state.editItem}
                                      actionOk={this.handleInlineEditOk(id)}
                                      actionCancel={this.handleInlineEditClose}
                                    />
                                  )}
                              </TableCell>
                              <TblCellIcon
                                showCell={headCell.isInlineEditable && headCell.type === 'string'}
                                showInner={this.state.editItem.id !== id}
                                type="data-table__cell_inline-edit"
                                action={() => this.setEditItem({ id, property, value })}
                                tip={`????????????????: ${metaData.dataTable[property].value}`}
                                style={{ whiteSpace }}
                              />
                            </Fragment>
                          );
                        })}
                      <TblCellIcon
                        showCell={hasMenuCell}
                        showInner
                        type="data-table__hover-icon"
                        action={this.handleInlineEditClose}
                        row={row}
                        actionMenuList={this.actionMenuList}
                        style={{ paddingLeft: metaData.mobile ? '10px' : '' }}
                      />
                    </TableRow>

                    {/* Full text row - if click to show */}
                    {(this.state.showFullTextID === row.id ||
                      (weekDescription && weekDescription === row.week)) &&
                      fullText.display && (
                        <Suspense fallback={<CustomSuspenseFallback type="row" />}>
                          <TblFullTextRow data={fullText} headCells={headCells} id={row.id} />
                        </Suspense>
                      )}

                    {/* Secondary List: show and hide */}
                    {this.state.showAddRows === row.id && !groupHide[row[groupBy]] && (
                      <Suspense fallback={<CustomSuspenseFallback type="row" />}>
                        <TblSecondaryList
                          secDataList={secDataList}
                          fullColsNum={fullColsNum}
                          loadSecondaryList={() => this.loadSecondaryList(row.id, 'task')}
                        />
                      </Suspense>
                    )}
                  </Fragment>
                );
              })}
          <TblRowText
            showCondition={data.length === 0}
            colSpan={fullColsNum}
            text={tableName ? `${tableName}: ??????????????????????` : '???????????? ??????????????????????...'}
          />
        </TableBody>
      </Table>
    ) : (
      <TblLoading />
    );
  }
}
