import React from 'react';
import { MenuItem, ListItemIcon, Typography, TableRow, TableCell } from '@material-ui/core';
import moment from 'moment';
import PopupConfirmChoice from '../PopupConfirmChoice/PopupConfirmChoice';
import DateW from '../../utils/date';
import CustomIcon from '../../SharedComponents/CustomIcon';

let currentWeek = new DateW().getYearWeekStr();

export default function TblGroupRow(props) {
  const weekOptionsChoice = () => {
    const weekOptions = [];
    for (let i = 0; i < 2; i++) {
      const weekObj = { value: i };

      let weekDate = new Date();
      weekDate.setDate(weekDate.getDate() + 7 * i);
      const weekStr = `${moment(weekDate, 'YYYY-MM-DD').startOf('week').format('DD MMMM')} - ${moment(
        weekDate,
        'YYYY-MM-DD'
      )
        .endOf('week')
        .format('DD MMMM YYYY')} г`;

      if (i === 0) {
        weekObj.name = `Текущая неделя: ${weekStr}`;
      } else if (i === 1) {
        weekObj.name = `Следующая неделя: ${weekStr}`;
      } else {
        weekObj.name = `${i}-я неделя: ${weekStr}`;
      }

      weekOptions.push(weekObj);
    }

    return weekOptions;
  }

  const dayOptionsChoice = () => {
    const dayOptions = [{value: 0, name: 'Вся неделя'}];
    for (let data of props.weekData.sort((a, b) => a.date < b.date ? -1 : 1)) {
      if (!dayOptions.map(e => e.value).includes(data.date)) {
        const date = moment(data.date, 'YYYY-MM-DD');
        dayOptions.push({value: data.date, name: date.format('dddd, DD MMMM YYYY')});
      }
    }
    return dayOptions;
  }

  const { fullColsNum, getDateGroup, row, groupBy, groupValue } = props;
  let { groupHide } = props;

  return (
    <TableRow>
      <TableCell
        colSpan={props.tableName === 'discussion' ? fullColsNum - 4 : fullColsNum}
        className="data-table__row-title"
      >
        <MenuItem
          colSpan={fullColsNum}
          style={{ paddingTop: '0px', paddingBottom: '0px' }}
          onClick={() => {
            groupHide[getDateGroup(row[groupBy])] = !groupHide[getDateGroup(row[groupBy])];
            return props.setGroup(groupHide);
          }}
        >
          <ListItemIcon>
            {groupHide[getDateGroup(row[groupBy])] ? (
              <CustomIcon
                class="icn_arrow_right"
                tip="Показать"
                action={() => {
                  groupHide[getDateGroup(row[groupBy])] = true;
                  return props.setGroup(groupHide);
                }}
              />
            ) : (
              <CustomIcon
                class="icn_arrow_down"
                tip="Свернуть"
                action={() => {
                  groupHide[getDateGroup(row[groupBy])] = false;
                  return props.setGroup(groupHide);
                }}
              />
            )}
          </ListItemIcon>

          <Typography variant="inherit" noWrap style={{ fontSize: 'var(--font-size-table)' }}>
            {props.headCells[groupBy].value}: {groupValue}
          </Typography>
        </MenuItem>
      </TableCell>
      {props.tableName === 'discussion' && (
        <>
          <TableCell colSpan={3} className="data-table__row-title_right">
            {
              currentWeek === row.week ?
              <>
                <PopupConfirmChoice
                  class="icn_notification"
                  id={row.week}
                  options={dayOptionsChoice}
                  action={props.sendNotification}
                  actionName="отправка уведомлений об обсуждениях"
                />

                &emsp;&emsp;
              </> :
              <span style={{width:'50px', display: 'inline-block'}}>&nbsp;</span>
            }


            <CustomIcon
              class="icn_description"
              tip="Показать все обсуждения недели"
              action={props.toggleDescription}
            />

            &emsp;&emsp;

            <PopupConfirmChoice
              class="icn_discussionCopy"
              id={row[groupBy]}
              options={weekOptionsChoice}
              action={props.copyPreviousWeekDiscussions}
              actionName="копирование обсуждений недели"
            />
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
