import React from 'react';
import { IconButton } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';

import storage from '../storages/commonStorage';

function Hint() {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState('success');
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    const subscribe = () =>
      storage.alert.subscribe(() => {
        const { alert } = storage.alert.getState().ALERT;
        if (alert) {
          setType(alert.status);
          setText(alert.message);
          setOpen(true);

          if (alert.type !== 'warn') {
            storage.alert.dispatch({ type: 'HIDE_ALERT' });
          }
        }
      });

    return subscribe();
  }, []);

  const typeWarn = `alert${type.charAt(0).toUpperCase()}${type.slice(1)}`;

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      autoHideDuration={6000}
      message={text}
      ContentProps={{ classes: { root: typeWarn } }}
      TransitionComponent={(props) => <Slide {...props} direction="right" />}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => {
            setOpen(false);
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
}

export default React.memo(Hint);
