import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import WalletConnect from '../WalletConnect';
import { useSmallScreen } from '../../utils/utils';
import fida from '../../assets/icons/crypto/fida.svg';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    width: 33,
  },
  buttonContainer: {
    paddingRight: '100px',
  },
  text: {
    fontSize: '18px',
    fontWeight: 900,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  tab: {
    color: 'black',
    fontSize: 20,
  },
  indicator: {
    backgroundColor: '#5C1864',
  },
  topBarText: {
    fontWeight: 600,
    fontSize: 18,
    margin: 10,
    color: '#FFFFFF',
  },
  linkContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const topBarElements = [
  {
    name: 'Home',
    link: '',
  },
  {
    name: 'Explore',
    link: '',
  },
  {
    name: 'Create',
    link: '',
  },
  {
    name: 'FAQ',
    link: '',
  },
];

const LinkSection = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  if (smallScreen) {
    return <Logo />;
  }
  return (
    <div className={classes.linkContainer}>
      <div style={{ marginRight: 20 }}>
        <Logo />
      </div>
      {topBarElements.map((e, i) => {
        return <div className={classes.topBarText}>{e.name}</div>;
      })}
    </div>
  );
};

const Logo = () => {
  const classes = useStyles();
  return (
    <>
      <img src={fida} className={classes.logo} />
    </>
  );
};

const TopBar = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  return (
    <div className={classes.root}>
      <div>
        <LinkSection />
      </div>
      <div>
        <WalletConnect />
      </div>
    </div>
  );
};

export default TopBar;
