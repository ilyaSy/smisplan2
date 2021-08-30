import React from 'react';
import { MenuItem, ListItemIcon, Typography, TableRow, TableCell } from '@material-ui/core';
import CustomIcon from '../../SharedComponents/CustomIcon';

export default function TblSecondaryList(props) {
  return (
    <>
      {
        props.secDataList.length > 0 ? (
          props.secDataList.map((row, index) => {
            return (
              <TableRow key={`secDataListRow-${index}`}>
                <TableCell
                  colSpan={props.fullColsNum}
                  className="data-table__row-secondarylist"
                >
                  {row.string}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
            <TableRow>
              <TableCell
                colSpan={props.fullColsNum}
                className="data-table__row-secondarylist"
              >
                Данных нет
        </TableCell>
            </TableRow>
          )
      }
      {/* collapse drop down secondary list */}
      <TableRow>
        <TableCell
          colSpan={props.fullColsNum}
          className="data-table__row-secondarylist-hide"
        >
          <MenuItem
            style={{ paddingTop: '2px', paddingBottom: '2px' }}
            onClick={props.loadSecondaryList}
          >
            <ListItemIcon>
              <CustomIcon
                class={`icn_secDataListCollapse`}
                action={props.loadSecondaryList}
              />
            </ListItemIcon>

            <Typography
              variant="inherit"
              noWrap
              style={{ fontSize: 'var(--font-size-table)' }}
            >
              Свернуть
          </Typography>
          </MenuItem>
        </TableCell>
      </TableRow>
    </>
  );
}
