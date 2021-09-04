import React, { Fragment } from 'react';
import { TableRow, TableCell, TableSortLabel } from '@material-ui/core';

import TblHeaderBtnMenu from '../TblHeaderBtnMenu/TblHeaderBtnMenu';
import { metaData } from '../../config/data';
import { filters, filterTasks } from '../../utils/filters';

const getAdditionalCellProps = (props) => {
  let hasAdditionalCell = false;
  if (
    props &&
    (props.hasSpecAction ||
      props.hasSpecNotes ||
      props.hasEditMenu ||
      props.hasDeleteButton ||
      props.hasDoneButton)
  ) {
    hasAdditionalCell = true;
  }

  return hasAdditionalCell;
};

export default class TblHeadEnhanced extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { isHovered: '' };
  }

  setCoumnWidth = (headCells) => {
    this.widths = {};
    Object.keys(headCells).forEach((property) => {
      if (headCells[property].showInTable) {
        this.widths[property] = this.getColumnWidth(headCells[property]);
      }
    });

    this.hasAdditionalCell = getAdditionalCellProps(metaData.specificParameters);
  };

  createSortHandler = (property) => (event) => {
    const { onRequestSort } = this.props;
    onRequestSort(event, property);
  };

  createGroupHandler = (property) => {
    const { onRequestGroup, groupBy } = this.props;
    onRequestGroup(undefined, groupBy === property ? '' : property);
  };

  handleDateFilter = (property, value) => {
    const { onFilter } = this.props;
    const state = {};
    state[property] = value;
    this.setState(state);

    filters.setValue('data', property, value);
    onFilter(filterTasks());
  };

  getColumnWidth = (headCell) => {
    let width = '';
    let headCellWidth = headCell.value.length * (window.innerWidth <= 1400 ? 8 : 10) + 24;
    if (headCell.isFilter && !metaData.mobile) headCellWidth += 30;
    if (headCell.isGroup && !metaData.mobile) headCellWidth += 30;
    switch (headCell.type) {
      case 'int':
        width = headCellWidth > 45 ? `${headCellWidth}px` : '45px';
        break;

      case 'string':
        if (!headCell.isInlineEditable && headCell.id !== 'theme') {
          if (window.innerWidth <= 1400) {
            width = headCellWidth > 90 ? `${headCellWidth}px` : '90px';
          } else {
            width = headCellWidth > 110 ? `${headCellWidth}px` : '110px';
          }
        }
        break;

      case 'select':
        if (!headCell.isInlineEditable) {
          if (window.innerWidth <= 1400) {
            width = headCellWidth > 105 ? `${headCellWidth}px` : '105px';
          } else {
            width = headCellWidth > 120 ? `${headCellWidth}px` : '120px';
          }
        }
        break;

      case 'multi-select':
        if (!headCell.isInlineEditable) {
          if (window.innerWidth <= 1400) {
            width = headCellWidth > 155 ? `${headCellWidth}px` : '155px';
          } else {
            width = headCellWidth > 170 ? `${headCellWidth}px` : '170px';
          }
        }
        break;

      case 'datetime':
      case 'date':
      case 'time':
        if (!headCell.isInlineEditable) {
          if (window.innerWidth <= 1400) {
            width = headCellWidth > 80 ? `${headCellWidth}px` : '80px';
          } else {
            width = headCellWidth > 100 ? `${headCellWidth}px` : '100px';
          }
        }
        break;
      default:
        width = '';
    }
    return width;
  };

  render() {
    this.setCoumnWidth(metaData.dataTable);

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
          .sort((a, b) => (a.tableIndex >= b.tableIndex ? 1 : -1))
          .map((headCell, index) => {
            const filterVisibility =
              isHovered === headCell.id ||
              (filters.checkFilter(headCell.id) && filters.data[headCell.id] !== '')
                ? 'visible'
                : 'hidden';
            const groupVisibility =
              isHovered === headCell.id || (groupBy && groupBy === headCell.id)
                ? 'visible'
                : 'hidden';
            const paddingLeft = index === 0 ? '10px' : '0px';
            const minWidth = headCell.id === 'theme' ? '220px' : '';
            const maxWidth = '';
            const width = this.widths[headCell.id];
            const filterList =
              ['datetime', 'date'].indexOf(headCell.type) !== -1
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
                  style={{ minWidth, width, maxWidth, paddingLeft }}
                  onMouseEnter={() => this.setState({ isHovered: headCell.id })}
                  onMouseLeave={() => this.setState({ isHovered: undefined })}
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

                  {headCell.isGroup && !metaData.mobile && (
                    <div
                      className={`data-table__pagination-button ${
                        groupVisibility === 'visible' ? 'visible' : 'invisible'
                      }`}
                    >
                      <TblHeaderBtnMenu
                        class="icn_filter"
                        name={headCell.id}
                        action={this.createGroupHandler}
                        type="group"
                        itemList={groupList}
                      />
                    </div>
                  )}

                  {headCell.isFilter && !metaData.mobile && (
                    <div
                      className={`data-table__pagination-button ${
                        filterVisibility === 'visible' ? 'visible' : 'invisible'
                      }`}
                    >
                      <TblHeaderBtnMenu
                        class="icn_filter"
                        name={headCell.id}
                        action={this.props.onFilter}
                        all
                        noClose
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
        {this.hasAdditionalCell && <TableCell style={{ width: metaData.table ? '53px' : '1px' }} />}
      </TableRow>
    );
  }
}
