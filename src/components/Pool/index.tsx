import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Pool } from '../../utils/pools';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { ExplorerLink } from '../Link';
import getCoinIcon from '../../utils/icons';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import clsx from 'clsx';
import CustomButton from '../CustomButton';
import { Coin, Market } from '../../utils/pools';
import { TabPanel } from '../../utils/tabs';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import Badge from '@material-ui/core/Badge';

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
      borderRadius: 0,
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
      width: 'auto',
    },
    depositButton: {
      color: 'white',
      background: '#51d07b',
      width: 'auto',
      borderRadius: 0,
      height: '50px',
      transitionDuration: '0s',
      '&:hover': {
        color: 'white',
        background: '#51d07b',
      },
    },
    title: {
      marginTop: 50,
      marginLeft: 100,
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
          alt=""
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
        centered
      >
        <Tab label="Deposit" />
        <Tab label="withdraw" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Table aria-label="withdraw pool table">
          <TableBody>
            {pool.depositCoins.map((coin) => {
              return (
                <TableRow>
                  <TableCell scope="row">
                    <CoinMarketRow coin={coin} />
                  </TableCell>
                  <TableCell scope="row">
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
                        style={{ borderRadius: 0 }}
                      />
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <CustomButton
                      onClick={() => console.log('Depositing')}
                      className={classes.depositButton}
                    >
                      Deposit
                    </CustomButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Table aria-label="withdraw pool table">
          <TableBody>
            {pool.depositCoins.map((coin) => {
              return (
                <TableRow>
                  <TableCell scope="row">
                    <CoinMarketRow coin={coin} />
                  </TableCell>
                  <TableCell scope="row">
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
                        style={{ borderRadius: 0 }}
                      />
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <CustomButton onClick={() => console.log('Depositing')}>
                      Withdraw
                    </CustomButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
        <Table aria-label="pool markets table">
          <TableBody>
            {pool.serumMarkets.map((m) => (
              <>
                <TableRow>
                  <TableCell scope="row">
                    <Grid
                      container
                      direction="row"
                      justify="space-around"
                      alignItems="center"
                      spacing={5}
                    >
                      <Grid item>
                        <img
                          src={getCoinIcon(m.name.split('/')[0])}
                          height="40px"
                        />
                      </Grid>
                      <Grid>
                        <Typography variant="body1" className={classes.text}>
                          {m.name}
                        </Typography>
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell scope="row">
                    <CustomButton
                      onClick={() =>
                        (window.location.href = `https://bonfida.com/dex/#/market/${m.address.toBase58()}`)
                      }
                      className={classes.depositButton}
                    >
                      Trade
                    </CustomButton>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
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
      style={{ height: '800px' }}
    >
      <Grid item>
        <img src={pool.illustration} className={classes.img} alt="" />
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

const VerifiedPool = ({ isVerified }: { isVerified: boolean }) => {
  if (isVerified) {
    return (
      <Chip
        label="Verified Pool"
        color="primary"
        deleteIcon={<DoneIcon />}
        style={{ backgroundColor: '#51d07b' }}
      />
    );
  }
  return (
    <Chip
      label="Unverified Pool"
      color="primary"
      deleteIcon={<WarningIcon />}
      style={{ backgroundColor: '#BA0202' }}
    />
  );
};

export const PoolPanel = ({ pool }: { pool: Pool }) => {
  const classes = useStyles();
  const isVerified = true;
  return (
    <>
      <Grid container direction="row" justify="flex-start" alignItems="center">
        <Grid item>
          <Typography variant="h1" className={classes.title}>
            {pool.name}
          </Typography>
        </Grid>
        <Grid item>
          <VerifiedPool isVerified={isVerified} />
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        justify="space-around"
        alignItems="center"
      >
        <Grid style={{ height: '100%' }}>
          <PoolDescription pool={pool} />
        </Grid>
        <Grid>
          <PoolBasketData pool={pool} />
          <PoolAction pool={pool} />
        </Grid>
      </Grid>
    </>
  );
};
