import storage from '../storages/commonStorage';
import { metaData, dataTable, mainModes, filters, setDataTable } from '../config/data';
import { urlApi } from '../config/constants';
import axios from 'axios';
import setMockAdapter from './apiMockAdapter';

setMockAdapter();

axios.defaults.headers.get['Content-Type'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
axios.defaults.headers.delete['Content-Type'] = 'application/json';

class Api {
  static async getUser() {
    return axios.get(`${urlApi}/user/`).then(Api._handleApiResult.bind(null, 'getUser'));
  }

  static async getProject() {
    return axios.get(`${urlApi}/project/`).then(Api._handleApiResult.bind(null, 'getProject'));
  }

  static async getDeveloper() {
    return axios.get(`${urlApi}/developer/`).then(Api._handleApiResult.bind(null, 'getDeveloper'));
  }

  static async getMetaData(mode) {
    return axios.get(`${urlApi}/${mode}/`).then(Api._handleApiResult.bind(null, 'getMetaData'));
  }

  static async getData(mode) {
    return axios.get(`${urlApi}/${mode}/`).then(Api._handleApiResult.bind(null, 'getData'));
  }

  static async putData(mode, body) {
    return axios.put(`${urlApi}/${mode}/`, body).then(Api._handleApiResult.bind(null, 'putData'));
  }

  static async patchData(mode, body) {
    return axios.patch(`${urlApi}/${mode}/`, body).then(Api._handleApiResult.bind(null, 'patchData'));
  }

  static async deleteData(mode, body) {
    return axios.delete(`${urlApi}/${mode}/`, body).then(Api._handleApiResult.bind(null, 'deleteData'));
  }

  static async postData(mode, body) {
    return axios.post(`${urlApi}/${mode}/`, body).then(Api._handleApiResult.bind(null, 'postData'));
  }

  static _handleApiResult(fnName, res) {
    return res.data.data;

    if (res.data.status !== 'OK') {
      storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
      console.error(`Ошибка запроса: ${res.data.error}`);
    }

    if (!['OK', 'Created', 'No Content'].includes(res.statusText)) {
      storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
      console.error(`Ошибка HTTP:  + ${res.statusText}`);
    }

    return ['OK', 'Created', 'No Content'].includes(res.statusText)
      ? res.data
      : Error(`Ошибка получения результата в ${fnName}: ${res.status} ${res.statusText}`);
  }
}

/* get meta/data etc function */
export const getData = async (mode, type = 'initialize', filter = {}) => {
  if (mode === 'user') {
    const result = await Api.getUser();

    if (result !== 'ERROR') {
      metaData.user = result;
      metaData.login = result.login;

      return result;
    }
  }

  if (mode === 'project' || mode === 'developer') {
    let result;
    if (mode === 'project') result = await Api.getProject();
    if (mode === 'developer') result = await Api.getDeveloper();

    if (result !== 'ERROR') {
      metaData[`${mode}List`] = {};
      for (let info of result) {
        metaData[`${mode}List`][info.id] = { id: info.id, value: info.value };
      }
    }

    if (!metaData[`${mode}List`] || Object.keys(metaData[`${mode}List`]).length === 0) {
      throw new Error('Data not uploaded');
    }
  }

  if ( mainModes.map(m => `${m}_meta`).includes(mode)) {
    if (!metaData.tables[mode]) {
      const result = await Api.getMetaData(mode);

      if (result !== 'ERROR') {
        metaData.tables[mode] = {};
        metaData.tables[mode].dataTable = {};
        for (let infoR of result) {
          let infoKey = Object.keys(infoR)[0];
          let info = Object.values(infoR)[0];

          //fix json 'true','false' to boolean
          for (let key in info) {
            if (metaData.mobile && typeof info.showInTableMobile !== 'undefined')
              info.showInTable = info.showInTableMobile;

            if (info[key] === 'true') info[key] = true;
            if (info[key] === 'false') info[key] = false;
          }

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
        }
      }
    }

    if (metaData.tables[mode] && mode === metaData.dataTableName + '_meta') {
      for (let key in metaData.tables[mode]) {
        metaData[key] = metaData.tables[mode][key];
      }
      setDataTable([]);
    }

    for (let prop in metaData.dataTable) {
      let propInfo = metaData.dataTable[prop];
      if (
        (propInfo.type === 'select' || propInfo.type === 'multi-select') &&
        !metaData[`${prop}List`] &&
        propInfo.vocabulary &&
        metaData[`${propInfo.vocabulary}List`]
      ) {
        metaData[`${prop}List`] = metaData[`${propInfo.vocabulary}List`];
      }
    }

    filters.setKeys(metaData.dataTable);
  }

  let data = [];
  if (mainModes.includes(mode)) {
    const result = await Api.getData(mode);

    if (result !== 'ERROR') {
      if (type === 'initialize') setDataTable([]);

      for (let info of result) {
        try {
          info.id = parseInt(info.id);
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
export const doData = async (mode, data, id, feature) => {
  if (!feature) feature = 'task';
  let json = {};
  let error = true;

  if (!['put', 'delete', 'patch', 'notify'].includes(mode)) {
    console.error(`Mode [${mode}] is not available`);
  } else {
    try {
      let body = {
        feature: feature,
        data: {
          data: data,
          id: id,
        },
      };

      let result;
      if (mode === 'put') result = await Api.putData(feature, body);
      if (mode === 'patch') result = await Api.patchData(feature, body);
      if (mode === 'delete') result = await Api.deleteData(feature, body);
      if (mode === 'notify') result = await Api.postData(feature, {...body, method: mode});

      json = result !== "ERROR" ? result.data : result;
    } catch (err) {
      console.log(`Unexpected error ${err}`); // Failed to fetch
    }
  }

  return [error, json];
};

/* file uploader function */
export async function fileUpload(file) {
  let urlApi = '/smisplan/cgi/upload.pl';
  const formData = new FormData();
  formData.append('file', file);

  let json = {};
  let error = true;
  try {
    let response = await fetch(urlApi, {
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
