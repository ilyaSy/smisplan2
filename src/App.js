import React, {Suspense, lazy} from 'react';

import { metaData, filters, mainModes } from './config/data';
import { getData } from './utils/api';
import storage from './storages/commonStorage';
import Header from './Components/Header/Header';
import HeaderLogin from './Components/HeaderLogin/HeaderLogin';
import MainLeftSide from './Components/MainLeftSide/MainLeftSide';
import Content from './Components/Content/Content';
import './App.css';

const Hint = lazy(() => import('./SharedComponents/Hint'));

export default function App() {
  const [developers, setDevelopers] = React.useState([]);
  const _divDataTable = React.useRef(null);

  const reloadDataTable = (dataTableName, func, resetFilter = true) => {
    metaData.dataTableName = dataTableName;
    storage.table.dispatch({ type: 'SET_TABLENAME', tableName: dataTableName });

    if (resetFilter) filters.clear();
    if (resetFilter) sessionStorage.removeItem('sort');

    Promise.all([getData(`${dataTableName}_meta`), getData(metaData.dataTableName)])
      .then(() => { if (typeof func === 'function') func(); })
      .then(() => { storage.state.dispatch({ type: 'SET_DATALOADING', stage: 'data' }); });
  };

  const pathname = document.location.pathname;
  const hostpath = window.location.href.search(/localhost:3000/) !== -1 ? '' : 'smisplan';
  const pathArray = pathname.split('/').slice(1);
  if (pathArray[0] === hostpath) {
    pathArray.shift();
  }

  const tableName = pathArray[0];
  const inputFilter = { data: {} };
  if (pathArray[1] !== '') {
    inputFilter.developer = pathArray[1];
  }

  if (mainModes.includes(tableName)) metaData.dataTableName = tableName;

  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    metaData.mobile = true;

    let root = document.documentElement;
    root.style.setProperty('--font-size-table-title', '16px');
    root.style.setProperty('--font-size-table', '14px');
  }

  React.useEffect(() => {
    getData('developer').then(() => {
      setDevelopers(metaData.developerList)
      Promise.all([ ...mainModes.map((mode) => getData(`${mode}_meta`)), getData(metaData.dataTableName) ])
        .then(() => { storage.state.dispatch({ type: 'SET_DATALOADING', stage: 'data' }); })
    });
  }, []);

  return (
    <div id="mainTable" style={{ width: '100%', height: '100%' }}>
      <header style={{ display: 'flex' }}>
        <HeaderLogin reloadDataTable={reloadDataTable} dataRef={_divDataTable} />
        <div className="divSpacingUp" />
        <Header reloadDataTable={reloadDataTable} />
      </header>

      <main style={{ display: 'flex' }} className="divBottom">
        <MainLeftSide developer={inputFilter.developer} developers={developers}/>
        <Content dataRef={_divDataTable} reloadDataTable={reloadDataTable} />

        <Suspense fallback={<p>...</p>}>
          <Hint />
        </Suspense>
      </main>
    </div>
  );
}
