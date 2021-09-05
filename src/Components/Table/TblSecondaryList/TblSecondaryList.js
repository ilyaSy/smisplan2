import React from 'react';
import { MenuItem, ListItemIcon, Typography, TableRow, TableCell } from '@material-ui/core';
import CustomIcon from '../../../SharedComponents/CustomIcon';

function TblSecondaryList(props) {
  const { secDataList, fullColsNum, loadSecondaryList } = props;
  return (
    <>
      {secDataList.length > 0 ? (
        secDataList.map((row) => (
          <TableRow key={`secDataListRow-${row.string}`}>
            <TableCell colSpan={fullColsNum} className="data-table__row-secondarylist">
              {row.string}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={fullColsNum} className="data-table__row-secondarylist">
            Данных нет
          </TableCell>
        </TableRow>
      )}

      <TableRow>
        <TableCell colSpan={fullColsNum} className="data-table__row-secondarylist-hide">
          <MenuItem style={{ paddingTop: '2px', paddingBottom: '2px' }} onClick={loadSecondaryList}>
            <ListItemIcon>
              <CustomIcon class="icn_secDataListCollapse" action={loadSecondaryList} />
            </ListItemIcon>

            <Typography variant="inherit" noWrap style={{ fontSize: 'var(--font-size-table)' }}>
              Свернуть
            </Typography>
          </MenuItem>
        </TableCell>
      </TableRow>
    </>
  );
}

export default React.memo(TblSecondaryList);
