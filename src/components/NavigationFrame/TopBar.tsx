import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import WalletConnect from '../WalletConnect';
import { useSmallScreen } from '../../utils/utils';
import fida from '../../assets/icons/crypto/fida.svg';
import Link from '../Link';

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
    '&:hover': {
      cursor: 'pointer',
    },
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
    link: '/',
  },
  {
    name: 'Explore',
    link: '/explore',
  },
  {
    name: 'My Pools',
    link: '/my-pools',
  },
  {
    name: 'FAQ',
    link: 'https://docs.bonfida.org/help/bonfida-bots/faq-bonfida-bots',
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
        return (
          <Link
            external={e.link.includes('https')}
            to={e.link}
            style={{ textDecoration: 'none' }}
          >
            <div key={`top-bar-el-${i}`} className={classes.topBarText}>
              {e.name}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const Logo = () => {
  const classes = useStyles();
  return (
    <>
      <img src={fida} className={classes.logo} alt="" />
    </>
  );
};

const TopBar = () => {
  const classes = useStyles();
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
