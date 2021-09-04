// import storage from '../storages/commonStorage';

export const modes = [
  { id: 'task', value: 'Задачи', realData: true },
  { id: 'discussion', value: 'Совещания', realData: true },
  { id: 'calendar', value: 'Календарь', realData: true },
  { id: 'event', value: 'Изменения', realData: true },
];

export const mainModes = modes.filter((e) => e.realData).map((e) => e.id);

export const dataTable = [];
export const metaData = {
  mobile: false,
  user: {},
  dataTableName: 'task',
  projectList: {},
  developerList: {},
  dataTable: {},
  tables: {},
};

export const resetDataTable = () => {
  dataTable.splice(0);
};
