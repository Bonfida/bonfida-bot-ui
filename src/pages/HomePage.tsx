import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CustomButton from '../components/CustomButton';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import robot from '../assets/icons/illustrations/robot-top-bar.svg';
import FloatingCard from '../components/FloatingCard';
import { useSmallScreen } from '../utils/utils';
import {
  RSI_STRATEGIES,
  SUPER_TRENDS_STRATEGIES,
  StrategySection,
} from './ExplorePage';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '3%',
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

const HomePage = () => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <>
      <div className={classes.root}>
        <ExploreBanner />
        <StrategySection
          h2="Super Trend Strategies"
          strategiesArray={SUPER_TRENDS_STRATEGIES}
        />
        <StrategySection h2="RSI Strategies" strategiesArray={RSI_STRATEGIES} />
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
