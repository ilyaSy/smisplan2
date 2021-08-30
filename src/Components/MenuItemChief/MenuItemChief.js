import React from 'react';
import { Menu, MenuItem, ListItemIcon, Typography } from '@material-ui/core';

import { metaData, filters } from '../../config/data';
import { doData } from '../../utils/api';
import storage from '../../storages/commonStorage';
import CustomIcon from '../../SharedComponents/CustomIcon';
import DateW from '../../utils/date';
import './MenuItemChief.css';

export default class MenuItemChief extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      menuEl: null,
      menuElSub_c: null,
      menuElSub: null,
      checkedElSubList: [],
    };
    this.setCheckedElSubList = this.setCheckedElSubList.bind(this);
  }

  setCheckedElSubList = (checkedElSubList) => {
    this.setState({ checkedElSubList });
  };

  handleClickItem = (menuItem) => (event) => {
    const currentDate = new DateW();
    const currentWeek = currentDate.getWeek();

    switch (menuItem) {
      case 'discussionNotification':
        let notifyWeek = `${currentDate.getFullYear()}.${
          currentWeek + (currentDate.getDay() >= 5 ? 1 : 0)
        }`;
        storage.alert.dispatch({
          type: 'SHOW_ALERT',
          status: 'warn',
          message: 'Идёт отправка уведомлений...',
        });
        const data = {
          week: notifyWeek,
          mode: 'done',
          feature: 'discussion',
        };
        doData('notify', data, undefined, 'notification').then(([error]) => {
          error
            ? storage.alert.dispatch({
                type: 'SHOW_ALERT',
                status: 'fail',
                message: 'Ошибка при отправке уведомления',
              })
            : storage.alert.dispatch({
                type: 'SHOW_ALERT',
                status: 'success',
                message: 'Уведомление послано успешно',
              });
        });
        break;
      default:
        //discussion
        const loadTableName = 'discussion';
        this.props.reloadDataTable(loadTableName, () => {
          filters.data.week = `${currentDate.getFullYear()}.${
            currentWeek + (currentDate.getDay() >= 5 ? 1 : 0)
          }`;
        });
        break;
    }
    this.setState({ menuEl: null });
  };

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      let dataLoading = storage.state.getState().STATE.dataLoading;
      if (dataLoading && dataLoading === 'meta') {
        this.setCheckedElSubList(
          Object.keys(metaData.dataTable).filter((a) => {
            return metaData.dataTable[a].showInTable;
          })
        );
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div>
        <CustomIcon
          class={this.props.class}
          tip="Для начальника"
          fontSize="large"
          action={(e) => this.setState({ menuEl: e.currentTarget })}
        />

        <Menu
          id={`filter-menu-id-${this.props.name}`}
          anchorEl={this.state.menuEl}
          keepMounted
          open={Boolean(this.state.menuEl)}
          onClose={() => this.setState({ menuEl: null })}
          className="menu-item-chief"
        >
          <MenuItem
            key={`menu-${this.props.name}-discussion`}
            onClick={this.handleClickItem('discussion')}
          >
            <ListItemIcon>
              <CustomIcon class="icn_discussionList" tip="Перейти к списку расписаний на неделю" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              Расписание обсуждений
            </Typography>
          </MenuItem>

          {/* <MenuItem key={`menu-${this.props.name}-discussionPrint`} onClick={this.handleClickItem('discussionPrint')}>
                        <ListItemIcon>
                        <CustomIcon
                                class="icn_print"
                                tip="Распечатать оповещения об обсуждениях на текущей неделе" />
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Распечатать обсуждения
                        </Typography>
                    </MenuItem> */}

          <MenuItem
            key={`menu-${this.props.name}-discussionNotification`}
            onClick={this.handleClickItem('discussionNotification')}
          >
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
}
