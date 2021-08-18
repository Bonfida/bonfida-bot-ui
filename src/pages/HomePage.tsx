import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import { roundToDecimal, useSmallScreen } from '../utils/utils';
import wiredCube from '../assets/components/Homepage/wired-cube.svg';
import topLight from '../assets/components/Homepage/light-top.svg';
import bottomLight from '../assets/components/Homepage/light-bottom.svg';
import robot from '../assets/icons/illustrations/robot.svg';
import Link from '../components/Link';
import { USE_POOLS, Pool, usePoolStats } from '../utils/pools';

const SELECTED_POOL = USE_POOLS.find((p) => p.name.includes('Dreamcatcher'));

const useStyles = makeStyles({
  root: {
    backgroundColor: '#121838',
    background:
      'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)',
    transform: 'transform: matrix(-1, 0, 0, 1, 0, 0)',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cube: {
    position: 'absolute',
    zIndex: 2,
    mixBlendMode: 'hard-light',
  },
  topLight: {
    position: 'absolute',
    filter: 'blur(30px)',
    left: 250,
    top: 50,
    transform: 'matrix(-1, 0, 0, 1, 0, 0)',
  },
  bottomLight: {
    filter: 'blur(30px)',
    mixBlendMode: 'normal',
    position: 'absolute',
    bottom: -430,
    left: -190,
  },
  bannerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
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
  strategyCard: {
    paddingLeft: 50,
    paddingRight: 50,
    position: 'absolute',
    width: 1016,
    height: 296,
    background:
      'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 2,
  },
  strategyCardTitle: {
    color: '#7C7CFF',
    fontSize: 26,
    fontWeight: 600,
    lineHeight: '110%',
    marginBottom: 15,
  },
  strategyCardText: {
    fontSize: 18,
    fontWeight: 400,
    lineHeight: '115%',
    color: '#FFFFFF',
  },
  exloreStrategiesButton: {
    zIndex: 2,
    background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    borderRadius: 40,
    margin: 2,
    width: 236,
    height: 52,
    color: '#77E3EF',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exloreStrategiesButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)',
    borderRadius: 28,
    width: 240,
    height: 56,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  exloreStrategiesButtonText: {
    color: '#77E3EF',
    fontSize: 18,
  },
  h2: {
    color: '#FFFFFF',
    textShadow:
      '0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)',
    fontSize: 42,
    margin: 10,
    fontWeight: 600,
    lineHeight: '107%',
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: '115%',
    fontWeight: 400,
  },
  cardContainer: {
    background: 'linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)',
    borderRadius: 16,
    display: 'flex',
    justifyContent: 'center',
    width: 400,
    height: 305,
    '&:hover': {
      background: 'linear-gradient(135deg, #37BCBD 0%, #B846B2 100%)',
    },
  },
  card: {
    padding: 25,
    borderRadius: 16,
    height: 303,
    width: 398,
    margin: 1,
    background:
      'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)',
    '&:hover': {
      boxShadow:
        '0px 4px 36px -7px rgba(255, 255, 255, 0.03), 0px -1px 81px 17px rgba(255, 255, 255, 0.05)',
    },
  },
  cardTitle: {
    color: '#C0A9C7',
    fontSize: 26,
    fontWeight: 600,
    lineHeight: '110%',
  },
  cardDescription: {
    color: '#FFFFFF',
    fontWeight: 18,
    lineHeight: '115%',
    marginTop: 30,
  },
  buttonContainer: {
    background: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    borderRadius: 28,
    width: 276,
    height: 56,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    margin: 1,
    borderRadius: 28,
    width: 274,
    height: 54,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      background:
        'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    },
  },
  coloredText: {
    fontSize: 18,
    fontWeight: 400,
    backgroundImage: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    backgroundClip: 'text',
    color: '#60C0CB',
    '-webkit-background-clip': 'text',
    '-moz-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    '-moz-text-fill-color': 'transparent',
  },
  subTitle: {
    textTransform: 'uppercase',
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: '110%',
    marginLeft: 15,
  },
  infoColLabel: {
    color: '#9BA3B5',
    fontSize: 14,
    fontWeight: 800,
    lineHeight: '115%',
  },
  infoColValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 600,
    lineHeight: '110%',
  },
});

const WiredCube = () => {
  const classes = useStyles();
  return (
    <div style={{ position: 'relative' }}>
      <img className={classes.cube} src={wiredCube} alt="" />
      <img className={classes.topLight} src={topLight} alt="" />
    </div>
  );
};

const Banner = () => {
  const classes = useStyles();
  return (
    <>
      <div style={{ position: 'relative', height: 500 }}>
        <div style={{ position: 'absolute', zIndex: 3, marginTop: '10%' }}>
          <Typography className={classes.subTitle}>
            On-chain trading strategies
          </Typography>
          <Typography
            className={classes.h1}
            variant="h1"
            style={{ maxWidth: 600 }}
          >
            Defi trading on autopilot
          </Typography>
          <div style={{ marginTop: '10%' }}>
            <ExploreButton />
          </div>
        </div>
        <div style={{ position: 'absolute', top: -100 }}>
          <WiredCube />{' '}
        </div>
      </div>
    </>
  );
};

const InfoCol = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => {
  const classes = useStyles();
  return (
    <Grid
      container
      justify="flex-start"
      alignItems="flex-start"
      direction="column"
    >
      <Grid item>
        <Typography className={classes.infoColLabel}>{label}</Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.infoColValue}>{value}</Typography>
      </Grid>
    </Grid>
  );
};

const StategyStats = ({ pool }: { pool: Pool }) => {
  const poolStats = usePoolStats(pool.poolSeed);
  return (
    <>
      <Grid container justify="space-around" alignItems="center" spacing={2}>
        <Grid item>
          <InfoCol
            value={roundToDecimal(poolStats?.inceptionPerformance, 1) + '%'}
            label="Performance"
          />
        </Grid>
        <Grid item>
          <InfoCol
            value={roundToDecimal(poolStats?.tokenSupply, 1)}
            label="Pool token supply"
          />
        </Grid>
        <Grid item>
          <InfoCol
            value={'$' + roundToDecimal(poolStats?.usdValue, 1)}
            label="USD value of pool"
          />
        </Grid>
        <Grid item>
          <InfoCol
            value={'$' + roundToDecimal(poolStats?.poolTokenValue, 1)}
            label="Pool token Value"
          />
        </Grid>
        <Grid item>
          <InfoCol
            value={poolStats?.assets?.join(', ')}
            label="Tokens in the pool"
          />
        </Grid>
      </Grid>
    </>
  );
};

const StrategyCard = ({
  title,
  description,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
}) => {
  const classes = useStyles();
  const smallScreen = useSmallScreen(1180);

  if (smallScreen) {
    return (
      <>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img src={robot} alt="" />
        </div>
        <div style={{ marginLeft: '5%' }}>
          <Typography className={classes.strategyCardTitle}>{title}</Typography>
          <Typography className={classes.strategyCardText}>
            {description}
          </Typography>
          <div style={{ marginTop: 10 }}>
            <StategyStats
              // @ts-ignore
              pool={SELECTED_POOL}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ position: 'relative', height: 296, width: 1016 }}>
        <div className={classes.strategyCard}>
          <div>
            <img src={robot} alt="" />
          </div>
          <div style={{ marginLeft: '5%' }}>
            <Typography className={classes.strategyCardTitle}>
              {title}
            </Typography>
            <Typography className={classes.strategyCardText}>
              {description}
            </Typography>
            <div style={{ marginTop: 10 }}>
              <StategyStats
                // @ts-ignore
                pool={SELECTED_POOL}
              />
            </div>
          </div>
        </div>
        <img src={bottomLight} className={classes.bottomLight} alt="" />
      </div>
    </>
  );
};

const ExploreButton = () => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <div
      className={classes.exloreStrategiesButtonContainer}
      onClick={() => history.push('/explore')}
    >
      <div className={classes.exloreStrategiesButton}>
        <Typography className={classes.exloreStrategiesButtonText}>
          Explore strategies
        </Typography>
      </div>
    </div>
  );
};

const StrategySection = () => {
  const classes = useStyles();
  return (
    <div
      style={{
        marginTop: '10%',
        marginBottom: '5%',
        zIndex: 2,
      }}
    >
      <Grid
        container
        justify="center"
        alignItems="center"
        spacing={5}
        direction="column"
      >
        <Grid item>
          <Typography className={classes.h2} style={{ zIndex: 2 }}>
            Profitable strategies
          </Typography>
        </Grid>
        <Grid item>
          <Typography
            align="center"
            className={classes.text}
            style={{ maxWidth: 600 }}
          >
            Choose from a wide range of unique strategies submitted by carefully
            selected crypto traders with verified track records.
          </Typography>
        </Grid>
        <Grid item>
          <StrategyCard
            title={SELECTED_POOL?.name}
            description={SELECTED_POOL?.description}
          />
        </Grid>
        <Grid item>
          <ExploreButton />
        </Grid>
      </Grid>
    </div>
  );
};

const Card = ({
  title,
  description,
  buttonText,
  buttonUrl,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  buttonText: React.ReactNode;
  buttonUrl: string;
}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.cardContainer} style={{ position: 'relative' }}>
        <div className={classes.card} style={{ position: 'absolute' }}>
          <Typography className={classes.cardTitle}>{title}</Typography>
          <Typography className={classes.cardDescription}>
            {description}
          </Typography>
        </div>
        <div style={{ position: 'absolute', bottom: 30 }}>
          <Link
            external={buttonUrl.includes('https')}
            style={{ textDecoration: 'none' }}
            to={buttonUrl}
          >
            <div className={classes.buttonContainer}>
              <div className={classes.button}>
                <Typography className={classes.coloredText}>
                  {buttonText}
                </Typography>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

const CARDS = [
  {
    title: <>I’m new here, and I’d like to follow strategies</>,
    description: (
      <>
        I’m here for the ride and I’m interested in following some strategies
        that others have created.
      </>
    ),
    buttonText: 'Find a strategy to follow',
    buttonUrl: '/explore',
  },
  {
    title: <>I’m a signal provider and I want to create strategies</>,
    description: (
      <>
        I know what I’m doing, and I really want to share my wealth of knowledge
        with other investors.
      </>
    ),
    buttonText: 'Create a strategy',
    buttonUrl: '/my-pools',
  },
];

const SomethingSection = () => {
  const classes = useStyles();
  const smallScreen = useSmallScreen(1180);

  return (
    <div style={{ position: 'relative', zIndex: 3, marginTop: '5%' }}>
      <Grid
        container
        justify="flex-start"
        alignItems="center"
        spacing={5}
        direction={smallScreen ? 'column' : 'row'}
      >
        <Grid item>
          <div style={{ maxWidth: 288 }}>
            <Typography className={classes.h2}>
              Something for everyone
            </Typography>
            <Typography align="left" className={classes.text}>
              Whether you’re a beginner to defi, or a seasoned investor that
              eats TA for breakfast, there’s an option available for you.
            </Typography>
          </div>
        </Grid>
        {CARDS.map((c, i) => {
          return (
            <Grid item key={i}>
              <Card
                title={c.title}
                description={c.description}
                buttonText={c.buttonText}
                buttonUrl={c.buttonUrl}
              />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

const HomePage = () => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.root}>
        <div>
          <Banner />
          <SomethingSection />
          <StrategySection />
        </div>
      </div>
    </>
  );
};

export default HomePage;
