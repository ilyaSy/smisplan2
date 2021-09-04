import React from 'react';
import { Tab, Tabs, AppBar } from '@material-ui/core';

import { metaData, dataTable, filters } from '../../config/data';
import { getData } from '../../utils/api';
import storage from '../../storages/commonStorage';

function a11yProps(index) {
  return {
    id: `projects-tab-${index}`,
    'aria-controls': `projects-tabpanel-${index}`,
  };
}

/* *************************  Project list  ******************************* */
export default class HeaderProjects extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { value: 0, projects: Object.values(metaData.projectList) };
    this.setValue = this.setValue.bind(this);
    this.setProjects = this.setProjects.bind(this);
  }

  componentDidMount() {
    getData('project').then(() => this.setProjects(Object.values(metaData.projectList)));

    this.unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;

      if (dataLoading && dataLoading === 'data') {
        this.setValue(0);
        this.reloadActiveProjects();
      }
    });

    this.unsubscribeUpd = storage.upd.subscribe(() => {
      if (storage.upd.getState().UPD.update) {
        this.reloadActiveProjects();
      }
    });

    this.unsubscribeData = storage.data.subscribe(() => {
      const { redraw } = storage.data.getState().DATA;
      const { value } = this.state;
      if (redraw && (!filters.data.project || filters.data.project === '') && value > 0) {
        this.setValue(0);
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribeData();
    this.unsubscribeUpd();
  }

  setProjects = (projects) => {
    this.setState({ projects });
  };

  setValue = (value) => {
    this.setState({ value });
  };

  reloadActiveProjects = () => {
    const projects = [];
    const projectsHash = {};
    dataTable.forEach((data) => {
      projectsHash[data.project] = true;
    });
    const projectsActive = {};
    const projectsOther = {};

    Object.keys(metaData.projectList).forEach((project) => {
      if (projectsHash[project] && !projectsActive[project]) {
        metaData.projectList[project].showAsDisabled = false;
        projectsActive[project] = metaData.projectList[project];
      }

      if (!projectsHash[project] && !projectsOther[project]) {
        metaData.projectList[project].showAsDisabled = true;
        projectsOther[project] = metaData.projectList[project];
      }
    });

    Object.values(projectsActive)
      .sort((a, b) => (a.value >= b.value ? 1 : -1))
      .map((project) => projects.push(project));
    Object.values(projectsOther)
      .sort((a, b) => (a.value >= b.value ? 1 : -1))
      .map((project) => projects.push(project));

    this.setProjects(projects);
  };

  handleChange = (event, newValue) => {
    const { projects } = this.state;
    filters.setValue('data', 'project', newValue === 0 ? '' : projects[newValue - 1].id);

    storage.data.dispatch({ type: 'REDRAW', redraw: true });
    this.setValue(newValue);
  };

  render() {
    const classes = {};
    const { value, projects } = this.state;

    return (
      <AppBar position="static" className="header-modes-projects__bar" color="default">
        <Tabs
          value={value}
          onChange={this.handleChange}
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
}
