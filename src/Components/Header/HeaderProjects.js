import React from 'react';
import { Tab, Tabs, AppBar } from '@material-ui/core';

import { filters } from '../../utils/filters';
import { getData } from '../../utils/apiFunctions';
import storage from '../../storages/commonStorage';

function a11yProps(index) {
  return {
    id: `projects-tab-${index}`,
    'aria-controls': `projects-tabpanel-${index}`,
  };
}

function HeaderProjects({ dataTable, projectList }) {
  const [value, setValue] = React.useState(0);
  const [projects, setProjects] = React.useState(Object.values(projectList || {}));

  const reloadActiveProjects = () => {
    const projectsHash = {};

    dataTable.forEach((data) => {
      projectsHash[data.project] = true;
    });
    const projectsActive = {};
    const projectsOther = {};

    Object.keys(projectList).forEach((project) => {
      const projectInfo = { ...projectList[project] };

      if (projectsHash[project] && !projectsActive[project]) {
        projectInfo.showAsDisabled = false;
        projectsActive[project] = projectInfo;
      }

      if (!projectsHash[project] && !projectsOther[project]) {
        projectInfo.showAsDisabled = true;
        projectsOther[project] = projectInfo;
      }
    });

    const projectsReloaded = [];
    Object.values(projectsActive)
      .sort((a, b) => (a.value >= b.value ? 1 : -1))
      .map((project) => projectsReloaded.push(project));
    Object.values(projectsOther)
      .sort((a, b) => (a.value >= b.value ? 1 : -1))
      .map((project) => projectsReloaded.push(project));

    setProjects(projectsReloaded);
  };

  const handleChange = (event, newValue) => {
    filters.setValue('data', 'project', newValue === 0 ? '' : projects[newValue - 1].id);

    storage.data.dispatch({ type: 'REDRAW', redraw: true });
    setValue(newValue);
  };

  const unsubscribe = storage.state.subscribe(() => {
    const { dataLoading } = storage.state.getState().STATE;

    if (dataLoading && dataLoading === 'data') {
      setValue(0);
      reloadActiveProjects();
    }
  });

  const unsubscribeUpd = storage.upd.subscribe(() => {
    if (storage.upd.getState().UPD.update) {
      reloadActiveProjects();
    }
  });

  const unsubscribeData = storage.data.subscribe(() => {
    const { redraw } = storage.data.getState().DATA;
    if (redraw && (!filters.data.project || filters.data.project === '') && value > 0) {
      setValue(0);
    }
  });

  React.useEffect(() => {
    getData('project').then((list) => setProjects(Object.values(list)));

    unsubscribe();
    unsubscribeUpd();
    unsubscribeData();

    return () => {
      unsubscribe();
      unsubscribeUpd();
      unsubscribeData();
    };
  }, []);

  const classes = {};

  return (
    <AppBar position="static" className="header-modes-projects__bar" color="default">
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="on"
        aria-label="scrollable auto tabs example"
      >
        <Tab
          label="Все"
          {...a11yProps(0)}
          key="all"
          classes={{ root: classes.tabStyles }}
          className="header-modes-projects__modes-item"
        />

        {projects.map((project, index) => (
          <Tab
            label={project.value}
            {...a11yProps(index + 1)}
            key={project.id}
            disabled={project.showAsDisabled}
            classes={{ root: classes.tabStyles }}
            className="header-modes-projects__modes-item"
          />
        ))}
      </Tabs>
    </AppBar>
  );
}

export default React.memo(HeaderProjects);
