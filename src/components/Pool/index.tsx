import React, { useState } from 'react';
import { USE_POOLS, usePoolStats } from '../../utils/pools';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {
  tokenNameFromMint,
  useTokenAccounts,
  useBalanceForMint,
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
} from '../../utils/tokens';
import { PublicKey } from '@solana/web3.js';
import {
  usePoolBalance,
  usePoolInfo,
  useHistoricalPerformance,
} from '../../utils/pools';
import { useConnection } from '../../utils/connection';
import {
  collectFees,
  deposit,
  Numberu64,
  redeem,
  settlePool,
} from '@bonfida/bot';
import {
  roundToDecimal,
  abbreviateAddress,
  useSmallScreen,
  getDecimalCount,
  findAssociatedTokenAccountAndCreate,
  BUY_AND_BURN,
  INSURANCE_FUND,
} from '../../utils/utils';
import { notify } from '../../utils/notifications';
import Spin from '../Spin';
import { marketNameFromAddress } from '../../utils/markets';
import { useWallet } from '../../utils/wallet';
import { Transaction, Account, TransactionInstruction } from '@solana/web3.js';
import { sendTransaction } from '../../utils/send';
import { TextField, Button } from '@material-ui/core';
import Graph from './Graph';
import bs58 from 'bs58';
import robot from '../../assets/icons/illustrations/robot.svg';
import '../../index.css';
import Slider from '../Slider';
import arrowDown from '../../assets/components/PoolPage/arrow-down.svg';
import { refreshAllCaches } from '../../utils/fetch-loop';
import MarketInput, { CssTextField } from '../MarketInput';
import { USE_MARKETS, getReferreKey } from '../../utils/markets';
import { Market } from '@project-serum/serum';
import {
  SERUM_PROGRAM_ID,
  OrderSide,
  createOrder,
  OrderType,
  SelfTradeBehavior,
  settleFunds,
} from '@bonfida/bot';

const useStyles = makeStyles({
  poolProfilePic: {
    height: 140,
    marginBottom: 10,
  },
  poolProfile: {
    maxWidth: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: 16,
    width: 184,
    height: 343,
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1125) 9.37%, rgba(255, 255, 255, 0.0375) 54.69%, rgba(255, 255, 255, 0.0394911) 66.15%, rgba(255, 255, 255, 0.15) 100%)',
  },
  label: {
    color: '#9BA3B5',
    fontWeight: 800,
    fontSize: 14,
    lineHeight: '115%',
  },
  poolProfileValue: {
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '115%',
  },
  poolProfileItem: {
    marginBottom: 5,
    marginTop: 5,
  },
  tabs: {
    paddingTop: 20,
    paddingLeft: 30,
  },
  depositWithdrawPanelText: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '115%',
    color: '#FFFFFF',
  },
  tabsInnerContainer: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 30,
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'space-between',
  },
  tabsInnerItem: {
    margin: 10,
  },
  poolValue: {
    fontSize: 26,
    fontWeight: 600,
    lineHeight: '110%',
    color: '#FFFFFF',
  },
  buttonContainer: {
    background: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    borderRadius: 28,
    width: 256,
    height: 56,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    margin: 1,
    borderRadius: 28,
    width: 254,
    height: 54,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
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
  gradientButton: {
    zIndex: 2,
    background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    borderRadius: 28,
    margin: 1,
    width: 254,
    height: 52,
    color: '#77E3EF',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)',
    borderRadius: 28,
    width: 256,
    height: 56,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  gradientButtonText: {
    color: '#77E3EF',
    fontSize: 18,
  },
  poolDetailsTitle: {
    color: '#7C7CFF',
    fontSize: 26,
    fontWeight: 600,
    lineHeight: '110%',
    maxWidth: 568,
  },
  poolDescription: {
    marginTop: 20,
    marginBottom: 20,
    fontWeight: 400,
    fontSize: 18,
    color: '#FFFFFF',
    maxWidth: 568,
  },
  poolDetailsButtonContainer: {
    background: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    borderRadius: 28,
    width: 168,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poolDetailsButton: {
    background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    margin: 1,
    borderRadius: 28,
    width: 166,
    height: 38,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  detailCards: {
    background:
      'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 61.99%)',
    border: '1px solid #121838',
    boxSizing: 'border-box',
    borderRadius: 8,
    padding: 20,
  },
  infoColLabel: {
    fontWeight: 400,
    fontSize: 18,
    lineHeight: '115%',
    color: '#FFFFFF',
  },
  infoColValue: {
    fontWeight: 400,
    fontSize: 18,
    lineHeight: '115%',
    color: '#77E3EF',
  },
  performanceContainer: {
    width: '100vw',
    maxWidth: 700,
    height: 295,
    marginLeft: -40,
    marginTop: 20,
  },
  graphContainer: {
    marginTop: 30,
  },
  poolBalanceRowText: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '115%',
    color: '#FFFFFF',
  },
  buyButton: {
    background: '#4EDC76',
    borderRadius: 4,
    color: '#141722',
    fontSize: 14,
    fontWeight: 800,
    width: 120,
    height: 30,
    '&:hover': {
      background: '#4EDC76',
      color: '#141722',
    },
  },
  sellButton: {
    background: '#EB5252',
    borderRadius: 4,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 800,
    width: 120,
    height: 30,
    '&:hover': {
      color: '#FFFFFF',
      background: '#EB5252',
    },
  },
  leverageSizeText: {
    fontWeight: 700,
    fontSize: 18,
    color: '#FFFFFF',
  },
});

const DepositWithdrawInput = withStyles({
  root: {
    marginBottom: 20,
    '& .MuiInputBase-input': {
      color: 'rgba(255, 255, 255, 1)',
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
})(TextField);

export const PoolGraph = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const [performance] = useHistoricalPerformance(poolSeed);
  if (!performance || performance?.length === 0) {
    return null;
  }
  return (
    <div className={classes.graphContainer}>
      <Typography className={classes.poolDetailsTitle}>
        Pool Historical Performance:
      </Typography>
      <div className={classes.performanceContainer}>
        <Graph data={performance} yKey="poolTokenUsdValue" xKey="time" />
      </div>
    </div>
  );
};

const sliderMarks = [
  {
    value: 10,
    label: '10%',
  },
  {
    value: 25,
    label: '25%',
  },
  {
    value: 50,
    label: '50%',
  },
  {
    value: 75,
    label: '75%',
  },
  {
    value: 100,
    label: '100%',
  },
];

const PoolBalanceRow = ({
  token,
  amount,
}: {
  token: React.ReactNode;
  amount: React.ReactNode;
}) => {
  const classes = useStyles();
  return (
    <Grid container justify="space-between" alignItems="center">
      <Grid item>
        <Typography className={classes.poolBalanceRowText}>{token}</Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.poolBalanceRowText}>{amount}</Typography>
      </Grid>
    </Grid>
  );
};

const PoolTradePanel = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const { wallet } = useWallet();
  const connection = useConnection();
  const [poolBalance] = usePoolBalance(new PublicKey(poolSeed));
  const [marketAddress, setMarketAddress] = useState<string[]>([]);
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const markets = poolInfo?.authorizedMarkets?.map((e) => e.toBase58());
  const [sliderValue, setSliderValue] = useState(0);
  const [price, setPrice] = useState(0);
  const smallScreen = useSmallScreen();
  const [loading, setLoading] = useState(false);

  const handleChangeSlider = (v) => {
    setSliderValue(v as number);
  };

  if (!poolBalance) {
    return null;
  }

  const onClick = (_side: string) => async () => {
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
    let parsedSize = sliderValue;
    if (parsedSize === 100) {
      parsedSize = 99;
    }
    const parsedPrice = price;

    const sizeDecimalCount =
      market?.minOrderSize && getDecimalCount(market.minOrderSize);
    const priceDecimalCount =
      market?.tickSize && getDecimalCount(market.tickSize);

    const side = _side === 'buy' ? OrderSide.Bid : OrderSide.Ask;

    if (!marketAddress || !marketAddress[0]) {
      notify({
        message: 'Please select a market',
        variant: 'error',
      });
      return;
    }

    if (
      !sliderValue ||
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
            .priceNumberToLots(
              roundToDecimal(parsedPrice, priceDecimalCount) || 0,
            )
            .toNumber(),
        ),
        roundToDecimal(parsedSize, sizeDecimalCount) || 0,
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
      refreshAllCaches();
    }
  };

  return (
    <div style={{ padding: 30, width: smallScreen ? '100%' : 700 }}>
      <Grid container justify="space-around">
        <Grid item>
          <div>
            <Typography className={classes.poolValue}>Pool balances</Typography>
            <Grid
              container
              justify="flex-start"
              direction="column"
              spacing={1}
              style={{ marginTop: 10 }}
            >
              {poolBalance[1]?.map((b, i) => {
                return (
                  <Grid item key={`poolbalance-row-${i}`}>
                    <PoolBalanceRow
                      token={tokenNameFromMint(b.mint)}
                      amount={roundToDecimal(b.tokenAmount.uiAmount, 2)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </div>
        </Grid>
        <Grid item>
          <div>
            <MarketInput
              marketAddresses={marketAddress}
              setMarketAddresses={setMarketAddress}
              marketsList={USE_MARKETS.filter((e) =>
                markets?.includes(e.address.toBase58()),
              )}
            />
            <CssTextField
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              label="Price"
              variant="outlined"
              type="number"
              style={{ width: 230, marginLeft: 10 }}
            />
            <Typography
              className={classes.leverageSizeText}
              style={{ marginLeft: 10, marginTop: 10 }}
            >
              % of pool balance
            </Typography>
            <Slider
              value={sliderValue}
              onChange={(e, v) => handleChangeSlider(v)}
              valueLabelDisplay="auto"
              marks={sliderMarks}
            />
            <Grid container justify="center" alignItems="center" spacing={4}>
              <Grid item>
                <Button onClick={onClick('buy')} className={classes.buyButton}>
                  {loading ? <Spin size={20} /> : 'Buy'}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={onClick('sell')}
                  className={classes.sellButton}
                >
                  {loading ? <Spin size={20} /> : 'Sell'}
                </Button>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export const PoolDepositWithdrawPanel = ({
  poolSeed,
}: {
  poolSeed: string;
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const connection = useConnection();
  const { connected, wallet } = useWallet();
  const [poolBalance] = usePoolBalance(new PublicKey(poolSeed));
  const [tab, setTab] = useState(0);
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const [poolTokenUserBalance] = useBalanceForMint(
    wallet?.publicKey?.toBase58(),
    poolInfo?.mintKey.toBase58(),
  );
  const [sliderValue, setSliderValue] = useState(0);
  const [input, setInput] = useState(0);
  const tokenAccounts = useTokenAccounts(poolInfo?.assetMintkeys);
  const isSP =
    connected &&
    wallet?.publicKey &&
    poolInfo?.signalProvider.equals(wallet?.publicKey);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const handleChangeInput = (e) => {
    setInput(e.target.value);
    setSliderValue(parseInt(e.target.value) / poolTokenUserBalance);
  };

  const handleChangeSlider = (v) => {
    setSliderValue(v as number);
    setInput((poolTokenUserBalance * v) / 100);
  };

  // Settle Pool and Collect fees
  const onClickSettle = async () => {
    if (!connected) {
      return notify({ message: 'Connect your wallet' });
    }
    if (!poolInfo?.signalProvider) {
      return notify({ message: 'Pool information not loaded' });
    }
    try {
      setLoading(true);

      try {
        const instr = await settlePool(connection, bs58.decode(poolSeed));
        await sendTransaction({
          connection: connection,
          wallet: wallet,
          transaction: new Transaction().add(...instr),
        });
      } catch {
        console.log(`Noting to settle`);
      }
      let instructions: TransactionInstruction[] = [];
      try {
        // Check if accounts exist
        instructions = await findAssociatedTokenAccountAndCreate(
          connection,
          wallet.publicKey,
          poolInfo?.signalProvider,
          poolInfo?.mintKey,
          instructions,
        );
        instructions = await findAssociatedTokenAccountAndCreate(
          connection,
          wallet.publicKey,
          BUY_AND_BURN,
          poolInfo?.mintKey,
          instructions,
        );
        instructions = await findAssociatedTokenAccountAndCreate(
          connection,
          wallet.publicKey,
          INSURANCE_FUND,
          poolInfo?.mintKey,
          instructions,
        );
        const instr = await collectFees(connection, [
          new PublicKey(poolSeed).toBuffer(),
        ]);
        instructions.push(...instr);
      } catch {
        console.log(`No fees to collect`);
      }
      await sendTransaction({
        connection: connection,
        wallet: wallet,
        transaction: new Transaction().add(...instructions),
      });
    } catch (err) {
      console.warn(`Error settling pool ${err}`);
      notify({
        message: `Error settling pool ${err}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // For deposits and withdrawals
  const onSubmit = async () => {
    if (!connected) {
      notify({
        message: 'Please connect your wallet',
        variant: 'info',
      });
      return;
    }

    if (!poolInfo || !tokenAccounts || !poolBalance) {
      notify({
        message: 'Try again',
        variant: 'error',
      });
      return;
    }
    const parsedAmount = input;
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      notify({
        message: 'Invalid amount',
        variant: 'error',
      });
      return;
    }
    try {
      setLoading(true);
      notify({
        message: `Initiating the ${tab === 0 ? 'deposit' : 'withdrawal'}`,
        variant: 'info',
      });

      let sourceAssetKeys: PublicKey[] = [];
      const poolAssetsMints = poolInfo.assetMintkeys.map((a) => a.toBase58());

      let balancesNeeded = new Map<string, number>();
      // Check user Balances
      const poolTokenSupply = poolBalance[0].uiAmount;
      for (let i = 0; i < poolBalance[1].length; i++) {
        let b = poolBalance[1][i];
        if (b.tokenAmount.uiAmount && poolTokenSupply) {
          balancesNeeded.set(
            b.mint,
            (b.tokenAmount.uiAmount / poolTokenSupply) * parsedAmount,
          );
        }
      }

      for (let mint of poolAssetsMints) {
        const account = tokenAccounts.find(
          (acc) => acc.mint.toBase58() === mint,
        );
        if (!account) {
          // Create associated token accounts
          await createAssociatedTokenAccount(
            connection,
            wallet,
            new PublicKey(mint),
          );
          const associatedTokenAccount = await findAssociatedTokenAddress(
            wallet.publicKey,
            new PublicKey(mint),
          );
          sourceAssetKeys.push(associatedTokenAccount);
          if (tab === 0) {
            notify({
              message: `You don't have enough balances for ${tokenNameFromMint(
                mint,
              )}`,
              variant: 'error',
            });
            return;
          }
        } else {
          const requiredBalance = balancesNeeded.get(mint);
          const accountInfo = await connection.getParsedAccountInfo(
            account.address,
          );
          const accountBalance =
            // @ts-ignore
            accountInfo.value?.data.parsed.info.tokenAmount.uiAmount;
          if (
            (tab === 0 &&
              requiredBalance &&
              accountBalance > requiredBalance) ||
            tab === 1
          ) {
            sourceAssetKeys.push(account.address);
          } else {
            notify({
              message: `You don't have enough balances for ${tokenNameFromMint(
                mint,
              )}`,
              variant: 'error',
            });
            return;
          }
        }
      }

      let instructions: TransactionInstruction[] = [];
      if (tab === 0) {
        // Tab === 0 => Deposit
        instructions = await deposit(
          connection,
          wallet.publicKey,
          sourceAssetKeys,
          new Numberu64(parsedAmount * Math.pow(10, poolBalance[0].decimals)),
          [new PublicKey(poolSeed).toBuffer()],
          wallet.publicKey,
        );
      } else if (tab === 1) {
        // Tab === 1 => Withdraw
        const sourcePoolTokenKey = await findAssociatedTokenAddress(
          wallet?.publicKey,
          poolInfo.mintKey,
        );

        instructions = await redeem(
          connection,
          wallet.publicKey,
          sourcePoolTokenKey,
          sourceAssetKeys,
          [new PublicKey(poolSeed).toBuffer()],
          new Numberu64(parsedAmount * Math.pow(10, poolBalance[0].decimals)),
        );
      } else {
        notify({
          message: 'Error',
          variant: 'error',
        });
      }

      const tx = new Transaction();
      const signers: Account[] = [];

      tx.add(...instructions);

      await sendTransaction({
        transaction: tx,
        wallet,
        connection,
        signers,
        sendingMessage: `${tab === 0 ? 'Depositing' : 'Withdrawing'}...`,
      });
    } catch (err) {
      if (err.includes('locked')) {
        return notify({ message: `Please settle the pool first` });
      }
      console.warn(`Error ${tab === 0 ? 'Depositing' : 'Withdrawing'} ${err}`);
      notify({
        message: `Error ${tab === 0 ? 'Depositing' : 'Withdrawing'} ${err}`,
        variant: 'error',
      });
    } finally {
      refreshAllCaches();
      setLoading(false);
    }
  };

  return (
    <div
      className="fancy-card"
      style={{
        maxWidth: 700,
        marginBottom: 20,
        width: '90vw',
        paddingBottom: 30,
      }}
    >
      <Tabs
        className={classes.tabs}
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange}
      >
        <Tab disableRipple label={<>Deposit</>} />
        <Tab disableRipple label={<>Withdraw</>} />
        {isSP && <Tab disableRipple label={<>Trade</>} />}
      </Tabs>
      {tab !== 2 && (
        <>
          <div className={classes.tabsInnerContainer}>
            <div className={classes.tabsInnerItem}>
              <Typography className={classes.depositWithdrawPanelText}>
                Tokens you {tab === 0 ? 'deposit from' : 'credit to'} your
                wallet
              </Typography>
              {poolBalance && poolBalance[1] && (
                <Grid
                  style={{ marginTop: 5 }}
                  container
                  justify="flex-start"
                  alignItems="flex-start"
                  spacing={2}
                  direction="column"
                >
                  {poolBalance[0] &&
                    poolBalance[1].map((t, i) => {
                      return (
                        <Grid item key={`pool-balance-${i}`}>
                          <Typography className={classes.label}>
                            {tokenNameFromMint(t.mint)}
                          </Typography>
                          <Typography className={classes.poolValue}>
                            {t.tokenAmount.uiAmount &&
                              poolBalance[0].uiAmount && (
                                <>
                                  {roundToDecimal(
                                    (input * t.tokenAmount.uiAmount) /
                                      poolBalance[0].uiAmount,
                                    4,
                                  ) || 0}
                                </>
                              )}
                          </Typography>
                        </Grid>
                      );
                    })}
                </Grid>
              )}
            </div>
            <div className={classes.tabsInnerItem}>
              <Typography className={classes.depositWithdrawPanelText}>
                How many pool tokens do you want to{' '}
                {tab === 0 ? 'deposit' : 'withdaw'}?
              </Typography>
              <DepositWithdrawInput
                value={roundToDecimal(input, 4)}
                onChange={handleChangeInput}
                id="deposit-withdraw-input"
                type="number"
              />
              {tab === 1 && (
                <Slider
                  value={sliderValue}
                  onChange={(e, v) => handleChangeSlider(v)}
                  valueLabelDisplay="auto"
                  marks={sliderMarks}
                />
              )}
            </div>
          </div>
          {/* Settle and Deposit/Withdraw buttons */}
          <Grid container justify="center" alignItems="center" spacing={3}>
            <Grid item>
              <div
                className={classes.buttonContainer}
                onClick={() => onClickSettle()}
              >
                <div className={classes.button}>
                  <Typography className={classes.coloredText}>
                    {loading ? <Spin size={20} /> : 'Settle'}
                  </Typography>
                </div>
              </div>
            </Grid>
            <Grid item>
              <div
                className={classes.gradientButtonContainer}
                onClick={() => onSubmit()}
              >
                <div className={classes.gradientButton}>
                  <Typography className={classes.gradientButtonText}>
                    {loading ? (
                      <Spin size={20} />
                    ) : tab === 0 ? (
                      'Deposit'
                    ) : (
                      'Withdraw'
                    )}
                  </Typography>
                </div>
              </div>
            </Grid>
          </Grid>
        </>
      )}
      {tab === 2 && <PoolTradePanel poolSeed={poolSeed} />}
    </div>
  );
};

const DetailsRow = ({
  label,
  address,
}: {
  label: React.ReactNode;
  address: PublicKey | undefined;
}) => {
  const classes = useStyles();
  return (
    <Grid
      container
      justify="space-between"
      alignItems="center"
      style={{ margin: 5 }}
    >
      <Grid item>
        <Typography className={classes.infoColLabel}>{label}</Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.infoColValue}>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() =>
              window.open(
                `https://explorer.solana.com/address/${address?.toBase58()}`,
                '_target=blank',
              )
            }
          >
            {abbreviateAddress(address, 8)}
          </div>
        </Typography>
      </Grid>
    </Grid>
  );
};

export const PoolDetails = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const pool = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
  const [poolBalance] = usePoolBalance(new PublicKey(poolSeed));
  const poolStats = usePoolStats(new PublicKey(poolSeed));
  const [expandDetails, setExpandDetails] = useState(false);
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const smallScreen = useSmallScreen();
  return (
    <div style={{ width: smallScreen ? '90vw' : 500, marginTop: 50 }}>
      <Typography className={classes.poolDetailsTitle}>
        {pool?.name || 'Unknown Pool'}
      </Typography>
      <Typography className={classes.poolDescription}>
        {pool?.description || 'N/A'}
      </Typography>
      {/* First row */}
      <Grid container justify="flex-start" alignItems="center" spacing={5}>
        <Grid item>
          <Typography className={classes.label}>USD value of pool</Typography>
          <Typography className={classes.poolValue}>
            ${roundToDecimal(poolStats.usdValue, 2)?.toLocaleString()}
          </Typography>
        </Grid>
        {poolBalance && poolBalance[0] && (
          <Grid item>
            <Typography className={classes.label}>Pool token supply</Typography>
            <Typography className={classes.poolValue}>
              {roundToDecimal(poolBalance[0]?.uiAmount, 2)?.toLocaleString()}
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Typography className={classes.label}>Pool token value</Typography>
          <Typography className={classes.poolValue}>
            ${roundToDecimal(poolStats.poolTokenValue, 2) || 0}
          </Typography>
        </Grid>
      </Grid>
      {/* Second row */}
      <Grid container justify="flex-start" alignItems="center" spacing={5}>
        <Grid item>
          <Typography className={classes.label}>Tokens in the pool</Typography>
          <Typography className={classes.poolValue}>
            {poolStats?.assets?.sort((a, b) => a.localeCompare(b)).join(', ')}
          </Typography>
        </Grid>
        {poolBalance &&
          poolBalance[1].map((b) => {
            return (
              <Grid item>
                <Typography className={classes.label}>
                  {tokenNameFromMint(b.mint)} amount
                </Typography>
                <Typography className={classes.poolValue}>
                  {roundToDecimal(b.tokenAmount.uiAmount, 3)}
                </Typography>
              </Grid>
            );
          })}
      </Grid>
      <Grid container justify="center" style={{ marginTop: 30 }}>
        <div
          className={classes.poolDetailsButtonContainer}
          onClick={() => setExpandDetails((prev) => !prev)}
        >
          <div className={classes.poolDetailsButton}>
            <Typography className={classes.coloredText}>
              {expandDetails ? 'Close details' : 'Pool details'}
            </Typography>
            <img
              src={arrowDown}
              style={{
                marginLeft: 10,
                transform: expandDetails ? 'rotate(180deg)' : undefined,
              }}
              alt=""
            />
          </div>
        </div>
      </Grid>
      {/* Expanded Information Cards */}
      {/* Pool Keys */}
      {expandDetails && (
        <div className={classes.detailCards}>
          <Typography className={classes.poolDetailsTitle}>
            Pool Keys
          </Typography>
          <DetailsRow
            label="Signal Provider"
            address={poolInfo?.signalProvider}
          />
          <DetailsRow label="Pool seed" address={new PublicKey(poolSeed)} />
          <DetailsRow label="Pool address" address={poolInfo?.address} />
          <DetailsRow label="Pool token mint" address={poolInfo?.mintKey} />
        </div>
      )}
      {/* Tradeable Markets */}
      {expandDetails && (
        <div className={classes.detailCards} style={{ marginTop: 20 }}>
          <Typography className={classes.poolDetailsTitle}>
            Tradeable markets
          </Typography>
          <Typography className={classes.poolDescription}>
            The pool can only trade on the following markets
          </Typography>
          {poolInfo?.authorizedMarkets.map((m) => {
            return <DetailsRow label={marketNameFromAddress(m)} address={m} />;
          })}
        </div>
      )}
    </div>
  );
};

export const PoolProfile = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const { wallet } = useWallet();
  const poolStats = usePoolStats(new PublicKey(poolSeed));
  const perf = roundToDecimal(poolStats.inceptionPerformance, 1);
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const [balance] = useBalanceForMint(
    wallet?.publicKey?.toBase58(),
    poolInfo?.mintKey.toBase58(),
  );
  const poolCreation = undefined;
  const smallScreen = useSmallScreen(1540);

  return (
    <div
      className={classes.poolProfile}
      style={{
        flexDirection: smallScreen ? 'row' : 'column',
        justifyContent: smallScreen ? 'space-around' : undefined,
        width: smallScreen ? '90vw' : undefined,
        height: smallScreen ? 200 : undefined,
      }}
    >
      <img src={robot} className={classes.poolProfilePic} alt="" />
      <div>
        {/* Pool performance */}
        <div className={classes.poolProfileItem}>
          <Typography className={classes.label}>Performance</Typography>
          <Typography
            style={{
              color: perf ? (perf > 0 ? '#4EDC76' : '#EB5252') : '#FFFFFF',
            }}
            className={classes.poolProfileValue}
          >
            {perf ? perf + '%' : 'N/A'}
          </Typography>
        </div>
        {/* Pool Creation */}
        <div className={classes.poolProfileItem}>
          <Typography className={classes.label}>Pool creation</Typography>
          <Typography className={classes.poolProfileValue}>
            {poolCreation ? poolCreation : 'N/A'}
          </Typography>
        </div>
        {/* Pool Share */}
        <div className={classes.poolProfileItem}>
          <Typography className={classes.label}>My pool share</Typography>
          <Typography className={classes.poolProfileValue}>
            {balance ? roundToDecimal(balance, 2) : 'N/A'}
          </Typography>
        </div>
      </div>
    </div>
  );
};
