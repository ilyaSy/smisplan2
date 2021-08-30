import React from 'react';
import { Menu, MenuItem, Checkbox } from '@material-ui/core';
import ArrowRight from '@material-ui/icons/ArrowRight';

import { metaData } from '../../config/data';
import storage from '../../storages/commonStorage';
import CustomIcon from '../../SharedComponents/CustomIcon';
import './MenuItemSettings.css';

export default class MenuItemSettings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      opened: props.isOpened || false,
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

  handleClickItem = (filter) => (event) => {
    let root = document.documentElement;

    let colorIcons = getComputedStyle(root).getPropertyValue(`--icons-filter-${filter}`);
    root.style.setProperty('--icons-filter', colorIcons);
    let colorHover = getComputedStyle(root).getPropertyValue(`--hover-filter-${filter}`);
    root.style.setProperty('--hover-filter', colorHover);

    this.setState({ menuElSub_c: null });
    this.setState({ menuEl: null });
  };

  handleClickItemSub = (id) => (event) => {
    let checkedElSubList = this.state.checkedElSubList;
    if (checkedElSubList.indexOf(id) !== -1) {
      metaData.dataTable[id].showInTable = false;
      checkedElSubList = checkedElSubList.filter((a) => {
        return a !== id;
      });
    } else {
      metaData.dataTable[id].showInTable = true;
      checkedElSubList.push(id);
    }

    storage.state.dispatch({ type: 'SET_DATALOADING', stage: 'meta' });

    this.setState({ checkedElSubList: checkedElSubList });
    this.setState({ menuElSub: null });
    this.setState({ menuEl: null });
  };

  openUrl = (url) => {
    window.open(url, '_blank', '');
  };

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      let dataLoading = storage.state.getState().STATE.dataLoading;
      if (dataLoading && dataLoading === 'data') {
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
          class="icn_settings"
          tip="Опции и настройки"
          fontSize="large"
          action={(e) => this.setState({ menuEl: e.currentTarget })}
        />
          <Menu
            id={`filter-menu-id-${this.props.name}`}
            anchorEl={this.state.menuEl}
            keepMounted
            open={Boolean(this.state.menuEl)}
            onClose={() => this.setState({ menuEl: null })}
            className="menu-item-settings"
          >
            <MenuItem
              key={`menu-colors`}
              className="menu-item-settings__item"
              onClick={(e) => this.setState({ menuElSub_c: e.currentTarget })}
            >
              <div>Цветовая схема</div>
              <ArrowRight fontSize="default" />
            </MenuItem>
            <Menu
              anchorEl={this.state.menuElSub_c}
              keepMounted
              open={Boolean(this.state.menuElSub_c)}
              onClose={() => this.setState({ menuElSub_c: null })}
              className="menu-item-settings__item-menu"
            >
              <MenuItem
                key={`menu-${this.props.name}-standart`}
                onClick={this.handleClickItem('standart')}
              >
                Стандартная схема
              </MenuItem>
              <MenuItem key={`menu-${this.props.name}-red`} onClick={this.handleClickItem('red')}>
                Красная схема
              </MenuItem>
              <MenuItem key={`menu-${this.props.name}-blue`} onClick={this.handleClickItem('blue')}>
                Синяя схема
              </MenuItem>
            </Menu>

            {/* Columns menu - START */}
            <MenuItem
              key={`menu-columns`}
              className="menu-item-settings__item"
              onClick={(e) => this.setState({ menuElSub: e.currentTarget })}
            >
              <div>Колонки</div>
              <ArrowRight fontSize="default" />
            </MenuItem>
            <Menu
              id={`columns-menu-id`}
              anchorEl={this.state.menuElSub}
              keepMounted
              open={Boolean(this.state.menuElSub)}
              onClose={() => this.setState({ menuElSub: null })}
              className="menu-item-settings__item-menu"
            >
              {Object.values(metaData.dataTable)
                .filter((a) => {
                  return a.value && a.value !== '';
                })
                .sort((a, b) => {
                  return a.value >= b.value ? 1 : -1;
                })
                .map((headCell) => {
                  return (
                    <MenuItem
                      key={`menu-columns-${headCell.id}`}
                      onClick={this.handleClickItemSub(headCell.id)}
                    >
                      <Checkbox
                        className="menu-item-settings__menu-checkbox"
                        edge="start"
                        ref={`checkbox-${headCell.id}`}
                        checked={this.state.checkedElSubList.indexOf(headCell.id) !== -1}
                        tabIndex={-1}
                        disableRipple
                      />
                      {headCell.value}
                    </MenuItem>
                  );
                })}
            </Menu>
            {/* Columns menu - END*/}

            <MenuItem
              key="manual"
              onClick={() => {
                this.openUrl('http://d902.iki.rssi.ru/smisplan-docs/SMISplan.pdf');
                this.setState({ menuEl: null });
              }}
            >
              <div className="menu-item-settings__item">Инструкция</div>
            </MenuItem>
          </Menu>
      </div>
    );
  }
}
