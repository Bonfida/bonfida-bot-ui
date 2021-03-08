import React, { useState, useEffect } from 'react';
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
  SERUM_PROGRAM_ID,
  OrderSide,
  createOrder,
  Numberu64,
  OrderType,
  SelfTradeBehavior,
  settleFunds,
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
import { Market, TOKEN_MINTS } from '@project-serum/serum';
import {
  getDecimalCount,
  roundToDecimal,
  abbreviateAddress,
  formatSeconds,
} from '../utils/utils';
import {
  useTokenAccounts,
  useBalanceForMint,
  tokenNameFromMint,
  tokenMintFromName,
} from '../utils/tokens';
import InformationRow from './InformationRow';
import { ExplorerLink } from './Link';
import { usePoolBalance, usePoolInfo, usePoolUsdBalance } from '../utils/pools';
import { marketNameFromAddress } from '../utils/markets';
import {
  marketAssetsFromAddress,
  useExpectedSlippage,
  useMarketPrice,
} from '../utils/markets';

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
    tradeButtonContainer: {
      marginTop: 20,
    },
    feesButtonContainer: {
      marginTop: 20,
    },
  }),
);

// Order, collect fees

const CollectFeesButton = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const connection = useConnection();
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));

  // Format feePeriod in hh:mm:
  const feePeriod = formatSeconds(poolInfo?.feePeriod.toNumber() || 0);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const instructions = await collectFees(connection, [
        new PublicKey(poolSeed).toBuffer(),
      ]);
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
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      className={classes.feesButtonContainer}
    >
      {poolInfo && (
        <>
          <InformationRow label="Fee Period" value={feePeriod} />
          <InformationRow
            label="Fee Ratio"
            value={
              roundToDecimal(
                (poolInfo?.feeRatio.toNumber() * 100) / Math.pow(2, 16),
                3,
              ).toString() + ' %'
            }
          />
        </>
      )}
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

  const [poolBalance] = usePoolBalance(new PublicKey(poolSeed));

  let [base, quote] = marketAssetsFromAddress(
    marketAddress && marketAddress?.length > 0 ? marketAddress[0] : null,
  );
  const poolBalanceQuote =
    (poolBalance &&
      poolBalance[1].find((e) => e.mint === tokenMintFromName(quote || ''))
        ?.tokenAmount.uiAmount) ||
    0;
  const poolBalanceBase =
    (poolBalance &&
      poolBalance[1].find((e) => e.mint === tokenMintFromName(base || ''))
        ?.tokenAmount.uiAmount) ||
    0;

  const [slippage] = useExpectedSlippage(
    marketAddress && marketAddress?.length > 0 ? marketAddress[0] : null,
    ((tab === 0 ? poolBalanceQuote : poolBalanceBase) *
      parseFloat(size ? size : '0')) /
      100,
    tab === 0 ? 'buy' : 'sell',
  );
  const [marketPrice] = useMarketPrice(
    marketAddress && marketAddress?.length > 0 ? marketAddress[0] : null,
  );

  useEffect(() => {
    if (markets) {
      setMarketAddress([markets[0]]);
    }
  }, [poolInfoLoaded]);

  const onChangeSize = (e) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed) || parsed < 0) {
      setSize('');
      return;
    }
    if (parsed > 100) {
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

  const onSubmitSettle = async () => {
    if (!marketAddress || !marketAddress[0] || !poolInfo?.address) {
      notify({
        message: 'Nothing to settle',
        variant: 'error',
      });
      return;
    }
    try {
      notify({
        message: 'Settling funds',
      });

      const market = await Market.load(
        connection,
        new PublicKey(marketAddress[0]),
        {},
        SERUM_PROGRAM_ID,
      );

      const openOrdersAccounts = await market.findOpenOrdersAccountsForOwner(
        connection,
        poolInfo?.address,
      );

      let referrerQuoteWallet: PublicKey | null = null;
      const usdc = TOKEN_MINTS.find(({ name }) => name === 'USDC');
      const usdt = TOKEN_MINTS.find(({ name }) => name === 'USDT');

      if (market.supportsReferralFees) {
        if (
          process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS &&
          usdt &&
          market.quoteMintAddress.equals(usdt?.address)
        ) {
          referrerQuoteWallet = new PublicKey(
            process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS,
          );
        }
        if (
          process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS &&
          usdc &&
          market.quoteMintAddress.equals(usdc?.address)
        ) {
          referrerQuoteWallet = new PublicKey(
            process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS,
          );
        }
      }

      for (let acc of openOrdersAccounts) {
        const instructions = await settleFunds(
          connection,
          new PublicKey(poolSeed).toBuffer(),
          new PublicKey(marketAddress[0]),
          acc.address,
          referrerQuoteWallet,
        );
        const tx = new Transaction();
        const signers: Account[] = [];
        tx.add(...instructions);

        await sendTransaction({
          transaction: tx,
          wallet,
          connection,
          signers,
          sendingMessage: `Settling funds...`,
        });
      }

      notify({
        message: 'Funds settled',
        variant: 'success',
      });
    } catch (err) {
      console.warn(`Error settling funds ${err}`);
      notify({
        message: 'Error settling funds',
        variant: 'error',
      });
    }
  };

  const onSubmit = async () => {
    if (!marketAddress || !marketAddress[0]) {
      notify({
        message: 'Invalid market',
        variant: 'error',
      });
      return;
    }
    const market = await Market.load(
      connection,
      new PublicKey(marketAddress[0]),
      {},
      SERUM_PROGRAM_ID,
    );
    const parsedSize = parseFloat(size || '');
    const parsedPrice = parseFloat(price || '');

    const sizeDecimalCount =
      market?.minOrderSize && getDecimalCount(market.minOrderSize);
    const priceDecimalCount =
      market?.tickSize && getDecimalCount(market.tickSize);
    const side = tab === 0 ? OrderSide.Bid : OrderSide.Ask;

    let referrerQuoteWallet: PublicKey | null = null;
    const usdc = TOKEN_MINTS.find(({ name }) => name === 'USDC');
    const usdt = TOKEN_MINTS.find(({ name }) => name === 'USDT');

    if (market.supportsReferralFees) {
      if (
        process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS &&
        usdt &&
        market.quoteMintAddress.equals(usdt?.address)
      ) {
        referrerQuoteWallet = new PublicKey(
          process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS,
        );
      }
      if (
        process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS &&
        usdc &&
        market.quoteMintAddress.equals(usdc?.address)
      ) {
        referrerQuoteWallet = new PublicKey(
          process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS,
        );
      }
    }

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
        new PublicKey(poolSeed).toBuffer(),
        new PublicKey(marketAddress[0]),
        side,
        new Numberu64(roundToDecimal(parsedPrice, priceDecimalCount)),
        roundToDecimal(parsedSize, sizeDecimalCount),
        OrderType.ImmediateOrCancel,
        new Numberu64(0),
        SelfTradeBehavior.DecrementTake,
        null,
        wallet.publicKey,
      );

      const tx = new Transaction();
      const signers: Account[] = [openOrderAccount];

      tx.add(...instructions);

      await sendTransaction({
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
      notify({
        message: 'Settling funds...',
      });
      // Settle funds
      const settleInstructions = await settleFunds(
        connection,
        new PublicKey(poolSeed).toBuffer(),
        new PublicKey(marketAddress[0]),
        openOrderAccount.publicKey,
        referrerQuoteWallet,
      );

      const txSettle = new Transaction();
      const signersSettle: Account[] = [];

      txSettle.add(...settleInstructions);

      await sendTransaction({
        transaction: txSettle,
        wallet,
        connection,
        signers: signersSettle,
        sendingMessage: `Settling funds...`,
      });

      notify({
        message: 'Funds settled',
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
      {poolBalance && (
        <Typography variant="body1">Tokens in the pool:</Typography>
      )}
      {poolBalance &&
        poolBalance[1]?.map((asset) => {
          return (
            <div style={{ marginLeft: 10 }}>
              <InformationRow
                // Abbrev raw mint
                label={'- ' + tokenNameFromMint(asset.mint) || asset.mint}
                value={asset.tokenAmount.uiAmount}
              />
            </div>
          );
        })}
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
          label="Order Size (%)"
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

      <InformationRow
        label="Expected slippage"
        value={roundToDecimal((slippage || 0) * 100, 3)}
      />
      <InformationRow
        label="Size in tokens"
        value={roundToDecimal(
          ((tab === 0 ? poolBalanceQuote : poolBalanceBase) *
            parseFloat(size ? size : '0')) /
            100,
          3,
        )}
      />
      <InformationRow label="Size in % of the pool" value={size} />

      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        className={classes.tradeButtonContainer}
        spacing={5}
      >
        <Grid item>
          <CustomButton onClick={onSubmit}>
            {loading ? <Spin size={20} /> : 'Place Order'}
          </CustomButton>
        </Grid>
        <Grid item>
          <CustomButton onClick={onSubmitSettle}>Settle funds</CustomButton>
        </Grid>
      </Grid>
    </>
  );
};

const PoolTitle = ({ poolName }: { poolName: string | undefined }) => {
  const classes = useStyles(0);
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <img src={robot} style={{ height: 70 }} />
      </Grid>
      <Grid item>
        <Typography variant="h1" className={classes.poolTitle}>
          {poolName || 'Unknown Pool'}
        </Typography>
      </Grid>
    </Grid>
  );
};

const PoolInformation = ({ poolSeed }: { poolSeed: PublicKey }) => {
  const [tokenAccounts] = useTokenAccounts();
  const [poolBalance] = usePoolBalance(poolSeed);
  const [poolInfo] = usePoolInfo(poolSeed);
  const pool = USE_POOLS.find(
    (p) => p.poolSeed.toBase58() === poolSeed.toBase58(),
  );

  const userPoolTokenBalance = useBalanceForMint(
    tokenAccounts,
    poolInfo?.mintKey.toBase58(),
  );

  const poolMarkets = poolInfo?.authorizedMarkets;

  let usdValue = usePoolUsdBalance(poolBalance ? poolBalance[1] : null);

  return (
    <>
      <InformationRow
        label="Pool Address"
        value={
          <ExplorerLink address={poolInfo?.address.toBase58()}>
            {abbreviateAddress(poolInfo?.address, 7)}
          </ExplorerLink>
        }
      />
      <InformationRow
        label="Pool Token Mint"
        value={
          <ExplorerLink address={poolInfo?.mintKey.toBase58()}>
            {abbreviateAddress(poolInfo?.mintKey, 7)}
          </ExplorerLink>
        }
      />
      <InformationRow
        label="Pool Token Supply"
        value={poolBalance ? poolBalance[0]?.uiAmount : 0}
      />
      <InformationRow
        label="USD Value of the Pool"
        value={`$${roundToDecimal(usdValue, 2)}`}
      />
      <Typography variant="body1">Tokens in the pool:</Typography>
      {poolBalance &&
        poolBalance[1]?.map((asset) => {
          return (
            <div style={{ marginLeft: 10 }}>
              <InformationRow
                // Abbrev raw mint
                label={'- ' + tokenNameFromMint(asset.mint) || asset.mint}
                value={asset.tokenAmount.uiAmount}
              />
            </div>
          );
        })}
      <Typography variant="body1" style={{ marginBottom: 10, marginTop: 10 }}>
        The pool can only trade on the following markets:
      </Typography>
      <div style={{ margin: 10 }}>
        {poolMarkets?.map((m) => {
          return (
            <InformationRow
              label={marketNameFromAddress(m)}
              value={
                <ExplorerLink address={m.toBase58()}>
                  {abbreviateAddress(m, 7)}
                </ExplorerLink>
              }
            />
          );
        })}
      </div>
      <InformationRow
        label="Your Share of the Pool"
        value={
          poolBalance
            ? roundToDecimal(
                (100 * userPoolTokenBalance?.toLocaleString()) /
                  poolBalance[0]?.uiAmount,
                2,
              ).toString() + '%'
            : 0
        }
      />
    </>
  );
};

const SignalProviderCard = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const { connected, wallet } = useWallet();
  const pool = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

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
          <PoolTitle poolName={pool?.name} />
          <Tabs
            value={tab}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleTabChange}
            centered
          >
            <Tab label="Trade" />
            <Tab label="Fees" />
            <Tab label="Information" />
          </Tabs>
          <TabPanel index={0} value={tab}>
            <TradePanel poolSeed={poolSeed} />
          </TabPanel>
          <TabPanel index={1} value={tab}>
            <Typography align="center" variant="body1">
              Collect your fees
            </Typography>
            <CollectFeesButton poolSeed={poolSeed} />
          </TabPanel>
          <TabPanel index={2} value={tab}>
            <PoolInformation poolSeed={new PublicKey(poolSeed)} />
          </TabPanel>
        </div>
      </FloatingCard>
    </>
  );
};

export default SignalProviderCard;
