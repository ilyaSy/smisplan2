import React from 'react';
import { Tab, Tabs, AppBar } from '@material-ui/core';
import { Switch, Route, Link, Redirect } from 'react-router-dom';

import storage from '../../storages/commonStorage';
import { metaData, filters, modes, mainModes } from '../../config/data';

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
  }

  const tableName = getMode(document.location.pathname);

  const [value, setValue] = React.useState(`${hostpath && '/' + hostpath}/${mainModes.indexOf(tableName) !== -1 ? tableName : 'task'}`)

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const mode = getMode(newValue);

    filters.perm = [];
    switch (mode) {
      case 'spec_notes':
        reloadDataTable(mode, () => {
          filters.setValue('perm', '_authorORdeveloper', metaData.user.login);
        });
        break;
      case 'daily':
        reloadDataTable('task', () => {
          let today = new Date();
          filters.setValue('data', 'dateEnd', today.toISOString().replace(/(.+)T(.+)\..+/, '$1'));
          filters.setValue('data', 'status', 'done');
          setValue(newValue);
        });
        break;
      default:
        reloadDataTable(mode);
        break;
    }
  };

  React.useEffect(() => {
    const subscribe = () => {
      storage.table.subscribe(() => {
        const storageTableName = storage.table.getState().TABLE.tableName;
        if (storageTableName) {
          setValue(`${hostpath && '/' + hostpath}/${storageTableName}`);
        }
      });
    }

    subscribe();
    return subscribe();
  }, [hostpath])

  return (
    <AppBar position="static" className="header-modes-projects__bar" color="default">
        <Route
          path="/"
          render={({ location }) => (
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
                {modes.map((mode, index) => {
                  return (
                    <Tab
                      className="header-modes-projects__modes-item"
                      label={mode.value}
                      {...a11yProps(index)}
                      key={mode.id}
                      disabled={mode.disabled ? true : false}
                      value={`${hostpath && '/' + hostpath}/${mode.id}`}
                      to={`${hostpath && '/' + hostpath}/${mode.id}`}
                      component={Link}
                    />
                  );
                })}
              </Tabs>
              <Switch>
                {modes.map((mode, index) => {
                  return <Route path={`${hostpath && '/' + hostpath}/${mode.id}`} key={`Link-${mode.id}`} />;
                })}
                <Redirect to={`${hostpath && '/' + hostpath}/${tableName}`} />
              </Switch>
            </>
          )}
        />
      </AppBar>
  );
}

export default React.memo(HeaderModes);
