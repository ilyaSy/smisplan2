import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

function TblLoading() {
  return (
    <div className="data-table__loading">
      <CircularProgress style={{ width: '100px', height: '100px' }} />
    </div>
  );
}

export default React.memo(TblLoading);
