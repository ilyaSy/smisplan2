import React, { Suspense, lazy } from 'react';
import LoadingComponent from '../LoadingComponent/LoadingComponent';

import { dataTable, metaData } from '../../config/data';
import storage from '../../storages/commonStorage';
import DataTable from '../DataTable/DataTable';
import './Content.css';

const MainCalendar = lazy(() => import('../MainCalendar/MainCalendar'));
const DataAdd = lazy(() => import('../DataAdd/DataAdd'));

export default function Content(props) {
  const { reloadDataTable, dataRef } = props;
  const [tableName, setTableName] = React.useState(metaData.dataTableName);

  const subscribe = () =>
    storage.table.subscribe(() => {
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
          <Suspense fallback={<LoadingComponent />}>
            <DataTable reloadDataTable={reloadDataTable} ref={dataRef} />
          </Suspense>
        </div>
      ) : (
        <div className="content__calendar">
          <Suspense fallback={<LoadingComponent />}>
            <MainCalendar dates={dataTable} />
          </Suspense>
        </div>
      )}

      <Suspense fallback={<LoadingComponent />}>
        <DataAdd />
      </Suspense>
    </section>
  );
}
