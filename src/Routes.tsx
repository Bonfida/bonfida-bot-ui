import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { useSnackbar } from 'notistack';
import SnackbarUtils from './utils/SnackbarUtils';
import NavigationFrame from './components/NavigationFrame';
import PoolPage from './pages/PoolPage';
import FaqPage from './pages/FaqPage';

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
          <Route exact path="/faq" component={FaqPage} />
          <Route exact path="/pool/:poolAddress" component={PoolPage} />
        </Switch>
      </NavigationFrame>
    </BrowserRouter>
  );
}
