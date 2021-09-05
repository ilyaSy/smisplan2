import React from 'react';
import { TableRow, TableCell } from '@material-ui/core';
import LoadingComponent from '../Components/LoadingComponent/LoadingComponent';

function CustomSuspenseFallback({ type }) {
  return (
    <>
      {type === 'loading' && <LoadingComponent />}
      {type === 'textNode' && <p>...</p>}
      {type === 'row' && (
        <TableRow>
          <TableCell>...</TableCell>
        </TableRow>
      )}
    </>
  );
}

export default React.memo(CustomSuspenseFallback);
