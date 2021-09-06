import React from 'react';
import { TableRow, TableCell } from '@material-ui/core';

function TblRowText({ showCondition, colSpan, text, className }) {
  return showCondition ? (
    <TableRow>
      <TableCell colSpan={colSpan} className={className}>
        {text}
      </TableCell>
    </TableRow>
  ) : null;
}

export default React.memo(TblRowText);
