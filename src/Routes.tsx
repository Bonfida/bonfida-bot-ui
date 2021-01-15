import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { useSnackbar } from 'notistack';
import SnackbarUtils from './utils/SnackbarUtils';
import NavigationFrame from './components/NavigationFrame';

export default function Routes() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    SnackbarUtils.setSnackBar(enqueueSnackbar, closeSnackbar);
  }, [enqueueSnackbar, closeSnackbar]);
  return (
    <BrowserRouter>
      <NavigationFrame>
        <Switch>
          <Route exact path="/" component={HomePage} />
        </Switch>
      </NavigationFrame>
    </BrowserRouter>
  );
}
