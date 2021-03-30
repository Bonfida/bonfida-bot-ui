import React, { useState, useMemo } from 'react';
import { usePoolTokenSupply, USE_POOLS } from '../../utils/pools';
import FloatingCard from '../FloatingCard';
import DepositInput from '../DepositInput';
import robot from '../../assets/icons/illustrations/robot-top-bar.svg';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../TabPanel';
import {
  tokenNameFromMint,
  useTokenAccounts,
  useBalanceForMint,
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
} from '../../utils/tokens';
import Divider from '../Divider';
import { PublicKey } from '@solana/web3.js';
import {
  usePoolBalance,
  usePoolInfo,
  usePoolUsdBalance,
  usePoolName,
  CUSTOME_NAME_PREFIX,
  TV_PASSWORD_STORAGE_PREFIX,
  usePublicKeyFromSeed,
  useHistoricalPerformance,
} from '../../utils/pools';
import { useConnection } from '../../utils/connection';
import { deposit, Numberu64, redeem } from 'bonfida-bot';
import CustomButton from '../CustomButton';
import InformationRow from '../InformationRow';
import {
  roundToDecimal,
  formatSeconds,
  useLocalStorageState,
  timeConverter,
} from '../../utils/utils';
import Emoji from '../Emoji';
import { notify } from '../../utils/notifications';
import Spin from '../Spin';
import { marketNameFromAddress } from '../../utils/markets';
import { useWallet } from '../../utils/wallet';
import { Transaction, Account, TransactionInstruction } from '@solana/web3.js';
import { sendTransaction } from '../../utils/send';
import { useHistory } from 'react-router-dom';
import { KNOWN_SIGNAL_PROVIDERS } from '../../utils/externalSignalProviders';
import EditIcon from '@material-ui/icons/Edit';
import Modal from '../Modal';
import { TextField } from '@material-ui/core';
import { TV_CRANKER } from '../../utils/externalSignalProviders';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import HelpUrls from '../../utils/HelpUrls';
import { ExplorerLink } from '../Link';
import Graph from './Graph';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    poolTitle: {
      fontSize: 30,
    },
    dialogContainer: {
      padding: 25,
      background: 'white',
    },
    dialogGridItem: {
      marginTop: 10,
      marginBottom: 10,
    },
    input: {
      fontSize: 15,
    },
    editIcon: {
      cursor: 'pointer',
    },
    tvPassword: {
      height: 40,
      width: '100%',
      marginTop: 10,
      marginBottom: 10,
    },
    tvSection: {
      marginBottom: 15,
      marginTop: 15,
      fontWeight: 600,
    },
    subSectionPoolInformation: {
      marginBottom: 20,
      marginTop: 20,
      fontWeight: 600,
      opacity: 0.75,
    },
    performanceContainer: {
      width: '100%',
      height: '250px',
    },
  }),
);

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

const CustomNameDialog = ({
  poolSeed,
  setOpen,
}: {
  poolSeed: string;
  setOpen: (arg: any) => void;
}) => {
  const classes = useStyles();
  const [customName, setCustomName] = useState<string | null>(null);
  const [, storeCustomName] = useLocalStorageState(
    CUSTOME_NAME_PREFIX + poolSeed,
  );

  const onChange = (e) => {
    const input = e.target.value;
    setCustomName(input);
  };

  const onClick = () => {
    if (!customName) {
      notify({
        message: 'Custom name cannot be null',
        variant: 'error',
      });
      return;
    }
    storeCustomName(customName);
    setOpen(false);
  };

  return (
    <div className={classes.dialogContainer}>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item className={classes.dialogGridItem}>
          <Typography variant="body1">Custom Pool Name</Typography>
        </Grid>
        <Grid item className={classes.dialogGridItem}>
          <TextField
            onChange={onChange}
            value={customName}
            label="Name"
            InputProps={{ className: classes.input }}
          />
        </Grid>
        <Grid item className={classes.dialogGridItem}>
          <CustomButton onClick={onClick}>Save</CustomButton>
        </Grid>
      </Grid>
    </div>
  );
};

const PoolTitle = ({
  poolName,
  poolSeed,
  canEdit,
}: {
  poolName: string;
  poolSeed: string;
  canEdit?: boolean;
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <img src={robot} style={{ height: 70 }} alt="" />
        </Grid>
        <Grid item>
          <Typography variant="h1" className={classes.poolTitle}>
            {poolName}
            {canEdit && (
              <EditIcon
                className={classes.editIcon}
                onClick={() => setOpen(true)}
              />
            )}
          </Typography>
        </Grid>
      </Grid>
      <Modal open={open} setOpen={setOpen}>
        <CustomNameDialog poolSeed={poolSeed} setOpen={setOpen} />
      </Modal>
    </>
  );
};

export const TradingViewSection = ({
  isCustomTradingView,
  tradingViewPassword,
}: {
  isCustomTradingView: boolean | undefined | null;
  tradingViewPassword: string | undefined | null;
}) => {
  const classes = useStyles();
  const [showTvPassword, setShowTvPassword] = useState(false);
  if (!isCustomTradingView || !tradingViewPassword) {
    return null;
  }
  return (
    <>
      <Typography variant="body1" className={classes.tvSection} align="center">
        TradingView
      </Typography>
      <InputLabel>TradingView Password</InputLabel>
      <OutlinedInput
        disabled
        type={showTvPassword ? 'text' : 'password'}
        value={tradingViewPassword}
        className={classes.tvPassword}
        inputProps={{ style: { fontSize: 20 } }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowTvPassword((prev) => !prev)}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
              style={{ margin: 10 }}
            >
              {showTvPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(tradingViewPassword || '');
                notify({ message: 'Copied!' });
              }}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
              style={{ margin: 10 }}
            >
              <FileCopyIcon />
            </IconButton>
          </InputAdornment>
        }
      />
      <InputLabel>Webhook URL</InputLabel>
      <OutlinedInput
        disabled
        type="text"
        value={HelpUrls.webhookUrl}
        className={classes.tvPassword}
        inputProps={{ style: { fontSize: 20 } }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(HelpUrls.webhookUrl || '');
                notify({ message: 'Copied!' });
              }}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
              style={{ margin: 10 }}
            >
              <FileCopyIcon />
            </IconButton>
          </InputAdornment>
        }
      />
      <InformationRow
        label="TradingView Message"
        value="/tradingview-generator"
        isLink
        linkText="Message Generator"
      />
    </>
  );
};

const PerformanceSection = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const [performance] = useHistoricalPerformance(poolSeed);
  if (!performance || performance?.length === 0) {
    return null;
  }
  return (
    <div className={classes.performanceContainer}>
      <Graph data={performance} yKey="poolTokenUsdValue" xKey="time" />
    </div>
  );
};

const PoolInformation = ({
  poolSeed,
  tokenAccounts,
}: {
  poolSeed: PublicKey;
  tokenAccounts: any;
}) => {
  const classes = useStyles();
  const [poolKey] = usePublicKeyFromSeed(poolSeed);
  const [poolBalance] = usePoolBalance(poolSeed);
  const [poolInfo, poolInfoLoaded] = usePoolInfo(poolSeed);
  const pool = USE_POOLS.find(
    (p) => p.poolSeed.toBase58() === poolSeed.toBase58(),
  );

  const userPoolTokenBalance = useBalanceForMint(
    tokenAccounts,
    poolInfo?.mintKey.toBase58(),
  );

  const poolMarkets = poolInfo?.authorizedMarkets;

  let usdValue = usePoolUsdBalance(poolBalance ? poolBalance[1] : null);

  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  // Fee Info
  let feePeriod = useMemo(
    () => formatSeconds(poolInfo?.feePeriod.toNumber() || 0),
    [poolInfoLoaded],
  );

  const isVerified = useMemo(
    () =>
      !!pool ||
      KNOWN_SIGNAL_PROVIDERS.includes(
        poolInfo?.signalProvider.toBase58() || '',
      ),
    [poolInfoLoaded],
  );

  const isCustomTradingView = useMemo(
    () => poolInfo?.signalProvider.toBase58() === TV_CRANKER && !pool,
    [poolInfoLoaded],
  );

  const [tradingViewPassword] = useLocalStorageState(
    TV_PASSWORD_STORAGE_PREFIX + poolSeed,
    null,
  );

  return (
    <>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange}
        centered
      >
        <Tab disableRipple label="Pool Content" />
        <Tab disableRipple label="Pool Information" />
        <Tab disableRipple label="Fee Schedule" />
      </Tabs>
      {/* Content of the pool */}
      <TabPanel value={tab} index={0}>
        <InformationRow
          label="Pool Token Supply"
          value={poolBalance ? poolBalance[0]?.uiAmount : 0}
        />
        <InformationRow
          label="USD Value of the Pool"
          value={`$${roundToDecimal(usdValue, 2)}`}
        />
        <InformationRow
          label="Pool Token Value"
          value={`$${
            poolBalance
              ? roundToDecimal(usdValue / poolBalance[0]?.uiAmount, 3)
              : 0
          }`}
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
        <InformationRow
          label="Your Share of the Pool"
          value={userPoolTokenBalance?.toLocaleString() || 0}
        />
      </TabPanel>
      {/* Pool Description if whitelisted */}
      <TabPanel value={tab} index={1}>
        {isVerified ? (
          <>
            <Typography variant="body1">{pool?.description}</Typography>
          </>
        ) : (
          <>
            <Typography variant="body1">
              <Emoji emoji="⚠️" />
              This pool is unverified, use at your own risk
            </Typography>
          </>
        )}
        <Typography
          variant="body1"
          className={classes.subSectionPoolInformation}
          align="center"
        >
          Pool Keys:
        </Typography>
        <InformationRow
          label=" - Signal Provider:"
          value={poolInfo?.signalProvider.toBase58()}
          isExplorerLink
        />
        <InformationRow
          label=" - Pool Seed"
          value={poolSeed.toBase58()}
          isExplorerLink
        />
        <InformationRow
          label=" - Pool PublicKey"
          value={poolKey?.toBase58()}
          isExplorerLink
        />
        <InformationRow
          label=" - Pool Token Mint"
          value={poolInfo?.mintKey.toBase58()}
          isExplorerLink
        />
        <Typography
          variant="body1"
          className={classes.subSectionPoolInformation}
          align="center"
        >
          The pool can only trade on the following markets:
        </Typography>
        <div style={{ margin: 10 }}>
          {poolMarkets?.map((m) => {
            return (
              <InformationRow
                label={' - ' + marketNameFromAddress(m)}
                value={m.toBase58()}
                isExplorerLink
              />
            );
          })}
        </div>
        <Typography
          variant="body1"
          className={classes.subSectionPoolInformation}
          align="center"
        >
          View the bot's trades on the{' '}
          <ExplorerLink address={poolKey?.toBase58()}>
            Solana Explorer
          </ExplorerLink>
        </Typography>

        <TradingViewSection
          isCustomTradingView={isCustomTradingView}
          tradingViewPassword={tradingViewPassword}
        />
        <PerformanceSection poolSeed={poolSeed.toBase58()} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
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
      </TabPanel>
    </>
  );
};

export const PoolPanel = ({ poolSeed }: { poolSeed: string }) => {
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const pool = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
  const [poolInfo, poolInfoLoaded] = usePoolInfo(new PublicKey(poolSeed));
  const [poolBalance, poolBalanceLoaded] = usePoolBalance(
    new PublicKey(poolSeed),
  );

  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  const [mint, setMint] = useState<undefined | string>('');
  const [amount, setAmount] = useState('0');
  const [tokenAccounts] = useTokenAccounts();
  const balance = useBalanceForMint(tokenAccounts, mint);

  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);

  const isAdmin = useMemo(
    () =>
      wallet &&
      connected &&
      poolInfo?.signalProvider.toBase58() === wallet?.publicKey?.toBase58(),
    [connected, poolInfoLoaded],
  );

  const isVerified = useMemo(
    () =>
      !!pool ||
      KNOWN_SIGNAL_PROVIDERS.includes(
        poolInfo?.signalProvider.toBase58() || '',
      ),
    [poolInfoLoaded],
  );

  const poolName = usePoolName(poolSeed);

  const history = useHistory();

  useMemo(() => {
    if (poolInfo) {
      setMint(poolInfo.mintKey.toBase58());
    }
  }, [poolInfoLoaded]);

  useMemo(() => {
    // Recompute Deposit quote
    const parsedAmount = parseFloat(amount);
    if (!poolBalance || isNaN(parsedAmount) || parsedAmount <= 0) {
      setQuote(null);
      return;
    }
    let newQuote = '';
    let quoteAssets: string[] = [];
    newQuote += `${amount} Pool Token  = `;
    const poolTokenSupply = poolBalance[0].uiAmount;
    for (let i = 0; i < poolBalance[1].length; i++) {
      let b = poolBalance[1][i];
      quoteAssets.push(
        `${roundToDecimal(
          (b.tokenAmount.uiAmount / poolTokenSupply) * parseFloat(amount),
          3,
        )} ${tokenNameFromMint(b.mint)}`,
      );
    }
    setQuote(
      quoteAssets.length > 0 ? newQuote + quoteAssets.join(' + ') : null,
    );
  }, [amount, poolBalanceLoaded]);

  const onSubmit = async () => {
    if (!connected) {
      notify({
        message: 'Please connect your wallet',
        variant: 'info',
      });
      return;
    }
    // Checks enough in wallet, !isNaN amount
    if (!poolInfo || !tokenAccounts || !poolBalance) {
      notify({
        message: 'Try again',
        variant: 'error',
      });
      return;
    }
    const parsedAmount = parseFloat(amount);
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

      for (let mint of poolAssetsMints) {
        const account = tokenAccounts.find(
          (acc) => acc.account.data.parsed.info.mint === mint,
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
        } else {
          sourceAssetKeys.push(new PublicKey(account.pubkey));
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
      console.warn(`Error ${tab === 0 ? 'Depositing' : 'Withdrawing'} ${err}`);
      notify({
        message: `Error ${tab === 0 ? 'Depositing' : 'Withdrawing'} ${err}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: 700, padding: 20, margin: 20 }}>
      <FloatingCard>
        {/* Header */}
        <VerifiedPool isVerified={isVerified} />
        {/* Deposit/Withdraw tokens */}
        <PoolTitle poolName={poolName} poolSeed={poolSeed} canEdit={!pool} />
        <Divider
          width="80%"
          height="1px"
          background="#B80812"
          marginLeft="auto"
          marginRight="auto"
          opacity={0.5}
          marginBottom="10px"
          marginTop="10px"
        />
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          centered
        >
          <Tab label="Deposit" />
          <Tab label="withdraw" />
        </Tabs>
        <DepositInput
          amountLabel="Pool Token"
          mint={mint}
          amount={amount}
          setAmount={setAmount}
          balance={balance}
        />
        {/* Show something like 1 Pool Token = x FIDA + y USDC + ... */}
        {poolBalance && quote && (
          <>
            <Typography variant="body1" align="center">
              {quote}
            </Typography>
          </>
        )}
        {/* Pool info */}
        <Divider
          width="80%"
          height="1px"
          background="#B80812"
          marginLeft="auto"
          marginRight="auto"
          opacity={0.5}
          marginBottom="10px"
          marginTop="10px"
        />

        <PoolInformation
          poolSeed={new PublicKey(poolSeed)}
          tokenAccounts={tokenAccounts}
        />
        {/* Add pool markets */}
        {/* Submit button */}
        <Divider
          width="80%"
          height="1px"
          background="#B80812"
          marginLeft="auto"
          marginRight="auto"
          opacity={0.5}
          marginBottom="10px"
          marginTop="10px"
        />
        <Grid container justify="center">
          <CustomButton onClick={onSubmit}>
            {loading ? <Spin size={20} /> : tab === 0 ? 'Deposit' : 'Withdraw'}
          </CustomButton>
        </Grid>

        {/* Admin Page */}
        <Divider
          width="80%"
          height="1px"
          background="#B80812"
          marginLeft="auto"
          marginRight="auto"
          opacity={0.5}
          marginBottom="10px"
          marginTop="10px"
        />
        {isAdmin && (
          <>
            <Typography align="center" variant="body1">
              It looks like you own this pool
            </Typography>
            <Grid container justify="center" style={{ marginTop: 10 }}>
              <CustomButton
                onClick={() => history.push(`/signal-provider/${poolSeed}`)}
              >
                Admin Page
              </CustomButton>
            </Grid>
          </>
        )}
      </FloatingCard>
    </div>
  );
};
