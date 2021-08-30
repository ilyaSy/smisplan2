import storage from '../storages/commonStorage';

export const modes = [
  { id: 'task', value: 'Задачи', realData: true },
  { id: 'discussion', value: 'Обсуждения', realData: true },
  { id: 'calendar', value: 'Календарь', realData: true },
  { id: 'event', value: 'Изменения', realData: true },
];

export const mainModes = modes.filter(e => e.realData).map(e => e.id);

export let dataTable = [];
export let metaData = {
  mobile: false,
  user: {},
  dataTableName: 'task',
  projectList: {},
  developerList: {},
  dataTable: {},
  tables: {},
};

export const setDataTable = (data) => {
  dataTable = data;
};

/* main Filter class */
class Filters {
  constructor(props) {
    this.data = { developer: [], project: '' };
    this.perm = {};

    let filtersStorageString = sessionStorage.getItem('filters');
    if (filtersStorageString && filtersStorageString !== '{}') {
      let filtersStorage = JSON.parse(filtersStorageString);
      this.data = filtersStorage[metaData.dataTableName]?.data || {};
      this.perm = filtersStorage[metaData.dataTableName]?.perm || {};

      let hasStorageFilters = false;
      Object.values(this.data).forEach((v) => {
        if ((!Array.isArray(v) && v !== '') || (Array.isArray(v) && v.length > 0))
          hasStorageFilters = true;
      });
      if (hasStorageFilters)
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Были использованы ранее сохранённые фильтры',
        });
    }
  }

  // clear all data
  clear = () => {
    for (let key of this.getKeys()) {
      if (/^_.+/.test(key)) {
        delete this.data[key];
      } else if (typeof this.data[key] === 'string') {
        this.data[key] = '';
      } else {
        this.data[key] = [];
      }
    }
  };

  setKeys = (tbl) => {
    Object.values(tbl)
      .filter((a) => {
        return a.isFilter;
      })
      .forEach((value) => {
        if (typeof this.data[value.id] === 'undefined') this.data[value.id] = '';
      });
  };

  // set single filter field + all fields where this one is as Vocabulary
  setValue = (mode = 'data', field, value) => {
    this[mode][field] = value;

    let vocFilter = [];
    for (let f in metaData.dataTable) {
      if (metaData.dataTable[f].vocabulary === field) vocFilter.push(f);
    }

    if (vocFilter.length > 0) {
      if (vocFilter.length === 1) {
        this[mode][vocFilter[0]] = value;
      } else {
        this[mode]['_' + vocFilter.join('OR')] = value;
      }
    }
  };

  // get all keys
  getKeys = (mode = 'data') => {
    return Object.keys(this[mode]);
  };

  // check if field is filter
  checkFilter = (f) => {
    return this.getKeys().indexOf(f) > -1 ? true : false;
  };

  // check if row data is ok for filter
  checkValue = (task) => {
    let filter = true;
    let filterData = {};

    this.getKeys('data').map((key) => {
      if (Array.isArray(filterData[key])) {
        return filterData[key].includes(this.data[key])
      }
      return (filterData[key] = this.data[key]);
    });
    this.getKeys('perm').map((key) => {
      return (filterData[key] = this.perm[key]);
    });

    for (let f in filterData) {
      if (!filterData[f] || filterData[f] === '') continue;
      if (!metaData.dataTable[f] && f.search(/^_.+OR.+$/) === -1 && f !== 'commonFieldSearch')
        continue;

      // filter for SEARCH
      if (f === 'commonFieldSearch') {
        for (let field in task) {
          if (field === 'value') continue;
          if (
            field !== metaData.specificParameters.mainValue // && metaData.dataTable[field]?.type !== 'fulltext'
          )
            continue;
          if (typeof task[field] !== 'string') continue;
          filter = this.compare(filterData[f], task[field], true);
          if (filter) break;
        }
      } else if (f.search(/^_(.+OR.+)$/) !== -1) {
        let fieldsString = f.replace(/^_(.+OR.+)/, '$1');
        let fieldsArray = fieldsString.split('OR');
        for (let field of fieldsArray) {
          if (!metaData.dataTable[field]) continue;

          if (metaData.dataTable[field].type === 'multi-select') {
            for (let ff of task[field].split(',')) {
              filter = this.compare(filterData[f], ff);
              if (filter) break;
            }
          } else {
            filter = this.compare(filterData[f], task[field]);
          }
          if (filter) break;
        }
      } else if (metaData.dataTable[f].type === 'multi-select') {
        for (let ff of task[f].split(',')) {
          filter = this.compare(filterData[f], ff);
          if (filter) break;
        }
      } else {
        filter = this.compare(filterData[f], task[f]);
      }
      if (!filter) break;
    }
    return filter;
  };

  // compare two direct values: filter and row data value
  compare = (propertyValue, taskValue, asRegexp = 'false') => {
    let filter = true;
    if (typeof propertyValue === 'string') {
      if (
        propertyValue !== '' &&
        taskValue &&
        taskValue !== '' &&
        taskValue.search(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/) !== -1
      ) {
        let date = taskValue.replace(/(\d{4}-\d{2}-\d{2}) \d{2}:\d{2}:\d{2}/, '$1');

        if (propertyValue !== date) filter = false;
      } else if (taskValue && propertyValue !== '' && !asRegexp) {
        if (propertyValue !== taskValue) filter = false;
      } else if (taskValue && propertyValue !== '' && asRegexp) {
        if (taskValue.search(new RegExp(propertyValue, 'i')) === -1) filter = false;
      } else if ((!taskValue || taskValue === '') && propertyValue !== '') {
        filter = false;
      }
    } else if (typeof propertyValue === 'number') {
      if (propertyValue && propertyValue > 0 && propertyValue !== parseInt(taskValue))
        filter = false;
    } else {
      if (propertyValue && propertyValue.length > 0 && propertyValue.indexOf(taskValue) === -1)
        filter = false;
    }

    return filter;
  };
}

export let filters = new Filters({});

/* universal filter function */
export function filterTasks(redrawTable = false) {
  // const filtersString = JSON.stringify(filters);
  // sessionStorage.setItem('filters', filtersString);
  // const filtersString = JSON.stringify({[metaData.dataTableName]: filters});

  const filtersStorage = JSON.parse(sessionStorage.getItem('filters') || '{}');
  if (redrawTable) {
    filters.data = filtersStorage[metaData.dataTableName]?.data || {};
    filters.perm = filtersStorage[metaData.dataTableName]?.perm || {};
  } else {
    if (filters.data.developer && filters.data.developer.length > 0) {
      modes.forEach(mode => {
        if (filtersStorage[mode.id]) {
          filtersStorage[mode.id].data.developer = [...filters.data.developer];
        } else {
          filtersStorage[mode.id] = {
            data: {
              developer: [...filters.data.developer],
            }
          };
        }
      })
    }

    filtersStorage[metaData.dataTableName] = filters;
    const filtersString = JSON.stringify(filtersStorage);
    sessionStorage.setItem('filters', filtersString);
  }

  let dataTableShow = [];
  for (let task of dataTable) {
    let filter = filters.checkValue(task);
    if (filter) dataTableShow.push(task);
  }

  return dataTableShow;
}
