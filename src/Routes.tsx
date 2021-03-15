import React, { useEffect } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { useSnackbar } from 'notistack';
import SnackbarUtils from './utils/SnackbarUtils';
import NavigationFrame from './components/NavigationFrame';
import PoolPage from './pages/PoolPage';
import FaqPage from './pages/FaqPage';
import BalancesPage from './pages/BalancesPage';
import ExplorePage from './pages/ExplorePage';
import CreatePoolPage from './pages/CreatePoolPage';
import SignalProviderPage from './pages/SignalProviderPage';
import MyPoolPage from './pages/MyPoolPage';
import TradingViewPage from './pages/TradingViewPage';
import TradingViewMessageGeneratorPage from './pages/TradingViewMessageGeneratorPage';
import { renderToStaticMarkup } from 'react-dom/server';
import { withLocalize } from 'react-localize-redux';
// @ts-ignore
import globalTranslations from './translations/global.json';

const Routes = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    SnackbarUtils.setSnackBar(enqueueSnackbar, closeSnackbar);
  }, [enqueueSnackbar, closeSnackbar]);
  return (
    <HashRouter>
      <NavigationFrame>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/help" component={FaqPage} />
          <Route extact path="/balances" component={BalancesPage} />
          <Route extact path="/explore" component={ExplorePage} />
          <Route extact path="/create" component={CreatePoolPage} />
          <Route exact path="/tradingview" component={TradingViewPage} />
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
        </Switch>
      </NavigationFrame>
    </HashRouter>
  );
};

class Main extends React.Component {
  constructor(props) {
    super(props);
    // @ts-ignore
    this.props.initialize({
      languages: [
        { name: 'English', code: 'en' },
        { name: 'Chinese', code: 'zh' },
      ],
      translation: globalTranslations,
      options: { renderToStaticMarkup },
    });
  }

  render() {
    return <Routes />;
  }
}

// @ts-ignore
export default withLocalize(Main);
