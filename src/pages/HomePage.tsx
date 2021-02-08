import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CustomButton from '../components/CustomButton';
import Grid from '@material-ui/core/Grid';
import Emoji from '../components/Emoji';
import StrategyCard from '../components/StrategyCard';
import { poolTest, poolRsi } from '../utils/pools';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import robot from '../assets/icons/illustrations/robot-top-bar.svg';

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
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  return (
    <div className={classes.redShadowRight}>
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
            <img src={robot} style={{ height: 100 }} />
          </Grid>
        )}
      </Grid>
    </div>
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
  return (
    <>
      <div className={classes.root}>
        {/* <Banner />
         */}
        <ExploreBanner />
        <Subtitle />
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={5}
          style={{ marginTop: 40 }}
        >
          <Grid item>
            <StrategyCard pool={poolRsi} left={true} />
          </Grid>
          <div style={{ width: '10vw' }} />
          <Grid item>
            <StrategyCard pool={poolTest} left={false} />
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
