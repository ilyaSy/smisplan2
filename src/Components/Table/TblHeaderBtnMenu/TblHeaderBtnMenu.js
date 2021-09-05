import React from 'react';
import { Menu, MenuItem } from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { filters, filterTasks } from '../../../utils/filters';
import MenuItemsList from '../../../SharedComponents/MenuItemsList';
import CustomIcon from '../../../SharedComponents/CustomIcon';

function TblHeaderBtnMenu({ type, name, itemList, action, all, noClosed }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [filterField, setFilterField] = React.useState(filters.data[name]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleClickItem = (field, value) => {
    if (type === 'filter') {
      if (typeof itemList !== 'object' && ['datetime', 'date'].includes(itemList)) {
        setFilterField(value);
      }

      if (value === 'all') {
        filters.data = {};
      } else if (value === 'noClosed' && typeof itemList === 'object') {
        filters.data[field] = [];
        Object.values(itemList)
          .filter((item) => item.id !== 'done')
          .forEach((item) => filters.data[field].push(item.id));
      } else {
        filters.data[field] = value;
      }
      action(filterTasks());
    } else if (type === 'group') {
      action(value);
    }

    setAnchorEl(null);
  };

  return (
    <div>
      {type === 'filter' && <CustomIcon class="icn_filter" tip="фильтр" action={handleClick} />}
      {type === 'group' && <CustomIcon class="icn_group" tip="группировать" action={handleClick} />}

      <Menu
        id={`filter-menu-id-${name}`}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className="tbl-header-btn-menu"
      >
        {all && <MenuItem onClick={() => handleClickItem(name, 'all')}>Все</MenuItem>}

        {noClosed && name === 'status' && (
          <MenuItem onClick={() => handleClickItem(name, 'noClosed')}>Все открытые</MenuItem>
        )}

        {typeof itemList === 'object' && (
          <MenuItemsList
            // itemsList={itemList}
            itemsList={Object.values(itemList)}
            name={name}
            onChange={(item) => handleClickItem(name, itemList[item].id)}
          />
        )}

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
                  handleClickItem(name, value);
                }}
                value={filterField}
                style={{ width: '0px', margin: '0px', marginLeft: '-18px' }}
                className="tbl-header-btn-menu__datepicker"
              />
            </MuiPickersUtilsProvider>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

export default React.memo(TblHeaderBtnMenu);
