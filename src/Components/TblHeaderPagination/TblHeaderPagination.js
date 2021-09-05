import { TablePagination, Tooltip, IconButton } from '@material-ui/core';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

export default function TblHeaderPagination(props) {
  const { count: countPages, page, rowsPerPage, onChangePage, onChangeRowsPerPage } = props;

  const countTotal = Math.ceil(countPages / rowsPerPage);

  const goToFirstPage = (e) => onChangePage(e, 0);
  const goToPrevPage = (e) => onChangePage(e, page - 1);
  const goToNextPage = (e) => onChangePage(e, page + 1);
  const goToLastPage = (e) => onChangePage(e, countTotal - 1);

  const TablePaginationActions = () => (
    <div className="data-table__pagination-actions">
      <Tooltip title="Первая страница" placement="bottom" enterDelay={300}>
        <IconButton
          onClick={goToFirstPage}
          disabled={page === 0}
          aria-label="Первая"
          className="data-table__pagination-select"
        >
          <FirstPageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Предыдущая" placement="bottom" enterDelay={300}>
        <IconButton
          onClick={goToPrevPage}
          disabled={page === 0}
          aria-label="Предыдущая"
          className="data-table__pagination-select"
        >
          <KeyboardArrowLeftIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Следующая" placement="bottom" enterDelay={300}>
        <IconButton
          onClick={goToNextPage}
          disabled={page >= countTotal - 1}
          aria-label="Следующая"
          className="data-table__pagination-select"
        >
          <KeyboardArrowRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Последняя страница" placement="bottom" enterDelay={300}>
        <IconButton
          onClick={goToLastPage}
          disabled={page >= countTotal - 1}
          aria-label="Последняя"
          className="data-table__pagination-select"
        >
          <LastPageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );

  return (
    <TablePagination
      rowsPerPageOptions={[50, 100, 200]}
      component="div"
      count={countPages}
      rowsPerPage={rowsPerPage}
      page={page}
      // onChangePage={onChangePage}
      // onChangeRowsPerPage={onChangeRowsPerPage}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangeRowsPerPage}
      labelRowsPerPage="Выводить по"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
      backIconButtonProps={{ style: { paddingTop: '0px', paddingBottom: '0px' } }}
      nextIconButtonProps={{ style: { paddingTop: '0px', paddingBottom: '0px' } }}
      classes={{
        toolbar: 'data-table__pagination-toolbar',
        select: 'data-table__pagination-select',
      }}
      className="data-table__pagination"
      ActionsComponent={TablePaginationActions}
    />
  );
}
