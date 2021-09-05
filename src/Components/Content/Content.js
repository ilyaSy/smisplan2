import React, { Suspense, lazy } from 'react';
import CustomSuspenseFallback from '../../SharedComponents/CustomSuspenseFallback';

import storage from '../../storages/commonStorage';
import DataTable from '../DataTable/DataTable';
import './Content.css';

const MainCalendar = lazy(() => import('../MainCalendar/MainCalendar'));
const DataAdd = lazy(() => import('../DataAdd/DataAdd'));

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
          <Suspense fallback={<CustomSuspenseFallback type="loading" />}>
            <DataTable reloadDataTable={reloadDataTable} ref={dataRef} />
          </Suspense>
        </div>
      ) : (
        <div className="content__calendar">
          <Suspense fallback={<CustomSuspenseFallback type="loading" />}>
            <MainCalendar dates={dataTable} />
          </Suspense>
        </div>
      )}

      <Suspense fallback={<CustomSuspenseFallback type="loading" />}>
        <DataAdd />
      </Suspense>
    </section>
  );
}
