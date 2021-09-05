import React from 'react';
import { MenuItem, Checkbox } from '@material-ui/core';
import { filters } from '../utils/filters';

function MenuItemsList({ itemsList, name, onChange, hasStartCheckbox, checkFunction }) {
  return itemsList.map((item) => {
    const handleItemClick = onChange.bind(null, item.id);
    return (
      <MenuItem
        key={`menu-${name}-${item.id}`}
        style={{ backgroundColor: filters.data[name] === item.id ? 'var(--color-active)' : '' }}
        onClick={handleItemClick}
      >
        {hasStartCheckbox && (
          <Checkbox
            className="menu-item-settings__menu-checkbox"
            edge="start"
            checked={checkFunction(item.id)}
            tabIndex={-1}
            disableRipple
          />
        )}
        {item.value}
      </MenuItem>
    );
  });
}

export default React.memo(MenuItemsList);
