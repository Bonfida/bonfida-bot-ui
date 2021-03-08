import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CustomButton from '../components/CustomButton';
import Grid from '@material-ui/core/Grid';
import Emoji from '../components/Emoji';
import StrategyCard from '../components/StrategyCard';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import robot from '../assets/icons/illustrations/robot-top-bar.svg';
import { USE_POOLS } from '../utils/pools';
import FloatingCard from '../components/FloatingCard';
import { useSmallScreen } from '../utils/utils';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '50px',
  },
  title: {
    fontWeight: 500,
    fontSize: 32,
    color: '#393939',
    marginLeft: 50,
  },
  exploreContainer: {
    paddingTop: '50px',
  },
  redShadowRight: {
    boxShadow: '12px 12px 0px 1px #B80812',
    background: '#F0E9E7',
    border: '2px solid #B80812',
    boxSizing: 'border-box',
    width: '50vw',
    height: 250,
  },
  subtitle: {
    fontWeight: 500,
    fontSize: 24,
  },
  exploreBanner: {
    width: '50vw',
  },
});

const Banner = () => {
  const classes = useStyles();
  return (
    <div className={classes.bannerContainer}>
      <Emoji style={{ fontSize: 200 }} emoji="🤖" />
      <div>
        <Typography className={classes.title} align="center">
          Create and automate your very own trading strategies on chain
        </Typography>
      </div>
    </div>
  );
};

const ExploreBanner = () => {
  const classes = useStyles();
  const history = useHistory();
  const smallScreen = useSmallScreen('lg');
  return (
    <FloatingCard>
      <div className={classes.exploreBanner}>
        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="center"
          style={{ marginTop: 30 }}
        >
          <Grid item>
            <Typography className={classes.title} variant="h1">
              Create and automate your <br /> trading strategies on chain.
            </Typography>
            <CustomButton
              style={{ marginLeft: 50, marginTop: 40 }}
              onClick={() => {
                history.push('/explore');
              }}
            >
              Explore strategy
            </CustomButton>
          </Grid>
          {!smallScreen && (
            <Grid item>
              <img src={robot} style={{ height: 100 }} alt="" />
            </Grid>
          )}
        </Grid>
      </div>
    </FloatingCard>
  );
};

const Subtitle = () => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      style={{ marginTop: 60 }}
    >
      <Typography className={classes.subtitle} variant="h2">
        Featured strategies
      </Typography>
    </Grid>
  );
};

const HomePage = () => {
  const classes = useStyles();
  const history = useHistory();
  const smallScreen = useSmallScreen('md');
  return (
    <>
      <div className={classes.root}>
        <ExploreBanner />
        <Subtitle />
        <Grid
          container
          direction={smallScreen ? 'column' : 'row'}
          justify="center"
          alignItems="center"
          spacing={5}
          style={{ marginTop: 40 }}
        >
          <Grid item>
            <StrategyCard pool={USE_POOLS[0]} left={true} />
          </Grid>
          <div style={{ width: '10vw' }} />
          <Grid item>
            <StrategyCard pool={USE_POOLS[1]} left={false} />
          </Grid>
        </Grid>
        <div className={classes.exploreContainer}>
          <CustomButton onClick={() => history.push('/explore')}>
            Explore
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default HomePage;
