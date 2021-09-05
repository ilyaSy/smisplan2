import React from 'react';
import LoadingComponent from '../LoadingComponent/LoadingComponent';

import storage from '../../storages/commonStorage';
import DataTable from '../DataTable/DataTable';
import './Content.css';

const MainCalendar = React.lazy(() => import('../MainCalendar/MainCalendar'));
const DataAdd = React.lazy(() => import('../DataAdd/DataAdd'));

export default function Content({ dataRef, reloadDataTable, dataTable, dataTableName }) {
  const [tableName, setTableName] = React.useState(dataTableName);

  const subscribe = storage.table.subscribe(() => {
    const storageTableName = storage.table.getState().TABLE.tableName;
    if (storageTableName) {
      setTableName(storageTableName);
    }
  });

  React.useEffect(() => {
    subscribe();
    return subscribe();
  }, [tableName]);

  return (
    <section className="content">
      {tableName !== 'calendar' ? (
        <div className="content__table">
          <React.Suspense fallback={<LoadingComponent />}>
            <DataTable reloadDataTable={reloadDataTable} ref={dataRef} />
          </React.Suspense>
        </div>
      ) : (
        <div className="content__calendar">
          <React.Suspense fallback={<LoadingComponent />}>
            <MainCalendar dates={dataTable} />
          </React.Suspense>
        </div>
      )}

      <React.Suspense fallback={<LoadingComponent />}>
        <DataAdd />
      </React.Suspense>
    </section>
  );
}
