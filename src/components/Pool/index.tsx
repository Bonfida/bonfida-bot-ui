import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Pool } from '../../utils/pools';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input';
import { ExplorerLink } from '../Link';
import getCoinIcon from '../../utils/icons';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import clsx from 'clsx';
import CustomButton from '../CustomButton';
import { Coin } from '../../utils/pools';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex: 1,
    },
    img: {
      height: 200,
    },
    card: {
      background: '#f0e9e7',
      border: 'solid 1px',
      borderRadius: '12px',
      width: '500px',
      maxWidth: '512px',
      padding: 30,
      height: 700,
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
  }),
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const CoinRow = ({ coin }: { coin: Coin }) => {
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
        <img src={getCoinIcon(coin.name)} height="50px" />
      </Grid>
      <Grid item>
        <ExplorerLink
          address={coin.mint.toBase58()}
          // @ts-ignore
          style={{ textDecoration: 'none' }}
        >
          <Typography className={classes.text}>{coin.name}</Typography>
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
  let refMap = new Map<string, number>();

  pool.depositCoins.map((coin) => {
    refMap.set(coin.name, 0);
  });

  const onChange = (e, coin) => {
    refMap.set(coin.name, parseFloat(e.target.value));
  };

  const onClick = () => {
    const t = refMap.get('FIDA');
    console.log(t);
  };

  return (
    <Card className={classes.card} variant="outlined" elevation={0}>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="deposit-withdraw-tabs"
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
                  <CoinRow coin={coin} />
                </Grid>
                <Grid item>
                  <FormControl
                    className={clsx(classes.margin, classes.textField)}
                    variant="outlined"
                  >
                    <OutlinedInput
                      id="outlined-adornment-weight"
                      value={refMap.get(coin.name)}
                      onChange={(e) => {
                        onChange(e, coin.name);
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
              </Grid>
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                spacing={5}
              >
                <Grid item>
                  <CustomButton onClick={onClick}>Deposit</CustomButton>
                </Grid>
              </Grid>
            </>
          );
        })}
      </TabPanel>
      <TabPanel value={value} index={1}>
        Withdraw
      </TabPanel>
    </Card>
  );
};

const PoolBasketData = ({ pool }: { pool: Pool }) => {
  return null;
};

const PoolDescription = ({ pool }: { pool: Pool }) => {
  const classes = useStyles();
  return (
    <>
      <img src={pool.illustration} className={classes.img} />
    </>
  );
};

export const PoolPanel = ({ pool }: { pool: Pool }) => {
  return (
    <>
      <Grid container direction="row" justify="flex-start" alignItems="center">
        <Typography variant="h1">{pool.name}</Typography>
      </Grid>
      <Grid container direction="row" justify="center" alignItems="center">
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
