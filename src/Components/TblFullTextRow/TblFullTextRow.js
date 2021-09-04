import { TableRow, TableCell } from '@material-ui/core';

export default function TblFullTextRow(props) {
  const dummyCells = 3;
  const activeCells =
    Object.values(props.headCells).filter((a) => a.showInTable).length - dummyCells;

  return (
    props.data.display && (
      <TableRow key={`row-${props.data.value}-${props.id}`}>
        <TableCell colSpan={dummyCells - 1} />
        <TableCell colSpan={activeCells}>
          <div className="data-table__row-fulltext">{props.data.value}</div>
        </TableCell>
        <TableCell />
        {props.hasAdditionalCell && <TableCell />}
      </TableRow>
    )
  );
}
