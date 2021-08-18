import React from 'react';
import {
  PoolGraph,
  PoolDepositWithdrawPanel,
  PoolDetails,
  PoolProfile,
} from '../components/Pool';
import { useHistory, useParams } from 'react-router-dom';
import { isValidPublicKey, getPoolUrl, useSmallScreen } from '../utils/utils';
import Grid from '@material-ui/core/Grid';
import Trans from '../components/Translation';
import { makeStyles } from '@material-ui/core/styles';
import arrowBack from '../assets/components/PoolPage/back-arrow.svg';
import { Typography } from '@material-ui/core';
import bottomLight from '../assets/components/PoolPage/bottom-light.svg';

const useStyles = makeStyles({
  root: {
    margin: 'auto',
  },
  innerContainer: {
    display: 'flex',
    alignItems: 'start',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  backToExplore: {
    color: '#77E3EF',
    fontSize: 18,
  },
  h1: {
    color: '#FFFFFF',
    textShadow:
      '0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)',
    fontSize: 68,
    margin: 10,
    fontWeight: 600,
    lineHeight: '107%',
  },
  arrow: {
    marginRight: 10,
  },
  titleContainer: {
    marginLeft: '10%',
    marginBottom: 30,
    marginTop: 40,
  },
  bottomLigt: {
    position: 'absolute',
    transform: 'matrix(-0.93, 0.54, -0.33, -0.88, 0, 0)',
    filter: 'blur(50px)',
    left: -550,
    top: -200,
    zIndex: -1,
    mixBlendMode: 'color-dodge',
    opacity: 0.5,
  },
  bottomLightContainer: {
    position: 'relative',
  },
});

const BottomLight = () => {
  const classes = useStyles();
  return (
    <div className={classes.bottomLightContainer}>
      <img src={bottomLight} className={classes.bottomLigt} alt="" />
    </div>
  );
};

const PoolPageInner = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  return (
    <div className={classes.innerContainer}>
      <PoolDepositWithdrawPanel poolSeed={poolSeed} />
      <PoolDetails poolSeed={poolSeed} />
      <PoolGraph poolSeed={poolSeed} />
    </div>
  );
};

const Title = () => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <div className={classes.titleContainer}>
      <div
        onClick={() => history.push('/explore')}
        style={{ cursor: 'pointer' }}
      >
        <Typography className={classes.backToExplore}>
          <img src={arrowBack} className={classes.arrow} alt="" />
          Back to explore
        </Typography>
      </div>
      <Typography className={classes.h1} variant="h1">
        Pool details
      </Typography>
    </div>
  );
};

const PoolPage = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen();
  let { poolSeed } = useParams<{ poolSeed: string }>();
  poolSeed = getPoolUrl(poolSeed);
  if (!isValidPublicKey(poolSeed)) {
    return <Trans>Invalid poolSeed</Trans>;
  }
  return (
    <div
      className={classes.root}
      style={{ width: smallScreen ? '90%' : '60%' }}
    >
      <Title />
      <Grid container justify="center" spacing={5}>
        <Grid item>
          <PoolProfile poolSeed={poolSeed} />
        </Grid>
        <Grid item>
          <PoolPageInner poolSeed={poolSeed} />
        </Grid>
      </Grid>
      <BottomLight />
    </div>
  );
};

export default PoolPage;
