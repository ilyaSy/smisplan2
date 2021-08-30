import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ReactToPrint from 'react-to-print';

import { metaData, filters } from '../../config/data';
import { getData } from '../../utils/api';
import MenuItemSettings from '../MenuItemSettings/MenuItemSettings';
import MenuItemChief from '../MenuItemChief/MenuItemChief';
import storage from '../../storages/commonStorage';
import './HeaderLogin.css';

/* *************************  Login info  ******************************* */
export default class HeaderLogin extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { username: '' };
    this._columnsList = React.createRef();
  }

  filtersOff = () => {
    filters.clear();
    const filtersStorage = JSON.parse(sessionStorage.getItem('filters') || '{}');
    filtersStorage[metaData.dataTableName] = {data: {}, perm: {}};
    const filtersString = JSON.stringify(filtersStorage);
    sessionStorage.setItem('filters', filtersString);

    storage.data.dispatch({ type: 'REDRAW', redraw: true });
  };

  reloadDataTable = (mode) => {
    this.filtersOff();
    this.props.reloadDataTable(mode);
  };

  componentDidMount() {
    getData('user')
      .then((user) => this.setState({ username: user.username }));
  }

  render() {
    return (
      <div className="header-login">
        <div className="header-login__menu">
          <ReactToPrint
            trigger={() => (
              <Tooltip title="Распечатать">
                <IconButton className="icn" style={{ padding: '0px' }}>
                  <PrintIcon fontSize="large" />
                </IconButton>
              </Tooltip>
            )}
            content={() => this.props.dataRef.current}
          />

          <MenuItemSettings ref={this._columnsList} class="icn_filter" name="MenuSettings" />

          <MenuItemChief
            class="icn_chief"
            name="MenuChief"
            reloadDataTable={this.props.reloadDataTable}
          />

          <Tooltip title="Сбросить фильтры">
            <IconButton className="icn" style={{ padding: '0px' }} onClick={this.filtersOff}>
              <VisibilityIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
        <div className="header-login__login">
          <b>Логин</b>: {this.state.username}
        </div>
      </div>
    );
  }
}
