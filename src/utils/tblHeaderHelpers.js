import { filters } from './filters';

const getColumnWidth = (metaData, property) => {
  const headCell = metaData.dataTable[property];
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

export const getColumnWidths = (metaData) => {
  const widths = {};
  Object.keys(metaData.dataTable).forEach((property) => {
    if (metaData.dataTable[property].showInTable) {
      widths[property] = getColumnWidth(metaData, property);
    }
  });

  const hasAdditionalCell = getAdditionalCellProps(metaData.specificParameters);
  return { widths, hasAdditionalCell };
};

export const getFilterVisibility = (isHovered, headCellId) => {
  const filterVifibility =
    isHovered === headCellId || (filters.checkFilter(headCellId) && filters.data[headCellId] !== '')
      ? 'visible'
      : 'invisible';
  return filterVifibility;
};

export const getGroupVisibility = (isHovered, groupBy, headCellId) => {
  const groupVifibility =
    isHovered === headCellId || (groupBy && groupBy === headCellId) ? 'visible' : 'invisible';
  return groupVifibility;
};
