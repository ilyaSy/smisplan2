import React from 'react';
import { Drawer } from '@material-ui/core';

import CustomIcon from '../../SharedComponents/CustomIcon';
import storage from '../../storages/commonStorage';
import { metaData } from '../../config/data';
import DevelopersFilter from '../DevelopersFilter/DevelopersFilter';
import './MainLeftSide.css';

function MainLeftSide(props) {
  const [open, setOpen] = React.useState(true);
  const { developers, developer } = props;

  const handleOpen = (isOpened) => {
    const root = document.documentElement;

    const widthDefault = getComputedStyle(root).getPropertyValue('--width-left-side');
    root.style.setProperty('--width-left-side-bottom', !isOpened ? '0px' : widthDefault);

    setOpen(isOpened);
  };

  React.useEffect(() => {
    const unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;
      if (dataLoading && dataLoading === 'data') {
        if (['discussion', 'calendar'].includes(metaData.dataTableName)) {
          handleOpen(false);
        } else {
          handleOpen(true);
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleToggle = () => handleOpen(!open);

  const list = Object.values(developers).map((d) => ({ id: d.id, value: d.value }));

  return [
    <Drawer
      key="leftSideDrawer"
      variant="persistent"
      anchor="left"
      open={open}
      classes={{ paper: 'left-side-bar' }}
    >
      <DevelopersFilter developer={developer} list={list} />
    </Drawer>,
    <div key="showHideButton" className="divSpacingBottom">
      <CustomIcon
        class={`${open ? 'icn_arrow_left_fill' : 'icn_arrow_right_fill'}`}
        tip={`${open ? 'Свернуть' : 'Показать'}`}
        fontSize="large"
        action={handleToggle}
        style={{ borderRadius: '0px' }}
      />
    </div>,
  ];
}

export default React.memo(MainLeftSide);
