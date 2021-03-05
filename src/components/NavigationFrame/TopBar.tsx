import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery/useMediaQuery';
import { useHistory, useLocation } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import WalletConnect from '../WalletConnect';
import Settings from '../Settings';
import robot from '../../assets/icons/illustrations/robot-top-bar.svg';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  AppBar: {
    marginTop: '40px',
    background: 'transparent',
  },
  logo: {
    paddingLeft: '100px',
    cursor: 'pointer',
  },
  buttonContainer: {
    paddingRight: '100px',
  },
  text: {
    fontSize: '18px',
    fontWeight: 900,
    textTransform: 'capitalize',
    color: '#393939',
  },
  button: {
    color: '#838383',
    paddingLeft: '25px',
    paddingRight: '25px',
    paddingTop: '10px',
    paddingButton: '10px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'unset',
      color: '#BA0202',
    },
  },
  bonfidaBot: {
    color: '#393939',
    fontSize: 20,
    fontWeight: 500,
  },
});

const topBarElement = [
  {
    name: 'home',
    href: '/',
  },
  {
    name: 'explore',
    href: '/explore',
  },
  {
    name: 'balances',
    href: '/balances',
  },
  {
    name: 'pools',
    href: '/my-pools',
  },
  {
    name: 'create',
    href: '/create',
  },
  {
    name: 'faq',
    href: '/faq',
  },
];

const Logo = () => {
  const classes = useStyles();

  return (
    <>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={5}
      >
        <Grid item>
          <img
            src={robot}
            style={{ fontSize: 40, marginLeft: 80, height: 40 }}
          />
        </Grid>
        <Grid item>
          <Typography className={classes.bonfidaBot}>BonfidaBot</Typography>
        </Grid>
      </Grid>
    </>
  );
};

const TopBar = () => {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  let theme = useTheme();
  let smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedIndex, setSelectedIndex] = React.useState<string | null>(null);

  useEffect(() => {
    if (location.pathname.includes('explore')) {
      setSelectedIndex('explore');
    } else if (location.pathname.includes('faq')) {
      setSelectedIndex('faq');
    } else if (location.pathname.includes('balances')) {
      setSelectedIndex('balances');
    } else if (location.pathname.includes('create')) {
      setSelectedIndex('create');
    } else if (location.pathname.includes('pools')) {
      setSelectedIndex('pools');
    } else {
      setSelectedIndex('home');
    }
  }, [location]);

  return (
    <div className={classes.root}>
      <AppBar className={classes.AppBar} position="static" elevation={0}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          {!smallScreen && (
            <>
              <Grid item>
                <Logo />
              </Grid>
            </>
          )}
          <Grid item>
            {topBarElement.map((e, i) => {
              return (
                <Button
                  key={`top-bar-${i}`}
                  className={classes.button}
                  onClick={() => history.push(e.href)}
                  style={{
                    color: selectedIndex === e.name ? '#BA0202' : '#393939',
                  }}
                >
                  {e.name}
                </Button>
              );
            })}
          </Grid>
          <Grid item className={classes.buttonContainer}>
            <Grid
              container
              direction="row"
              justify="space-around"
              alignItems="center"
            >
              <Grid item style={{ paddingRight: 20 }}>
                <WalletConnect />
              </Grid>
              <Grid item>
                <Settings />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AppBar>
    </div>
  );
};

export default TopBar;
