import { metaData, dataTable, resetDataTable } from '../config/data';
import { filters } from './filters';
import { mainModes } from '../config/constants';
import Api from './api';

const getUser = async () => {
  const result = await Api.getUser();

  if (result !== 'ERROR') {
    metaData.user = result;
    metaData.login = result.login;
  }
  return result;
};

const getProjectDeveloper = async (mode) => {
  const dataList = {};
  let result;

  if (mode === 'project') result = await Api.getProject();
  if (mode === 'developer') result = await Api.getDeveloper();

  if (result !== 'ERROR') {
    result.forEach((info) => {
      dataList[info.id] = { id: info.id, value: info.value };
    });
  }

  return dataList;
};

/* get meta/data etc function */
// eslint-disable-next-line consistent-return
export const getData = async (mode, type = 'initialize') => {
  if (mode === 'user') {
    const result = await getUser();
    return result;
  }

  if (mode === 'project' || mode === 'developer') {
    const result = await getProjectDeveloper(mode);

    if (!result || Object.keys(result).length === 0) {
      throw new Error('Data not uploaded');
    } else {
      metaData[`${mode}List`] = { ...result };
      return result;
    }
  }

  if (mainModes.map((m) => `${m}_meta`).includes(mode)) {
    if (!metaData.tables[mode]) {
      const result = await Api.getMetaData(mode);

      if (result !== 'ERROR') {
        metaData.tables[mode] = {};
        metaData.tables[mode].dataTable = {};

        result.forEach((infoR) => {
          const infoKey = Object.keys(infoR)[0];
          const info = Object.values(infoR)[0];

          Object.keys(info).forEach((key) => {
            if (metaData.mobile && typeof info.showInTableMobile !== 'undefined')
              info.showInTable = info.showInTableMobile;

            if (info[key] === 'true') info[key] = true;
            if (info[key] === 'false') info[key] = false;
          });

          if (infoKey === 'specificParameters') {
            metaData.tables[mode][infoKey] = info;
          } else if (typeof info.validValues !== 'undefined' && info.validValues !== '') {
            metaData.tables[mode][`${info.id}List`] = info.validValues;
          } else if (
            (typeof info.validValues === 'undefined' || info.validValues === '') &&
            (info.type === 'select' || info.type === 'multi-select') &&
            info.vocabulary &&
            metaData[`${info.vocabulary}List`]
          ) {
            metaData.tables[mode][`${info.id}List`] = metaData[`${info.vocabulary}List`];
          }

          if (infoKey !== 'specificParameters') {
            metaData.tables[mode].dataTable[info.id] = info;
          }
        });
      }
    }

    if (metaData.tables[mode] && mode === `${metaData.dataTableName}_meta`) {
      Object.keys(metaData.tables[mode]).forEach((key) => {
        metaData[key] = metaData.tables[mode][key];
      });
      resetDataTable();
    }

    Object.keys(metaData.dataTable).forEach((prop) => {
      const propInfo = metaData.dataTable[prop];
      if (
        (propInfo.type === 'select' || propInfo.type === 'multi-select') &&
        !metaData[`${prop}List`] &&
        propInfo.vocabulary &&
        metaData[`${propInfo.vocabulary}List`]
      ) {
        metaData[`${prop}List`] = metaData[`${propInfo.vocabulary}List`];
      }
    });

    filters.setKeys(metaData.dataTable);
  }

  const data = [];
  if (mainModes.includes(mode)) {
    const result = await Api.getData(mode);

    if (result !== 'ERROR') {
      if (type === 'initialize') resetDataTable();

      for (let i = 0; i < result.length; i++) {
        const info = result[i];

        try {
          info.id = parseInt(info.id, 10);
        } catch (e) {
          console.error('Ошибка: невозможно поле id сделать integer');
        }

        if (type === 'meta') {
          if (!metaData[`${mode}List`]) metaData[`${mode}List`] = {};
          metaData[`${mode}List`][info.id] = info;
        } else if (type === 'initialize') {
          dataTable.push(info);
        } else if (type === 'direct') {
          data.push(info);
        }
      }

      if (type === 'direct') {
        return data;
      }
    }
  }
};

/* put/delete/patch data */
export const doData = async (mode, data, id, feature = 'task') => {
  let json = {};
  let error = true;

  if (!['put', 'delete', 'patch', 'notify'].includes(mode)) {
    console.error(`Mode [${mode}] is not available`);
  } else {
    try {
      const body = {
        feature,
        data: { data, id },
      };

      let result;
      if (mode === 'put') result = await Api.putData(feature, body);
      if (mode === 'patch') result = await Api.patchData(feature, body);
      if (mode === 'delete') result = await Api.deleteData(feature, body);
      if (mode === 'notify') result = await Api.postData(feature, { ...body, method: mode });

      json = result;
      if (result !== 'ERROR') {
        error = false;
      }
    } catch (err) {
      console.log(`Unexpected error ${err}`); // Failed to fetch
    }
  }

  return [error, json];
};

/* file uploader function */
export async function fileUpload(file) {
  const urlUploadApi = '/smisplan/cgi/upload.pl';
  const formData = new FormData();
  formData.append('file', file);

  let json = {};
  let error = true;
  try {
    const response = await fetch(urlUploadApi, {
      method: 'POST',
      body: formData,
    });

    if (response && response.ok) {
      json = await response.json();

      if (json.status === 'OK') {
        error = false;
      } else if (json.error) {
        console.log(`Ошибка запроса: ${json.error}`);
      }
    }
  } catch (err) {
    console.log(`Unexpected error ${err}`); // Failed to fetch
  }

  return [json, error];
}
