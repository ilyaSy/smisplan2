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
    this.state = { open: true }
    this.setOpen = this.setOpen.bind(this)
  }

  setOpen = (open) => {
    let root = document.documentElement;

    let widthDefault = getComputedStyle(root).getPropertyValue('--width-left-side');
    root.style.setProperty('--width-left-side-bottom', this.state.open ? "0px" : widthDefault);

    this.setState({ open })
  }

  handleShow = () => { this.setOpen(true) }
  handleHide = () => { this.setOpen(false) }

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      const dataLoading = storage.state.getState().STATE.dataLoading;
      if (dataLoading && dataLoading === 'data') {
        if (['discussion', 'calendar'].includes(metaData.dataTableName)) {
          if (this.state.open) this.setOpen(false);
        } else {
          if (!this.state.open) this.setOpen(true);
        }
      }
    });
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  render() {
    const list = Object.values(this.props.developers).map((d) => {
      return { id: d.id, value: d.value }
    });

    return [
      <Drawer
        key="leftSideDrawer"
        variant="persistent"
        anchor="left"
        open={this.state.open}
        classes={{ paper: "left-side-bar" }}>

        <CheckboxListFilter developer={this.props.developer} list={list} />
      </Drawer>,
      <div key="showHideButton" className="divSpacingBottom">
        {this.state.open ?
          <CustomIcon class="icn_arrow_left_fill" tip="Свернуть" fontSize="large" action={this.handleHide} style={{ borderRadius: "0px" }} /> :
          <CustomIcon class="icn_arrow_right_fill" tip="Показать" fontSize="large" action={this.handleShow} style={{ borderRadius: "0px" }} />
        }
      </div>
    ]
  }
};
