import axios from 'axios';
import storage from '../storages/commonStorage';
import { urlApi, TEST } from '../config/constants';
import setMockAdapter from './apiMockAdapter';

setMockAdapter();

axios.defaults.headers.get['Content-Type'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
axios.defaults.headers.delete['Content-Type'] = 'application/json';

export default class Api {
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
    return axios
      .get(`${urlApi}/${mode.replace('_', '-')}/`)
      .then(Api._handleApiResult.bind(null, 'getMetaData'));
  }

  static async getData(mode) {
    return axios.get(`${urlApi}/${mode}/`).then(Api._handleApiResult.bind(null, 'getData'));
  }

  static async putData(mode, body) {
    return axios.put(`${urlApi}/${mode}/`, body).then(Api._handleApiResult.bind(null, 'putData'));
  }

  static async patchData(mode, body) {
    return axios
      .patch(`${urlApi}/${mode}/`, body)
      .then(Api._handleApiResult.bind(null, 'patchData'));
  }

  static async deleteData(mode, body) {
    return axios
      .delete(`${urlApi}/${mode}/`, body)
      .then(Api._handleApiResult.bind(null, 'deleteData'));
  }

  static async postData(mode, body) {
    return axios.post(`${urlApi}/${mode}/`, body).then(Api._handleApiResult.bind(null, 'postData'));
  }

  static _handleApiResult(fnName, res) {
    // console.log(res);
    if (TEST) {
      return res.data.data;
    }

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
