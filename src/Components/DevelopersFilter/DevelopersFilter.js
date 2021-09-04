import React from 'react';
import CheckboxListFilter from '../../SharedComponents/CheckboxListFilter/CheckboxListFilter';

import { metaData, dataTable } from '../../config/data';
import { filters } from '../../utils/filters';
import storage from '../../storages/commonStorage';

function resortActive(developerList) {
  const activeDevsList = [];
  if (dataTable) {
    dataTable.forEach((row) => {
      if (row.author && row.author !== '' && !activeDevsList.includes(row.author)) {
        activeDevsList.push(row.author);
      }
      if (row.developer && row.developer !== '' && !activeDevsList.includes(row.developer)) {
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

export default function DevelopersFilter(props) {
  const [developers, setDevelopers] = React.useState(Object.keys(metaData.developerList));

  const resortDevelopers = (inputDevelopers = metaData.developerList) => {
    const sortedDevelopers = resortActive(inputDevelopers);

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

  React.useEffect(() => {
    const unsubscribe = storage.state.subscribe(() => {
      const { dataLoading } = storage.state.getState().STATE;
      if (dataLoading && dataLoading === 'data') {
        setDevelopers(resortDevelopers());
      }

      if (props.inputFilter) {
        filters.setValue('data', 'developer', [props.inputFilter]);
        storage.data.dispatch({ type: 'REDRAW', redraw: true });
      }
    });

    const unsubscribeUpd = storage.upd.subscribe(() => {
      if (storage.upd.getState().UPD.update) {
        setDevelopers(resortDevelopers());
      }
    });

    return () => {
      unsubscribe();
      unsubscribeUpd();
    };
  }, []);

  return (
    <CheckboxListFilter
      options={developers}
      optionsMap={metaData.developerList}
      inputFilter={props.inputFilter}
      filterType="developer"
    />
  );
}
