import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import bonfidaLogo from '../../assets/icons/crypto/fida.svg';
import { Grid, Typography } from '@material-ui/core';
import { useSmallScreen } from '../../utils/utils';
import { useHistory } from 'react-router';

const useStyles = makeStyles({
  root: {
    padding: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 27,
    textTransform: 'uppercase',
  },
  link: {
    color: '',
    fontSize: 16,
  },
  img: {
    height: 50,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    margin: 5,
  },
  a: {
    color: 'white',
    textDecoration: 'none',
  },
  disclaimer: {
    color: 'white',
    fontSize: 14,
    marginTop: 20,
  },
});

const INTERNAL_LINKS = [
  { name: 'Trade', url: '/trade/BTCUSDC' },
  { name: 'Nodes', url: '/nodes' },
  { name: 'Leaderboard', url: '/leaderboard' },
];

const EXTERNAL_LINKS = [
  { name: 'Help', url: 'https://docs.bonfida.org' },
  { name: 'Twitter', url: 'https://twitter.com/bonfida' },
  { name: 'Telegram', url: 'https://t.me/bonfidatg' },
];

const Brand = () => {
  const classes = useStyles();
  return (
    <>
      <img src={bonfidaLogo} className={classes.img} alt="" />
      <Typography variant="body1" className={classes.brand}>
        Bonfida
      </Typography>
    </>
  );
};

const InternalLinks = () => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <Grid
      container
      justify="flex-start"
      alignItems="flex-start"
      direction="column"
    >
      {INTERNAL_LINKS.map((l) => (
        <Grid item key={l.name}>
          <Typography className={classes.text} variant="body1">
            <div
              onClick={() => history.push(l.url)}
              style={{ cursor: 'pointer' }}
            >
              {l.name}
            </div>
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};

const ExternalLinks = ({ list }: { list: { name: string; url: string }[] }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      justify="flex-start"
      alignItems="flex-start"
      direction="column"
    >
      {list.map((l) => (
        <Grid item key={l.name}>
          <Typography className={classes.text} variant="body1">
            <a
              href={l.url}
              className={classes.a}
              target="_blank"
              rel="noopener noreferrer"
            >
              {l.name}
            </a>
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};

const Footer = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  if (smallScreen) {
    return (
      <div className={classes.root}>
        <Grid
          container
          justify="space-around"
          alignItems="flex-start"
          spacing={10}
        >
          <Grid item>
            <Brand />
            <InternalLinks />
          </Grid>
          <Grid item>
            <ExternalLinks list={EXTERNAL_LINKS} />
          </Grid>
        </Grid>
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <Grid container justify="center" alignItems="center" spacing={10}>
        <Grid item>
          <Brand />
        </Grid>
        <Grid item>
          <Grid
            container
            justify="space-around"
            alignItems="flex-start"
            spacing={10}
          >
            <Grid item>
              <InternalLinks />
            </Grid>
            <Grid item>
              <ExternalLinks list={EXTERNAL_LINKS} />
            </Grid>
          </Grid>
          <Typography className={classes.disclaimer}>
            This web site is hosted on IPFS and is not available in the United
            States or other prohibited jurisdictions
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default Footer;
