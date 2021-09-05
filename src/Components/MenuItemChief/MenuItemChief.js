import React from 'react';
import { Menu, MenuItem, ListItemIcon, Typography } from '@material-ui/core';

import { filters } from '../../utils/filters';
import { doData } from '../../utils/apiFunctions';
import storage from '../../storages/commonStorage';
import CustomIcon from '../../SharedComponents/CustomIcon';
import DateW from '../../utils/date';
import './MenuItemChief.css';

function MenuItemChief(props) {
  const [menuEl, setMenuEl] = React.useState(null);

  const currentDate = new DateW();
  const currentWeek = currentDate.getWeek();

  const handleOpenMenuEl = (e) => setMenuEl(e.currentTarget);
  const handleCloseMenuEl = () => setMenuEl(null);

  const sendNotification = () => {
    storage.alert.dispatch({
      type: 'SHOW_ALERT',
      status: 'warn',
      message: 'Идёт отправка уведомлений...',
    });
    const data = {
      week: `${currentDate.getFullYear()}.${currentWeek + (currentDate.getDay() >= 5 ? 1 : 0)}`,
      mode: 'done',
      feature: 'discussion',
    };
    doData('notify', data, undefined, 'notification').then(([error]) => {
      if (error) {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'fail',
          message: 'Ошибка при отправке уведомления',
        });
      } else {
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'success',
          message: 'Уведомление послано успешно',
        });
      }
    });
  };

  const goToCurrentWeekDiscussion = () => {
    const loadTableName = 'discussion';

    props.reloadDataTable(loadTableName, () => {
      filters.data.week = `${currentDate.getFullYear()}.${
        currentWeek + (currentDate.getDay() >= 5 ? 1 : 0)
      }`;
    });
  };

  const handleClickItem = (menuItem) => () => {
    if (menuItem === 'notification') {
      sendNotification();
    } else if (menuItem === 'discussion') {
      goToCurrentWeekDiscussion();
    }
    setMenuEl(null);
  };

  return (
    <div>
      <CustomIcon
        class={props.class}
        tip="Для начальника"
        fontSize="large"
        action={handleOpenMenuEl}
      />

      <Menu
        id={`filter-menu-id-${props.name}`}
        anchorEl={menuEl}
        keepMounted
        open={Boolean(menuEl)}
        onClose={handleCloseMenuEl}
        className="menu-item-chief"
      >
        <MenuItem key={`menu-${props.name}-discussion`} onClick={handleClickItem('discussion')}>
          <ListItemIcon>
            <CustomIcon class="icn_discussionList" tip="Перейти к списку расписаний на неделю" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Расписание обсуждений
          </Typography>
        </MenuItem>

        <MenuItem key={`menu-${props.name}-notification`} onClick={handleClickItem('notification')}>
          <ListItemIcon>
            <CustomIcon
              class="icn_notification"
              tip="Отправить оповещения об обсуждениях на текущей неделе"
            />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Уведомление об обсуждениях
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default React.memo(MenuItemChief);
