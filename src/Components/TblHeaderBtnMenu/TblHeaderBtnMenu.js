import React from 'react';
import { Menu, MenuItem } from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { filters, filterTasks } from '../../config/filters';
import CustomIcon from '../../SharedComponents/CustomIcon';

export default class TblHeaderBtnMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { anchorEl: null };
    this.state[this.props.name] = filters.data[this.props.name]
      ? filters.data[this.props.name]
      : undefined;

    this.setAnchorEl = this.setAnchorEl.bind(this);
  }

  setAnchorEl = (anchorEl) => {
    this.setState({ anchorEl });
  };

  handleClick = (event) => {
    this.setAnchorEl(event.currentTarget);
  };

  handleClose = () => {
    this.setAnchorEl(null);
  };

  handleClickItem = (field, value) => {
    if (this.props.type === 'filter') {
      if (
        typeof this.props.itemList !== 'object' &&
        (this.props.itemList === 'datetime' || this.props.itemList === 'date')
      ) {
        const state = {};
        state[field] = value;
        this.setState(state);
      }

      if (value === 'all') {
        filters.data = {};
      } else if (value === 'noClose') {
        if (typeof this.props.itemList === 'object') {
          filters.data[field] = [];
          Object.values(this.props.itemList)
            .filter((item) => item.id !== 'done')
            .forEach((item) => filters.data[field].push(item.id));
        }
      } else {
        filters.data[field] = value;
      }
      this.props.action(filterTasks());
    } else if (this.props.type === 'group') {
      this.props.action(value);
    }

    this.setAnchorEl(null);
  };

  render() {
    const { itemList } = this.props;

    return (
      <div>
        {this.props.type === 'filter' && (
          <CustomIcon class="icn_filter" tip="фильтр" action={this.handleClick} />
        )}
        {this.props.type === 'group' && (
          <CustomIcon class="icn_group" tip="группировать" action={this.handleClick} />
        )}

        <Menu
          id={`filter-menu-id-${this.props.name}`}
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
          className="tbl-header-btn-menu"
        >
          {this.props.all && (
            <MenuItem onClick={() => this.handleClickItem(this.props.name, 'all')}>Все</MenuItem>
          )}

          {this.props.noClose && this.props.name === 'status' && (
            <MenuItem onClick={() => this.handleClickItem(this.props.name, 'noClose')}>
              Все открытые
            </MenuItem>
          )}

          {typeof itemList === 'object' &&
            Object.keys(itemList).map((item) => (
              <MenuItem
                key={`menu-${this.props.name}-${itemList[item].id}`}
                style={{
                  backgroundColor:
                    filters.data[this.props.name] === item ? 'var(--color-tasks-gray)' : '',
                }}
                onClick={() => this.handleClickItem(this.props.name, itemList[item].id)}
              >
                {itemList[item].value}
              </MenuItem>
            ))}

          {typeof itemList !== 'object' && itemList === 'datetime' && (
            <MenuItem>
              <MuiPickersUtilsProvider
                utils={MomentUtils}
                style={{ width: '0px', margin: '0px', marginLeft: '-18px' }}
                className="tbl-header-btn-menu__datepicker"
              >
                <KeyboardDatePicker
                  format="YYYY-MM-DD"
                  margin="normal"
                  onChange={(property, value) => {
                    this.handleClickItem(this.props.name, value);
                  }}
                  value={this.state[this.props.name]}
                  style={{ width: '0px', margin: '0px', marginLeft: '-18px' }}
                  className="tbl-header-btn-menu__datepicker"
                  inputRef={(el) => {
                    this[this.props.name] = el;
                  }}
                />
              </MuiPickersUtilsProvider>
            </MenuItem>
          )}
        </Menu>
      </div>
    );
  }
}
