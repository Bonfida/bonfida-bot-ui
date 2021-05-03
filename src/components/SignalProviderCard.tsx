import React, { useState, useMemo } from 'react';
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
import TextField from '@material-ui/core/TextField';
import MarketInput from './MarketInput';
import { USE_MARKETS, getReferreKey } from '../utils/markets';
import { Market } from '@project-serum/serum';
import { getDecimalCount, roundToDecimal, formatSeconds } from '../utils/utils';
import {
  useTokenAccounts,
  useBalanceForMint,
  tokenNameFromMint,
  tokenMintFromName,
} from '../utils/tokens';
import InformationRow from './InformationRow';
import {
  usePoolBalance,
  usePoolInfo,
  usePoolUsdBalance,
  usePoolName,
} from '../utils/pools';
import { marketNameFromAddress } from '../utils/markets';
import {
  marketAssetsFromAddress,
  useExpectedSlippage,
  useMarketPrice,
} from '../utils/markets';
import { nanoid } from 'nanoid';
import Trans from './Translation';
import { useTranslation } from 'react-i18next';

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

const CollectFeesButton = ({ poolSeed }: { poolSeed: string }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const connection = useConnection();
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));

  // Format feePeriod in hh:mm:
  const feePeriod = useMemo(() => {
    return formatSeconds(poolInfo?.feePeriod.toNumber() || 0);
  }, [poolInfo]);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const instructions = await collectFees(connection, [
        new PublicKey(poolSeed).toBuffer(),
      ]);
      const tx = new Transaction();
      const signers: Account[] = [];

      tx.add(...instructions);

      await sendTransaction({
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
          <InformationRow label={t('Fee Period')} value={feePeriod} />
          <InformationRow
            label={t('Fee Ratio')}
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
        {loading ? <Spin size={20} /> : t('Collect Fees')}
      </CustomButton>
    </Grid>
  );
};

const TradePanel = ({ poolSeed }: { poolSeed: string }) => {
  const { t } = useTranslation();
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

  const [poolBalance, poolBalanceLoaded] = usePoolBalance(
    new PublicKey(poolSeed),
  );

  let [base, quote] = useMemo(
    () =>
      marketAssetsFromAddress(
        marketAddress && marketAddress?.length > 0 ? marketAddress[0] : null,
      ),
    [marketAddress],
  );

  const poolBalanceQuote = useMemo(() => {
    return (
      (poolBalance &&
        poolBalance[1].find((e) => e.mint === tokenMintFromName(quote || ''))
          ?.tokenAmount.uiAmount) ||
      0
    );
  }, [poolBalanceLoaded]);

  const poolBalanceBase = useMemo(() => {
    return (
      (poolBalance &&
        poolBalance[1].find((e) => e.mint === tokenMintFromName(base || ''))
          ?.tokenAmount.uiAmount) ||
      0
    );
  }, [poolBalanceLoaded]);

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

  useMemo(() => {
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

      for (let acc of openOrdersAccounts) {
        if (!acc.quoteTokenFree.toNumber() && !acc.baseTokenFree.toNumber()) {
          continue;
        }

        const instructions = await settleFunds(
          connection,
          new PublicKey(poolSeed).toBuffer(),
          new PublicKey(marketAddress[0]),
          acc.address,
          getReferreKey(market),
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
    let parsedSize = parseFloat(size || '');
    if (parsedSize === 100) {
      parsedSize = 99;
    }
    const parsedPrice = parseFloat(price || '');

    const sizeDecimalCount =
      market?.minOrderSize && getDecimalCount(market.minOrderSize);
    const priceDecimalCount =
      market?.tickSize && getDecimalCount(market.tickSize);

    const side = tab === 0 ? OrderSide.Bid : OrderSide.Ask;

    if (!marketAddress || !marketAddress[0]) {
      notify({
        message: 'Please select a market',
        variant: 'error',
      });
      return;
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
        new Numberu64(
          market
            .priceNumberToLots(roundToDecimal(parsedPrice, priceDecimalCount))
            .toNumber(),
        ),
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

      // Settle funds
      notify({
        message: 'Now trying to settle funds...',
      });
      const settleInstructions = await settleFunds(
        connection,
        new PublicKey(poolSeed).toBuffer(),
        new PublicKey(marketAddress[0]),
        openOrderAccount.publicKey,
        getReferreKey(market),
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
        <Typography variant="body1">
          <Trans>Tokens in the pool</Trans>
        </Typography>
      )}
      {poolBalance &&
        poolBalance[1]?.map((asset) => {
          return (
            <div style={{ marginLeft: 10 }} key={nanoid()}>
              <InformationRow
                // Abbrev raw mint
                label={'- ' + tokenNameFromMint(asset.mint) || asset.mint}
                value={asset.tokenAmount.uiAmount}
              />
            </div>
          );
        })}
      {marketPrice && (
        <InformationRow
          label={t('Current Market Price')}
          value={roundToDecimal(marketPrice, 3)}
        />
      )}
      <Grid container direction="column" justify="center" alignItems="center">
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          centered
        >
          <Tab label={t('Buy')} />
          <Tab label={t('Sell')} />
        </Tabs>
        <TextField
          InputProps={{
            classes: {
              input: classes.input,
            },
          }}
          className={classes.textField}
          label={t('Order Size (%)')}
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
          label={t('Limit price')}
          value={price}
          onChange={onChangePrice}
        />
      </Grid>

      <InformationRow
        label={t('Expected slippage')}
        value={roundToDecimal((slippage || 0) * 100, 3)}
      />
      <InformationRow
        label={t('Size in tokens')}
        value={roundToDecimal(
          ((tab === 0 ? poolBalanceQuote : poolBalanceBase) *
            parseFloat(size ? size : '0')) /
            100,
          3,
        )}
      />
      <InformationRow label={t('Size in % of the pool')} value={size} />

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
            {loading ? <Spin size={20} /> : t('Place Order')}
          </CustomButton>
        </Grid>
        <Grid item>
          <CustomButton onClick={onSubmitSettle}>
            <Trans>Settle funds</Trans>
          </CustomButton>
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
        <img src={robot} style={{ height: 70 }} alt="" />
      </Grid>
      <Grid item>
        <Typography variant="h1" className={classes.poolTitle}>
          <Trans>{poolName}</Trans>
        </Typography>
      </Grid>
    </Grid>
  );
};

const PoolInformation = ({ poolSeed }: { poolSeed: PublicKey }) => {
  const { t } = useTranslation();
  const [tokenAccounts] = useTokenAccounts();
  const [poolBalance] = usePoolBalance(poolSeed);
  const [poolInfo] = usePoolInfo(poolSeed);

  const userPoolTokenBalance = useBalanceForMint(
    tokenAccounts,
    poolInfo?.mintKey.toBase58(),
  );

  const poolMarkets = poolInfo?.authorizedMarkets;

  let usdValue = usePoolUsdBalance(poolBalance ? poolBalance[1] : null);

  return (
    <>
      <InformationRow
        label={t('Pool Address')}
        value={poolInfo?.address.toBase58()}
        isExplorerLink
      />
      <InformationRow
        label={t('Pool Token Mint')}
        value={poolInfo?.mintKey.toBase58()}
        isExplorerLink
      />
      <InformationRow
        label={t('Pool Token Supply')}
        value={poolBalance ? poolBalance[0]?.uiAmount : 0}
      />
      <InformationRow
        label={t('USD Value of the Pool')}
        value={`$${roundToDecimal(usdValue, 2)}`}
      />
      <Typography variant="body1">
        <Trans>Tokens in the pool</Trans>
      </Typography>
      {poolBalance &&
        poolBalance[1]?.map((asset) => {
          return (
            <div style={{ marginLeft: 10 }} key={nanoid()}>
              <InformationRow
                // Abbrev raw mint
                label={'- ' + tokenNameFromMint(asset.mint) || asset.mint}
                value={asset.tokenAmount.uiAmount}
              />
            </div>
          );
        })}
      <Typography variant="body1" style={{ marginBottom: 10, marginTop: 10 }}>
        <Trans>The pool can only trade on the following markets:</Trans>
      </Typography>
      <div style={{ margin: 10 }}>
        {poolMarkets?.map((m) => {
          return (
            <InformationRow
              key={nanoid()}
              label={marketNameFromAddress(m)}
              value={m.toBase58()}
              isExplorerLink
            />
          );
        })}
      </div>
      <InformationRow
        label={t('Your Share of the Pool')}
        value={
          poolBalance && poolBalance[0]?.uiAmount
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
  const [poolInfo, poolInfoLoaded] = usePoolInfo(new PublicKey(poolSeed));
  const { connected, wallet } = useWallet();
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const poolName = usePoolName(poolSeed);

  const isOwner = useMemo(
    () =>
      wallet?.publicKey?.toBase58() === poolInfo?.signalProvider?.toBase58(),
    [connected, poolInfoLoaded],
  );

  if (!connected) {
    return (
      <Grid container alignItems="center" justify="center" direction="row">
        <WalletConnect />
      </Grid>
    );
  }
  if (!isOwner) {
    return (
      <FloatingCard>
        <div className={classes.cardContainer}>
          <Trans>You do not own this pool</Trans>
          <Emoji emoji="🤖" />
        </div>
      </FloatingCard>
    );
  }
  return (
    <>
      <FloatingCard>
        <div className={classes.cardContainer}>
          <PoolTitle poolName={poolName} />
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
              <Trans>Collect your fees</Trans>
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
