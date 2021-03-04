import React, { useState, useEffect } from 'react';
import { usePoolInfo } from '../utils/pools';
import { PublicKey, Transaction, Account } from '@solana/web3.js';
import { useWallet } from '../utils/wallet';
import Grid from '@material-ui/core/Grid';
import WalletConnect from './WalletConnect';
import FloatingCard from './FloatingCard';
import Emoji from './Emoji';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useConnection } from '../utils/connection';
import CustomButton from './CustomButton';
import {
  collectFees,
  BONFIDABOT_PROGRAM_ID,
  SERUM_PROGRAM_ID,
  OrderSide,
  createOrder,
  Numberu64,
  Numberu16,
  OrderType,
  SelfTradeBehavior,
} from 'bonfida-bot';
import { notify } from '../utils/notifications';
import Spin from './Spin';
import { sendTransaction } from '../utils/send';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from './TabPanel';
import robot from '../assets/icons/illustrations/robot-top-bar.svg';
import Typography from '@material-ui/core/Typography';
import { USE_POOLS } from '../utils/pools';
import TextField from '@material-ui/core/TextField';
import MarketInput from './MarketInput';
import { USE_MARKETS } from '../utils/markets';
import { Market } from '@project-serum/serum';
import { getDecimalCount, roundToDecimal } from '../utils/utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardContainer: {
      width: 500,
    },
    poolTitle: {
      fontSize: 30,
    },
    input: {
      fontSize: 20,
    },
    textField: {
      width: 300,
      margin: 10,
    },
  }),
);

// Order, collect fees

const CollectFeesButton = ({ poolSeed }: { poolSeed: string }) => {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const onSubmit = async () => {
    try {
      setLoading(true);

      const instructions = await collectFees(
        connection,
        BONFIDABOT_PROGRAM_ID,
        [new PublicKey(poolSeed).toBuffer()],
      );
      const tx = new Transaction();
      const signers: Account[] = [];

      tx.add(...instructions);

      const result = await sendTransaction({
        transaction: tx,
        wallet,
        connection,
        signers,
        sendingMessage: 'Collecting Fees...',
      });
      notify({
        message: 'Fees Collected!',
        variant: 'success',
      });
    } catch (err) {
      console.warn(`Error collecting fees ${err}`);
      notify({
        message: `Error collecting fees ${err}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <CustomButton onClick={onSubmit}>
        {loading ? <Spin size={20} /> : 'Collect Fees'}
      </CustomButton>
    </Grid>
  );
};

const TradePanel = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const connection = useConnection();
  const { wallet } = useWallet();
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  const [poolInfo, poolInfoLoaded] = usePoolInfo(new PublicKey(poolSeed));
  const markets = poolInfo?.authorizedMarkets?.map((e) => e.toBase58());
  const [marketAddress, setMarketAddress] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [size, setSize] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);

  console.log('poolInfo', poolInfo?.authorizedMarkets[0].toBase58());
  console.log('markets[0]', markets ? markets[0] : 'wait');
  console.log(
    USE_MARKETS.filter((e) => e.name === 'FIDA/USDT')[0]?.address.toBase58(),
  );
  useEffect(() => {
    if (markets) {
      setMarketAddress([markets[0]]);
    }
  }, [poolInfoLoaded]);
  // Side, size, market, price
  // Disclaimer it's IOC

  const onChangeSize = (e) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed) || parsed < 0) {
      setSize('');
      return;
    }
    setSize(e.target.value);
  };
  const onChangePrice = (e) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed) || parsed < 0) {
      setPrice('');
      return;
    }
    setPrice(e.target.value);
  };

  const onSubmit = async () => {
    if (!marketAddress || !marketAddress[0]) {
      notify({
        message: 'Invalid market',
        variant: 'error',
      });
      return;
    }
    console.log('marketAddress[0]', marketAddress[0]);
    const market = await Market.load(
      connection,
      new PublicKey(marketAddress[0]),
      {},
      SERUM_PROGRAM_ID,
    );
    const parsedSize = parseFloat(size || '');
    const parsedPrice = parseFloat(price || '');

    let sizeDecimalCount =
      market?.minOrderSize && getDecimalCount(market.minOrderSize);
    let priceDecimalCount =
      market?.tickSize && getDecimalCount(market.tickSize);

    if (
      !size ||
      !price ||
      isNaN(parsedPrice) ||
      isNaN(parsedSize) ||
      parsedSize < 0 ||
      parsedPrice < 0
    ) {
      notify({
        message: 'Invalid price or size',
        variant: 'error',
      });
      return;
    }
    if (!marketAddress) {
      notify({
        message: 'Invalid market address',
        variant: 'error',
      });
      return;
    }
    try {
      setLoading(true);
      const [openOrderAccount, instructions] = await createOrder(
        connection,
        BONFIDABOT_PROGRAM_ID,
        SERUM_PROGRAM_ID,
        new PublicKey(poolSeed).toBuffer(),
        new PublicKey(marketAddress[0]),
        tab === 0 ? OrderSide.Bid : OrderSide.Ask,
        new Numberu64(roundToDecimal(parsedPrice, priceDecimalCount)),
        new Numberu16(roundToDecimal(parsedSize, sizeDecimalCount)),
        OrderType.ImmediateOrCancel,
        new Numberu64(0),
        SelfTradeBehavior.DecrementTake,
        null,
        wallet.publicKey,
      );

      const tx = new Transaction();
      const signers: Account[] = [openOrderAccount];

      tx.add(...instructions);

      const result = await sendTransaction({
        transaction: tx,
        wallet,
        connection,
        signers,
        sendingMessage: `Placing Order...`,
      });
      notify({
        message: 'Order placed',
        variant: 'success',
      });
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error placing order ${err}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!marketAddress) {
    return <Spin size={40} />;
  }
  return (
    <>
      <Grid container direction="column" justify="center" alignItems="center">
        <MarketInput
          marketAddresses={marketAddress}
          setMarketAddresses={setMarketAddress}
          marketsList={USE_MARKETS.filter((e) =>
            markets?.includes(e.address.toBase58()),
          )}
        />
      </Grid>
      <Grid container direction="column" justify="center" alignItems="center">
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          centered
        >
          <Tab label="Buy" />
          <Tab label="Sell" />
        </Tabs>
        <TextField
          InputProps={{
            classes: {
              input: classes.input,
            },
          }}
          className={classes.textField}
          label="Order Size"
          value={size}
          onChange={onChangeSize}
        />
        <TextField
          InputProps={{
            classes: {
              input: classes.input,
            },
          }}
          className={classes.textField}
          label="Limit price"
          value={price}
          onChange={onChangePrice}
        />
      </Grid>
      <Grid container direction="column" justify="center" alignItems="center">
        <CustomButton onClick={onSubmit}>
          {loading ? <Spin size={20} /> : 'Place Order'}
        </CustomButton>
      </Grid>
    </>
  );
};

const PoolTitle = ({ poolName }: { poolName: string }) => {
  const classes = useStyles(0);
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <img src={robot} style={{ height: 70 }} />
      </Grid>
      <Grid item>
        <Typography variant="h1" className={classes.poolTitle}>
          {poolName}
        </Typography>
      </Grid>
    </Grid>
  );
};

const SignalProviderCard = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const { connected, wallet } = useWallet();

  const pool = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);

  if (!connected) {
    return (
      <Grid container alignItems="center" justify="center" direction="row">
        <WalletConnect />
      </Grid>
    );
  }
  if (wallet?.publicKey.toBase58() !== poolInfo?.signalProvider.toBase58()) {
    return (
      <FloatingCard>
        <div className={classes.cardContainer}>
          You do not own this pool <Emoji emoji="🤖" />
        </div>
      </FloatingCard>
    );
  }
  return (
    <>
      <FloatingCard>
        <div className={classes.cardContainer}>
          <PoolTitle poolName={pool?.name || 'Unknown Pool'} />

          <TradePanel poolSeed={poolSeed} />
          <div style={{ marginBottom: 40 }} />
          <CollectFeesButton poolSeed={poolSeed} />
        </div>
      </FloatingCard>
    </>
  );
};

export default SignalProviderCard;
