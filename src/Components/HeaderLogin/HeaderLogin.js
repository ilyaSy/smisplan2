import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ReactToPrint from 'react-to-print';

import { filters } from '../../utils/filters';
import { getData } from '../../utils/api';
import MenuItemSettings from '../MenuItemSettings/MenuItemSettings';
import MenuItemChief from '../MenuItemChief/MenuItemChief';
import storage from '../../storages/commonStorage';
import './HeaderLogin.css';

function HeaderLogin({ reloadDataTable, dataRef }) {
  const [username, setUsername] = React.useState('');
  const _columnsListRef = React.useRef(null);

  React.useEffect(() => {
    getData('user').then((user) => setUsername(user.username));
  }, []);

  const filtersOff = () => {
    filters.clear();
    storage.data.dispatch({ type: 'REDRAW', redraw: true });
  };

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
          content={() => dataRef.current}
        />

        <MenuItemSettings ref={_columnsListRef} class="icn_filter" name="MenuSettings" />

        <MenuItemChief class="icn_chief" name="MenuChief" reloadDataTable={reloadDataTable} />

        <Tooltip title="Сбросить фильтры">
          <IconButton className="icn" style={{ padding: '0px' }} onClick={filtersOff}>
            <VisibilityIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </div>
      <div className="header-login__login">
        <b>Логин</b>: {username}
      </div>
    </div>
  );
}

export default React.memo(HeaderLogin);
