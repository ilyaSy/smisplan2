import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Checkbox } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

import { filters } from '../../utils/filters';
import storage from '../../storages/commonStorage';
import './CheckboxListFilter.css';

function CheckboxListFilter(props) {
  const [checked, setChecked] = React.useState([]);

  const handleToggle = (value) => () => {
    if (value !== '') {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      filters.setValue('data', props.filterType, [...newChecked]);

      storage.data.dispatch({ type: 'REDRAW', redraw: true });
      setChecked(newChecked);
    } else {
      storage.data.dispatch({ type: 'REDRAW', redraw: true });
      props.updateData();
    }
  };

  return (
    <List dense className="checkbox-list-filter">
      {props.options.map((key) => {
        const option = key !== 'divider' ? props.optionsMap[key] : null;
        const labelId = key !== 'divider' ? `checkbox-list-label-${option.id}` : null;

        return key !== 'divider' ? (
          <ListItem
            key={option.id}
            role={undefined}
            size="small"
            className="checkbox-list-filter__list-item"
            button
            onClick={handleToggle(option.id)}
          >
            <ListItemIcon>
              <Checkbox
                className="checkbox-list-filter__checkbox"
                edge="start"
                checked={checked.includes(option.id)}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': labelId }}
              />
            </ListItemIcon>
            <ListItemText
              id={labelId}
              primary={`${option.value}`}
              className="checkbox-list-filter__text"
            />
          </ListItem>
        ) : (
          <Divider key="divider" />
        );
      })}
    </List>
  );
}

export default React.memo(CheckboxListFilter);
