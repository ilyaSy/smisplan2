import React from 'react';
import { Menu, MenuItem } from '@material-ui/core';
import ArrowRight from '@material-ui/icons/ArrowRight';

import { metaData } from '../../config/data';
import storage from '../../storages/commonStorage';
import CustomIcon from '../../SharedComponents/CustomIcon';
import MenuItemsList from '../../SharedComponents/MenuItemsList';
import './MenuItemSettings.css';

function MenuItemSettings(props) {
  const [menuEl, setMenuEl] = React.useState(null);
  const [menuElColors, setMenuElColors] = React.useState(null);
  const [menuElColumns, setMenuElColumns] = React.useState(null);
  const [checkedElSubList, setCheckedElSubList] = React.useState([]);

  const unsubscribe = storage.state.subscribe(() => {
    const { dataLoading } = storage.state.getState().STATE;
    if (dataLoading && dataLoading === 'data') {
      setCheckedElSubList(
        Object.keys(metaData.dataTable).filter((k) => metaData.dataTable[k].showInTable)
      );
    }
  });

  React.useEffect(() => {
    unsubscribe();
    return unsubscribe;
  }, []);

  const handleChangeColor = (filter) => {
    const root = document.documentElement;

    const colorIcons = getComputedStyle(root).getPropertyValue(`--icons-filter-${filter}`);
    root.style.setProperty('--icons-filter', colorIcons);
    const colorHover = getComputedStyle(root).getPropertyValue(`--hover-filter-${filter}`);
    root.style.setProperty('--hover-filter', colorHover);

    setMenuElColors(null);
    setMenuEl(null);
  };

  // const handleChangeColumns = (id) => () => {
  const handleChangeColumns = (id) => {
    let checkedElSubListNew = [];
    if (checkedElSubList.includes(id)) {
      metaData.dataTable[id].showInTable = false;
      checkedElSubListNew = checkedElSubList.filter((a) => a !== id);
    } else {
      metaData.dataTable[id].showInTable = true;
      checkedElSubListNew = checkedElSubList.concat(id);
    }

    storage.state.dispatch({ type: 'SET_DATALOADING', stage: 'meta' });

    setCheckedElSubList(checkedElSubListNew);
    setMenuElColumns(null);
    setMenuEl(null);
  };

  const openMenuItem = (cb) => (e) => cb(e.currentTarget);
  const closeMenuItem = (cb, item) => () => cb(item);

  const colorsList = [
    { id: 'standart', value: 'Стандaртная схема' },
    { id: 'red', value: 'Красная схема' },
    { id: 'blue', value: 'Синяя схема' },
  ];
  const columnsList = Object.values(metaData.dataTable)
    .filter((a) => a.value && a.value !== '')
    .sort((a, b) => (a.value >= b.value ? 1 : -1));

  return (
    <div>
      <CustomIcon
        class="icn_settings"
        tip="Опции и настройки"
        fontSize="large"
        action={openMenuItem(setMenuEl)}
      />
      <Menu
        anchorEl={menuEl}
        keepMounted
        open={!!menuEl}
        onClose={closeMenuItem(setMenuEl, null)}
        className="menu-item-settings"
      >
        {/* Colors menu - START */}
        <MenuItem className="menu-item-settings__item" onClick={openMenuItem(setMenuElColors)}>
          <div>Цветовая схема</div>
          <ArrowRight fontSize="medium" />
        </MenuItem>
        <Menu
          anchorEl={menuElColors}
          keepMounted
          open={!!menuElColors}
          onClose={closeMenuItem(setMenuElColors, null)}
          className="menu-item-settings__item-menu"
        >
          <MenuItemsList itemsList={colorsList} name={props.name} onChange={handleChangeColor} />
        </Menu>

        {/* Columns menu - START */}
        <MenuItem className="menu-item-settings__item" onClick={openMenuItem(setMenuElColumns)}>
          <div>Колонки</div>
          <ArrowRight fontSize="medium" />
        </MenuItem>
        <Menu
          anchorEl={menuElColumns}
          keepMounted
          open={!!menuElColumns}
          onClose={closeMenuItem(setMenuElColumns, null)}
          className="menu-item-settings__item-menu"
        >
          <MenuItemsList
            itemsList={columnsList}
            name={props.name}
            onChange={handleChangeColumns}
            hasStartCheckbox
            checkFunction={(e) => checkedElSubList.includes(e)}
          />
        </Menu>

        <MenuItem key="manual" onClick={closeMenuItem(setMenuEl, null)}>
          <div className="menu-item-settings__item">Инструкция</div>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default MenuItemSettings;
