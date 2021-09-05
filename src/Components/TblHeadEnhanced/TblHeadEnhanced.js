import React, { Fragment } from 'react';
import { TableRow, TableCell, TableSortLabel } from '@material-ui/core';

import TblHeaderBtnMenu from '../TblHeaderBtnMenu/TblHeaderBtnMenu';
import { metaData } from '../../config/data';
import {
  getColumnWidths,
  getFilterVisibility,
  getGroupVisibility,
} from '../../utils/tblHeaderHelpers';

export default class TblHeadEnhanced extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { isHovered: '' };
  }

  setIsHovered = (isHovered) => () => this.setState({ isHovered });

  createSortHandler = (property) => (event) => this.props.onRequestSort(event, property);

  createGroupHandler = (property) => {
    const { onRequestGroup, groupBy } = this.props;
    onRequestGroup(undefined, groupBy === property ? '' : property);
  };

  render() {
    const { widths, hasAdditionalCell } = getColumnWidths(metaData);

    const { order, orderBy, groupBy, headCells } = this.props;
    const { isHovered } = this.state;
    const sort = {};
    this.props.sort.forEach((f) => {
      sort[f.field] = f;
    });

    return (
      <TableRow className="data-table__header-row">
        {Object.values(headCells)
          .filter((a) => a.showInTable)
          .sort((a, b) => (a.tableIndex <= b.tableIndex ? -1 : 1))
          .map((headCell) => {
            const filterVisibility = getFilterVisibility(isHovered, headCell.id);
            const groupVisibility = getGroupVisibility(isHovered, groupBy, headCell.id);
            const minWidth = headCell.id === 'theme' ? '220px' : '';
            const width = widths[headCell.id];
            const filterList = ['datetime', 'date'].includes(headCell.type)
              ? 'datetime'
              : metaData[`${headCell.id}List`];
            const groupList = {};
            if (headCell.isGroup) {
              groupList[headCell.id] = { id: headCell.id, value: headCell.value };
              if (headCell.type === 'date') {
                groupList.week = { id: 'week', value: 'Неделя' };
              }
            }

            return (
              <Fragment key={headCell.id}>
                <TableCell
                  align="left"
                  padding="none"
                  className="data-table__header-cell"
                  style={{ minWidth, width }}
                  onMouseEnter={this.setIsHovered(headCell.id)}
                  onMouseLeave={this.setIsHovered(undefined)}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={!!sort[headCell.id]}
                    direction={sort[headCell.id] ? sort[headCell.id].order : 'asc'}
                    onClick={this.createSortHandler(headCell.id)}
                  >
                    {headCell.value}
                    {sort[headCell.id] ? <span /> : null}
                  </TableSortLabel>

                  {!metaData.mobile && headCell.isGroup && (
                    <div className={`data-table__pagination-button ${groupVisibility}`}>
                      <TblHeaderBtnMenu
                        class="icn_filter"
                        name={headCell.id}
                        action={this.createGroupHandler}
                        type="group"
                        itemList={groupList}
                      />
                    </div>
                  )}

                  {!metaData.mobile && headCell.isFilter && (
                    <div className={`data-table__pagination-button ${filterVisibility}`}>
                      <TblHeaderBtnMenu
                        class="icn_filter"
                        name={headCell.id}
                        action={this.props.onFilter}
                        all
                        noClosed
                        type="filter"
                        itemList={filterList}
                      />
                    </div>
                  )}
                </TableCell>
                {headCell.isInlineEditable && headCell.type === 'string' && (
                  <TableCell style={{ width: '10px' }} />
                )}
              </Fragment>
            );
          })}
        {hasAdditionalCell && <TableCell style={{ width: metaData.table ? '53px' : '1px' }} />}
      </TableRow>
    );
  }
}
