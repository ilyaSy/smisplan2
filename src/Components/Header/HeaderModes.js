import React from 'react';
import { Tab, Tabs, AppBar } from '@material-ui/core';
import { Switch, Route, Link, Redirect } from 'react-router-dom';

import storage from '../../storages/commonStorage';
import { modes, mainModes } from '../../config/constants';
import { filters } from '../../utils/filters';

function a11yProps(index) {
  return {
    id: `modes-tab-${index}`,
    'aria-controls': `modes-tabpanel-${index}`,
  };
}

function HeaderModes({ reloadDataTable }) {
  const hostpath = window.location.href.search(/localhost:3000/) !== -1 ? '' : 'smisplan';

  const getMode = (pathname) => {
    const pathArray = pathname.split('/').slice(1);
    if (pathArray[0] === hostpath) pathArray.shift();

    return pathArray[0];
  };

  const tableName = getMode(document.location.pathname);

  const [value, setValue] = React.useState(
    `${hostpath && `/${hostpath}`}/${mainModes.includes(tableName) ? tableName : 'task'}`
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const mode = getMode(newValue);

    filters.perm = [];
    reloadDataTable(mode);
  };

  React.useEffect(() => {
    const subscribe = () => {
      storage.table.subscribe(() => {
        const storageTableName = storage.table.getState().TABLE.tableName;
        if (storageTableName) {
          setValue(`${hostpath && `/${hostpath}`}/${storageTableName}`);
        }
      });
    };

    subscribe();
    return subscribe();
  }, [hostpath]);

  return (
    <AppBar position="static" className="header-modes-projects__bar" color="default">
      <Route
        path="/"
        // render={({ location }) => (
        render={() => (
          <>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
              aria-label="scrollable auto tabs example"
            >
              {modes.map((mode, index) => (
                <Tab
                  className="header-modes-projects__modes-item"
                  label={mode.value}
                  {...a11yProps(index)}
                  key={mode.id}
                  disabled={mode.disabled}
                  value={`${hostpath && `/${hostpath}`}/${mode.id}`}
                  to={`${hostpath && `/${hostpath}`}/${mode.id}`}
                  component={Link}
                />
              ))}
            </Tabs>
            <Switch>
              {modes.map((mode) => (
                <Route path={`${hostpath && `/${hostpath}`}/${mode.id}`} key={`Link-${mode.id}`} />
              ))}
              <Redirect to={`${hostpath && `/${hostpath}`}/${tableName}`} />
            </Switch>
          </>
        )}
      />
    </AppBar>
  );
}

export default React.memo(HeaderModes);
