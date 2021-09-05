import { Suspense, lazy } from 'react';
import { TableCell } from '@material-ui/core';
import CustomSuspenseFallback from '../../SharedComponents/CustomSuspenseFallback';
import CustomIcon from '../../SharedComponents/CustomIcon';

const TblActionMenu = lazy(() => import('../TblActionMenu/TblActionMenu'));

export default function TblCellIcon({ showCell, showInner, type, action, ...args }) {
  return (
    <>
      {showCell && (
        <TableCell
          className={`data-table__cell ${type}}`}
          align="center"
          padding="none"
          style={args.style}
        >
          {showInner && type === 'data-table__cell_inline-edit' && (
            <div className={`data-table__hover-icon ${type}`}>
              <CustomIcon class="icn_tasks_edit" tip={args.tip} action={action} />
            </div>
          )}
          {showInner && type === 'data-table__hover-icon' && (
            <div className={type}>
              <Suspense fallback={<CustomSuspenseFallback type="textNode" />}>
                <TblActionMenu
                  id={args.row.id}
                  task={args.row}
                  list={args.actionMenuList}
                  onBeforeClick={action}
                />
              </Suspense>
            </div>
          )}
        </TableCell>
      )}
    </>
  );
}
