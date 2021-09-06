import React from 'react';
import { TableRow, TableCell } from '@material-ui/core';
import TblHeaderSearch from '../TblHeaderSearch/TblHeaderSearch';
import TblHeaderPagination from '../TblHeaderPagination/TblHeaderPagination';

function TblHeader({
  showCondition,
  colSpan,
  count,
  onSearch,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}) {
  return showCondition ? (
    <TableRow>
      <TableCell colSpan={colSpan} className="data-table__pagination-cell">
        <TblHeaderSearch setSearch={onSearch} />

        <TblHeaderPagination
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      </TableCell>
    </TableRow>
  ) : null;
}

export default React.memo(TblHeader);
