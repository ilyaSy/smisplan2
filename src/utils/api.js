import storage from '../storages/commonStorage';
import { metaData, dataTable, mainModes, filters, setDataTable } from '../config/data';
import { urlApi } from '../config/constants';
import axios from 'axios';
import setMockAdapter from './apiMockAdapter';

setMockAdapter();

axios.defaults.headers.get['Content-Type'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';

class Api {
  static async getUser() {
    return axios.get(`${urlApi}/user/`).then(Api._handleApiResult.bind(null, 'getUser'));
  }

  static async getProjectDeveloper(mode) {
    return axios.get(`${urlApi}/${mode}/`).then(Api._handleApiResult.bind(null, 'getProjectDeveloper'));
  }

  static async getMetaData(mode) {
    return axios.get(`${urlApi}/${mode}/`).then(Api._handleApiResult.bind(null, 'getMetaData'));
  }

  static async getData(mode) {
    return axios.get(`${urlApi}/${mode}/`).then(Api._handleApiResult.bind(null, 'getData'));
  }

  static _handleApiResult(fnName, res) {
    if (res.data.status !== 'OK') {
      storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
      console.error(`Ошибка запроса: ${res.data.error}`);
    }

    if (!['OK', 'Created', 'No Content'].includes(res.statusText)) {
      storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
      console.error(`Ошибка HTTP:  + ${res.statusText}`);
    }

    return res.data;

    return ['OK', 'Created', 'No Content'].includes(res.statusText)
      ? res.data
      : Error(`Ошибка получения результата в ${fnName}: ${res.status} ${res.statusText}`);
  }
}

/* get meta/data etc function */
export const getData = async (mode, type = 'initialize', filter = {}) => {
  let urlParam = ['method=get', `feature=${mode}`];

  if (Object.keys(filter).length > 0) {
    urlParam.push('data=' + JSON.stringify(filter));
  }

  if (mode === 'user') {
    // let result = await _getData(`${urlApi}/${mode}/`);
    const result = await Api.getUser();
    if (result !== 'ERROR') {
      metaData.user = result;
      metaData.login = result.login;

      return result;
    }
  }

  if (mode === 'project' || mode === 'developer') {
    // let result = await _getData(`${urlApi}/${mode}/`);
    const result = await Api.getProjectDeveloper(mode);

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
      // let result = await _getData(`${urlApi}/${mode}/`);
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
    // let result = await _getData(`${urlApi}/${mode}/`);
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
  let urlParam = [`feature=${feature}`, `method=${mode}`];
  let error = true;

  if (mode !== 'put' && mode !== 'delete' && mode !== 'patch' && mode !== 'notify') {
    console.error(`Mode [${mode}] is not correctly defined`);
  } else {
    try {
      let body = {
        feature: feature,
        method: mode,
        data: {
          data: data,
          id: id,
        },
      };
      // let response = axios.post(urlApi + '?' + urlParam.join('&'), {body});
      // let response = await fetch(urlApi, {
      let response = await fetch(urlApi + '?' + urlParam.join('&'), {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (response && response.ok) {
        json = await response.json();

        if (json.status === 'OK') {
          error = false;
        } else if (json.error) {
          console.log(`Ошибка запроса: ${json.error}`);
        }
      } else {
        console.log(`Ошибка HTTP:  + ${response.status}`);
      }
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
