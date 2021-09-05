import React from 'react';
import { Input } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import CustomIcon from '../../../SharedComponents/CustomIcon';

export default function TblCellInput({ defaultValue, actionOk, actionCancel }) {
  const [item, setItem] = React.useState(defaultValue);
  const handleOk = () => actionOk(item.property, item.value);

  return (
    <Input
      type="text"
      fullWidth
      autoFocus
      value={item.value}
      onChange={(e) => setItem({ ...item, value: e.target.value })}
      /* edit item ok / cancel buttons */
      endAdornment={
        <InputAdornment position="end">
          <div className="data-table__cell-edit-buttons">
            <CustomIcon class="icn_ok" action={handleOk} />
            <CustomIcon class="icn_cancel" action={actionCancel} />
          </div>
        </InputAdornment>
      }
    />
  );
}
