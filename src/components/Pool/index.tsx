import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Pool } from '../../utils/pools';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { ExplorerLink } from '../Link';
import getCoinIcon from '../../utils/icons';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import clsx from 'clsx';
import CustomButton from '../CustomButton';
import { Coin, Market } from '../../utils/pools';
import { TabPanel } from '../../utils/tabs';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex: 1,
    },
    img: {
      height: '30vh',
    },
    card: {
      background: '#f0e9e7',
      border: 'solid 1px',
      borderRadius: '12px',
      padding: 40,
      margin: 40,
    },
    text: {
      color: '#838383',
      fontWeight: 500,
      textDecoration: 'none',
      fontSize: 30,
    },
    cardContent: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(1),
    },
    textField: {
      width: '100px',
    },
    descriptionContainer: {
      maxWidth: 400,
    },
    depositButton: {
      color: 'white',
      background: '#51d07b',
      width: 'auto',
      borderRadius: '8px',
      height: '50px',
      '&:hover': {
        background: 'white',
        color: '#51d07b',
      },
    },
  }),
);

const CoinMarketRow = ({ coin, market }: { coin?: Coin; market?: Market }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="center"
      spacing={5}
    >
      <Grid item>
        <img
          src={getCoinIcon(coin ? coin?.name : market?.name.split('/')[0])}
          height="50px"
        />
      </Grid>
      <Grid item>
        <ExplorerLink
          address={coin ? coin.mint.toBase58() : market?.address.toBase58()}
          // @ts-ignore
          style={{ textDecoration: 'none' }}
        >
          <Typography className={classes.text}>
            {coin ? coin.name : market?.name}
          </Typography>
        </ExplorerLink>
      </Grid>
    </Grid>
  );
};

const PoolAction = ({ pool }: { pool: Pool }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Card className={classes.card} variant="outlined" elevation={0}>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="deposit-withdraw-tabs"
        centered
      >
        <Tab label="Deposit" />
        <Tab label="withdraw" />
      </Tabs>
      <TabPanel value={value} index={0}>
        {pool.depositCoins.map((coin) => {
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
                  <CoinMarketRow coin={coin} />
                </Grid>
                <Grid item>
                  <FormControl
                    className={clsx(classes.margin, classes.textField)}
                    variant="outlined"
                  >
                    <OutlinedInput
                      id="outlined-adornment-weight"
                      value={0}
                      onChange={(e) => {
                        console.log(e.target.value);
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          {coin.name}
                        </InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': `${coin.name}`,
                      }}
                      labelWidth={0}
                      style={{ borderRadius: 15 }}
                    />
                  </FormControl>
                </Grid>
                <Grid item>
                  <CustomButton
                    onClick={() => console.log('Depositing')}
                    className={classes.depositButton}
                  >
                    Deposit
                  </CustomButton>
                </Grid>
              </Grid>
            </>
          );
        })}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {pool.depositCoins.map((coin) => {
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
                  <CoinMarketRow coin={coin} />
                </Grid>
                <Grid item>
                  <FormControl
                    className={clsx(classes.margin, classes.textField)}
                    variant="outlined"
                  >
                    <OutlinedInput
                      id="outlined-adornment-weight"
                      value={0}
                      onChange={(e) => {
                        console.log(e.target.value);
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          {coin.name}
                        </InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': `${coin.name}`,
                      }}
                      labelWidth={0}
                      style={{ borderRadius: 15 }}
                    />
                  </FormControl>
                </Grid>
                <Grid item>
                  <CustomButton onClick={() => console.log('Depositing')}>
                    Withdraw
                  </CustomButton>
                </Grid>
              </Grid>
            </>
          );
        })}
      </TabPanel>
    </Card>
  );
};

const PoolBasketData = ({ pool }: { pool: Pool }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Card className={classes.card} variant="outlined" elevation={0}>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="deposit-withdraw-tabs"
        centered
      >
        <Tab label="Pool Basket" />
        <Tab label="Pool Markets" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Typography>The pool is made of</Typography>
        {pool.basket.map((c) => (
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={5}
          >
            <Grid item>
              <CoinMarketRow coin={c} />
            </Grid>
            <Grid item>
              <Typography className={classes.text}>1</Typography>
            </Grid>
          </Grid>
        ))}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography>The pool trades on the following Serum markets</Typography>
        {pool.serumMarkets.map((m) => (
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={5}
          >
            <Grid item>
              <CoinMarketRow market={m} />
            </Grid>
          </Grid>
        ))}
      </TabPanel>
    </Card>
  );
};

const PoolDescription = ({ pool }: { pool: Pool }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="center"
      className={classes.card}
    >
      <Grid item>
        <img src={pool.illustration} className={classes.img} />
      </Grid>
      <Grid item className={classes.descriptionContainer}>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores
          aspernatur cum quod sunt dignissimos, fugiat repellendus esse minus
          vitae ipsam totam commodi rerum veritatis. Ipsam fugiat iste ex
          corporis nihil.
        </Typography>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores
          aspernatur cum quod sunt dignissimos, fugiat repellendus esse minus
          vitae ipsam totam commodi rerum veritatis. Ipsam fugiat iste ex
          corporis nihil.
        </Typography>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores
          aspernatur cum quod sunt dignissimos, fugiat repellendus esse minus
          vitae ipsam totam commodi rerum veritatis. Ipsam fugiat iste ex
          corporis nihil.
        </Typography>
      </Grid>
    </Grid>
  );
};

export const PoolPanel = ({ pool }: { pool: Pool }) => {
  return (
    <>
      <Grid container direction="row" justify="flex-start" alignItems="center">
        <Typography variant="h1">{pool.name}</Typography>
      </Grid>
      <Grid
        container
        direction="row"
        justify="space-around"
        alignItems="center"
      >
        <Grid>
          <PoolDescription pool={pool} />
        </Grid>
        <Grid>
          <PoolBasketData pool={pool} />
        </Grid>
      </Grid>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid>
          <PoolAction pool={pool} />
        </Grid>
      </Grid>
    </>
  );
};
