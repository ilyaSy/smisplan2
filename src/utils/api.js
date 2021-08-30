import Cookies from 'js-cookie';
import storage from '../storages/commonStorage';
import { metaData, dataTable, mainModes, filters, setDataTable } from '../config/data';
import { urlApi } from '../config/.env.local.js';
// import axios from 'axios';
// import setMockAdapter from './serverApi';
// if (TEST_MODE) {
//   setMockAdapter();
// }
// axios.defaults.headers.get['Content-Type'] = 'application/json';
// axios.defaults.headers.post['Content-Type'] = 'application/json';
// axios.defaults.headers.patch['Content-Type'] = 'application/json';
// if (TEST_MODE) {
//   return res.data;
// }

/* check authentication function */
const _checkAuth = () => {
  const authPeriod = 12 * 60 * 60;

  if (window.location.host !== 'localhost:3000') {
    const timeCookie = Cookies.get('smistime');
    const cidCookie = Cookies.get('cidsmis');

    // timeout reload
    if (typeof timeCookie !== 'undefined') {
      const timeNow = Math.round(Date.now() / 1000);
      if (timeNow - timeCookie > authPeriod) {
        // window.location.reload(true);
        window.location.href = '/login/login.pl?mode=show&from=' + encodeURI(document.location.pathname) + "&code=6";
      }
    }
    // no cookie reload
    if (
      typeof timeCookie === 'undefined' || timeCookie === '' || !timeCookie ||
      typeof cidCookie === 'undefined' || cidCookie === '' || !cidCookie ) {
      // window.location.reload(true);
      window.location.href = '/login/login.pl?mode=show&from=' + encodeURI(document.location.pathname) + "&code=6";
    }
  }
};

/* get data function */
const _getData = async (url) => {
  // try {
  //   let response = await axios.get(url);

  //   if (response && response.status === 200) {
  //     if (response.data.status === 'OK') {
  //       return response.data.data;
  //     } else if (response.data.error) {
  //       storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
  //       console.error(`Ошибка запроса: ${response.data.error}`);
  //     }
  //   } else {
  //     storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
  //     console.error(`Ошибка HTTP:  + ${response.status}`);
  //   }
  // } catch (err) {
  //   storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
  //   console.error(`Unexpected error ${err}`); // Failed to fetch
  // }

  try {
    let response = await fetch(url);

    if (response && response.ok) {
      let json = await response.json();

      if (json.status === 'OK') {
        return json.data;
      } else if (json.error) {
        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
        console.error(`Ошибка запроса: ${json.error}`);
      }
    } else {
      storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
      console.error(`Ошибка HTTP:  + ${response.status}`);
    }
  } catch (err) {
    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка' });
    console.error(`Unexpected error ${err}`); // Failed to fetch
  }
};

/*const wait = (ms) => {
    let start = new Date().getTime();
    let end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}*/

/* get meta/data etc function */
export const getData = async (mode, type = 'initialize', filter = {}) => {
  _checkAuth();

  let urlParam = ['method=get', `feature=${mode}`];

  if (Object.keys(filter).length > 0) {
    urlParam.push('data=' + JSON.stringify(filter));
  }

  if (mode === 'user') {
    let result = _getData(urlApi + '?' + urlParam.join('&'));
    if (result !== 'ERROR') {
      metaData.user = result;
      metaData.login = result.login;

      return result;
    }
  }

  if (mode === 'project' || mode === 'developer') {
    let result = await _getData(urlApi + '?' + urlParam.join('&'));

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

  if (mode === 'all_meta'){
    let result = await _getData(urlApi + '?' + urlParam.join('&'));

    if (result !== 'ERROR') {
      for (const metaMode of ['task', 'taskgroup', 'event', 'spec_notes', 'discussion']) {
        metaData.tables[metaMode] = {};
        metaData.tables[metaMode].dataTable = {};

        for (let infoR of result[metaMode]) {
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
            metaData.tables[metaMode][infoKey] = info;
          } else if (typeof info.validValues !== 'undefined' && info.validValues !== '') {
            metaData.tables[metaMode][`${info.id}List`] = info.validValues;
          } else if (
            (typeof info.validValues === 'undefined' || info.validValues === '') &&
            (info.type === 'select' || info.type === 'multi-select') &&
            info.vocabulary &&
            metaData[`${info.vocabulary}List`]
          ) {
            metaData.tables[metaMode][`${info.id}List`] = metaData[`${info.vocabulary}List`];
          }

          if (infoKey !== 'specificParameters') {
            metaData.tables[metaMode].dataTable[info.id] = info;
          }
        }

        if (metaData.tables[metaMode] && metaMode === metaData.dataTableName) {
          for (let key in metaData.tables[metaMode]) {
            metaData[key] = metaData.tables[metaMode][key];
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
    }
  }

  if ( mainModes.map(m => `${m}_meta`).indexOf(mode) !== -1) {
    if (!metaData.tables[mode]) {
      let result = await _getData(urlApi + '?' + urlParam.join('&'));
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
  if (mainModes.indexOf(mode) !== -1) {
    let result = await _getData(urlApi + '?' + urlParam.join('&'));
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
  _checkAuth();

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
