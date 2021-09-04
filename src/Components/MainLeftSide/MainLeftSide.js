import React from 'react';
import { Drawer } from '@material-ui/core';

import CustomIcon from '../../SharedComponents/CustomIcon';
import storage from '../../storages/commonStorage';
import { metaData } from '../../config/data';
import CheckboxListFilter from '../CheckboxListFilter/CheckboxListFilter';
import './MainLeftSide.css';

/* *************************  Developers list  ******************************* */
export default class MainLeftSide extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { open: true };
  }

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;
      if (dataLoading && dataLoading === 'data') {
        if (['discussion', 'calendar'].includes(metaData.dataTableName)) {
          this.handleOpen(false);
        } else {
          this.handleOpen(true);
        }
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  setOpen = (open) => this.setState({ open });

  handleOpen = (open) => {
    const root = document.documentElement;

    const widthDefault = getComputedStyle(root).getPropertyValue('--width-left-side');
    root.style.setProperty('--width-left-side-bottom', !open ? '0px' : widthDefault);

    this.setOpen({ open });
  };

  handleShow = () => this.handleOpen(true);

  handleHide = () => this.handleOpen(false);

  render() {
    const { developers, developer } = this.props;
    const { open: isOpened } = this.state;
    const list = Object.values(developers).map((d) => ({ id: d.id, value: d.value }));

    return [
      <Drawer
        key="leftSideDrawer"
        variant="persistent"
        anchor="left"
        open={!!isOpened}
        classes={{ paper: 'left-side-bar' }}
      >
        <CheckboxListFilter developer={developer} list={list} />
      </Drawer>,
      <div key="showHideButton" className="divSpacingBottom">
        {isOpened ? (
          <CustomIcon
            class="icn_arrow_left_fill"
            tip="Свернуть"
            fontSize="large"
            action={this.handleHide}
            style={{ borderRadius: '0px' }}
          />
        ) : (
          <CustomIcon
            class="icn_arrow_right_fill"
            tip="Показать"
            fontSize="large"
            action={this.handleShow}
            style={{ borderRadius: '0px' }}
          />
        )}
      </div>,
    ];
  }
}
