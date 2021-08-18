import React, { useEffect } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { useSnackbar } from 'notistack';
import SnackbarUtils from './utils/SnackbarUtils';
import NavigationFrame from './components/NavigationFrame';
import PoolPage from './pages/PoolPage';
import ExplorePage from './pages/ExplorePage';
import CreatePoolPage from './pages/CreatePoolPage';
import SignalProviderPage from './pages/SignalProviderPage';
import MyPoolPage from './pages/MyPoolPage';
import TradingViewPage from './pages/TradingViewPage';
import TradingViewMessageGeneratorPage from './pages/TradingViewMessageGeneratorPage';
import WrapperPage from './pages/WrapperPage';
import { ASSETS, STRATEGY_TYPES, USE_POOLS } from './utils/pools';
import CompetitionPage from './pages/CompetitionPage';

const COMPENDIUM_BTC = USE_POOLS.find(
  (p) =>
    p.strategyType === STRATEGY_TYPES.COMPENDIUML && p.mainAsset === ASSETS.BTC,
);

const COMPENDIUM_SOL = USE_POOLS.find(
  (p) =>
    p.strategyType === STRATEGY_TYPES.COMPENDIUML && p.mainAsset === ASSETS.SOL,
);

const BENSON = USE_POOLS.find(
  (p) => p.strategyType === STRATEGY_TYPES.SENTIMENT_BENSON,
);

const BART_BTC = USE_POOLS.find(
  (p) => p.strategyType === STRATEGY_TYPES.BART && p.mainAsset === ASSETS.BTC,
);

export default function Routes() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    SnackbarUtils.setSnackBar(enqueueSnackbar, closeSnackbar);
  }, [enqueueSnackbar, closeSnackbar]);
  return (
    <HashRouter>
      <NavigationFrame>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route extact path="/explore" component={ExplorePage} />
          <Route extact path="/create" component={CreatePoolPage} />
          <Route exact path="/tradingview" component={TradingViewPage} />
          <Route exact path="/wrapper" component={WrapperPage} />
          <Route
            exact
            path="/tradingview-generator"
            component={TradingViewMessageGeneratorPage}
          />
          <Route
            extact
            path="/signal-provider/:poolSeed"
            component={SignalProviderPage}
          />
          <Route extact path="/my-pools" component={MyPoolPage} />
          <Route exact path="/pool/:poolSeed">
            <PoolPage />
          </Route>
          <Route exact path="/compendium-btc">
            <Redirect to={`/pool/${COMPENDIUM_BTC?.poolSeed}`} />
          </Route>
          <Route exact path="/compendium-sol">
            <Redirect to={`/pool/${COMPENDIUM_SOL?.poolSeed}`} />
          </Route>
          <Route exact path="/benson">
            <Redirect to={`/pool/${BENSON?.poolSeed}`} />
          </Route>
          <Route exact path="/bart-btc">
            <Redirect to={`/pool/${BART_BTC?.poolSeed}`} />
          </Route>
          <Route exact path="/competition" component={CompetitionPage} />
        </Switch>
      </NavigationFrame>
    </HashRouter>
  );
}
