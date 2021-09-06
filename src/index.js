// import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const basepath = window.location.href.search(/localhost:3000/) !== -1 ? '/' : '/smisplan2';

ReactDOM.render(
  <BrowserRouter basename={basepath}>
    <App />
  </BrowserRouter>,
  document.querySelector('#root')
);
