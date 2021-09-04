import React from 'react';
import { Input } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import CustomIcon from '../../SharedComponents/CustomIcon';

export default function TblHeaderSearch(props) {
  const [search, setSearch] = React.useState('');

  const clearSearch = () => {
    setSearch('');
    props.setSearch('');
  };

  const handleSearch = () => props.setSearch(search);

  const handleChange = (e) => setSearch(e.target.value);

  return (
    <Input
      type="text"
      placeholder="Поиск"
      value={search}
      inputProps={{ style: { fontSize: 'var(--font-size-table)', width: '200px' } }}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSearch();
        if (e.key === 'Escape') clearSearch();
      }}
      startAdornment={
        <InputAdornment position="start">
          <CustomIcon class="icn_search" tip="Найти" action={handleSearch} />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end">
          <CustomIcon class="icn_clear" tip="Сбросить поиск" action={clearSearch} />
        </InputAdornment>
      }
    />
  );
}
