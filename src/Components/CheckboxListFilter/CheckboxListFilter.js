import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Checkbox } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

import { metaData, dataTable } from '../../config/data';
import { filters } from '../../config/filters';
import storage from '../../storages/commonStorage';
import './CheckboxListFilter.css';

function resortActive(developerList) {
  const activeDevsList = [];
  if (dataTable) {
    dataTable.forEach((row) => {
      if (row.author && row.author !== '' && activeDevsList.indexOf(row.author) === -1) {
        activeDevsList.push(row.author);
      }
      if (row.developer && row.developer !== '' && activeDevsList.indexOf(row.developer) === -1) {
        activeDevsList.push(row.developer);
      }
    });
  }

  const activeDevs = {};
  const nonActiveDevs = {};
  if (Object.keys(developerList).length > 0) {
    Object.keys(developerList).forEach((dev) => {
      if (activeDevsList.includes(dev)) {
        activeDevs[dev] = developerList[dev];
      } else {
        nonActiveDevs[dev] = developerList[dev];
      }
    });
  }

  return [activeDevs, nonActiveDevs];
}

export default class CheckboxListFilter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: [],
      developers: Object.keys(metaData.developerList),
    };

    this.inputFilter = this.props.developer;

    this.setChecked = this.setChecked.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;
      if (dataLoading && dataLoading === 'data') {
        this.setState({ developers: this.resortDevelopers() });
        filters.setValue('data', 'developer', this.state.checked);
      }

      if (this.inputFilter) {
        filters.setValue('data', 'developer', [this.inputFilter]);
        storage.data.dispatch({ type: 'REDRAW', redraw: true });
        this.setChecked([this.inputFilter]);
        this.inputFilter = undefined;
      }
    });

    this.unsubscribeUpd = storage.upd.subscribe(() => {
      if (storage.upd.getState().UPD.update) {
        this.setState({ developers: this.resortDevelopers() });
      }
    });

    this.unsubscribeData = storage.data.subscribe(() => {
      const { redraw } = storage.data.getState().DATA;
      if (
        redraw &&
        filters.data.developer &&
        filters.data.developer.length === 0 &&
        this.state.checked.length > 0
      ) {
        this.setChecked([]);
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribeUpd();
    this.unsubscribeData();
  }

  setChecked = (checked) => this.setState({ checked });

  resortDevelopers = (inputDevelopers = metaData.developerList) => {
    let sortedDevelopers = [];
    sortedDevelopers = resortActive(inputDevelopers);

    const outputDevelopers = [];
    if (Object.keys(sortedDevelopers[0]).length > 0) {
      Object.keys(sortedDevelopers[0])
        .sort((a, b) => (sortedDevelopers[0][a].value >= sortedDevelopers[0][b].value ? 1 : -1))
        .map((key) => outputDevelopers.push(key));
      outputDevelopers.push('divider');
      Object.keys(sortedDevelopers[1])
        .sort((a, b) => (sortedDevelopers[1][a].value >= sortedDevelopers[1][b].value ? 1 : -1))
        .map((key) => outputDevelopers.push(key));
    } else if (Object.keys(sortedDevelopers[1]).length > 0) {
      Object.keys(sortedDevelopers[1])
        .sort((a, b) => (sortedDevelopers[1][a].value >= sortedDevelopers[1][b].value ? 1 : -1))
        .map((key) => outputDevelopers.push(key));
    } else {
      Object.keys(inputDevelopers)
        .sort((a, b) => (inputDevelopers[a].value >= inputDevelopers[b].value ? 1 : -1))
        .map((key) => outputDevelopers.push(key));
    }

    return outputDevelopers;
  };

  handleToggle = (value) => () => {
    if (value !== '') {
      const currentIndex = this.state.checked.indexOf(value);
      const newChecked = [...this.state.checked];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      filters.setValue('data', 'developer', [...newChecked]);

      storage.data.dispatch({ type: 'REDRAW', redraw: true });
      this.setChecked(newChecked);
    } else {
      storage.data.dispatch({ type: 'REDRAW', redraw: true });
      this.props.updateData();
    }
  };

  render() {
    const { developers } = this.state;
    return (
      <List dense className="checkbox-list-filter">
        {developers.map((key) => {
          const developer = key !== 'divider' ? metaData.developerList[key] : null;
          const labelId = key !== 'divider' ? `checkbox-list-label-${developer.id}` : null;

          return key !== 'divider' ? (
            <ListItem
              key={developer.id}
              role={undefined}
              size="small"
              className="checkbox-list-filter__list-item"
              button
              onClick={this.handleToggle(developer.id)}
            >
              <ListItemIcon>
                <Checkbox
                  className="checkbox-list-filter__checkbox"
                  edge="start"
                  checked={this.state.checked.indexOf(developer.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={`${developer.value}`}
                className="checkbox-list-filter__text"
              />
            </ListItem>
          ) : (
            <Divider key="divider" />
          );
        })}
      </List>
    );
  }
}
