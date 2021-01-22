import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CustomButton from '../components/CustomButton';
import Grid from '@material-ui/core/Grid';
import Emoji from '../components/Emoji';
import StrategyCard from '../components/StrategyCard';
import { poolTest } from '../utils/pools';
import { useHistory } from 'react-router-dom';

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
    color: '#838383',
  },
  exploreContainer: {
    paddingTop: '50px',
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

const HomePage = () => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <>
      <div className={classes.root}>
        <Banner />
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={5}
        >
          <Grid item>
            <StrategyCard
              name={poolTest.name}
              description={poolTest.description}
              img={poolTest.illustration}
            />
          </Grid>
          <Grid item>
            <StrategyCard
              name={poolTest.name}
              description={poolTest.description}
              img={poolTest.illustration}
            />
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
