import React, { useState, useMemo } from 'react';
import { Modal, InputAdornment, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { EXTERNAL_SIGNAL_PROVIDERS } from '../utils/externalSignalProviders';
import { CssTextField, CssInput } from './MarketInput';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { marketNameFromAddress, USE_MARKETS } from '../utils/markets';
import { PublicKey, Transaction } from '@solana/web3.js';
import closeIcon from '../assets/components/CreatePool/close.svg';
import { getAssetsFromMarkets } from '../utils/markets';
import {
  useBalanceForMint,
  useTokenAccounts,
  createAssociatedTokenAccount,
  decimalsFromMint,
} from '../utils/tokens';
import { useWallet } from '../utils/wallet';
import { notify } from '../utils/notifications';
import Spin from './Spin';
import { useConnection } from '../utils/connection';
import { createPool, Numberu64 } from '@bonfida/bot';
import { signTransactions, sendSignedTransaction } from '../utils/send';
import bs58 from 'bs58';
import {
  generateTradingViewCredentials,
  postTradingViewCredentials,
  useSmallScreen,
} from '../utils/utils';
import { saveTradingViewPassword } from '../utils/pools';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    height: 'auto',
    maxWidth: 1200,
    border: 'double 1px transparent',
    borderRadius: 4,
    backgroundImage:
      'linear-gradient(#0F0F11, #0F0F11), linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',
  },
  root: {
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    textShadow:
      '0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)',
    fontSize: 42,
    fontWeight: 600,
    lineHeight: '107%',
  },
  assetPanelContainer: {
    padding: 20,
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1125) 9.37%, rgba(255, 255, 255, 0.0375) 54.69%, rgba(255, 255, 255, 0.0394911) 66.15%, rgba(255, 255, 255, 0.15) 100%)',
    borderRadius: 8,
  },
  strategyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 98,
    border: 'double 1px transparent',
    borderRadius: 4,
    backgroundImage:
      'linear-gradient(#0F0F11, #0F0F11), linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',
    color: '#77E3EF',
    fontWeight: 800,
    fontSize: 14,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  strategyButtonSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 98,
    border: 'double 1px transparent',
    borderRadius: 4,
    backgroundImage:
      'linear-gradient(#0F0F11, #0F0F11), linear-gradient(135deg, #6FFBFF 0%, rgba(167, 253, 255, 0.25) 54.69%, rgba(255, 150, 252, 0.25) 66.15%, #FF72F9 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',
    color: '#7C7CFF',
    fontWeight: 800,
    fontSize: 14,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  text: {
    fontWeight: 400,
    fontSize: 18,
    color: '#FFFFFF',
  },
  strategyContainer: {
    maxWidth: 550,
  },
  assetTitle: {
    color: '#77E3EF',
    fontSize: 26,
    fontWeight: 600,
    lineHeight: '110%',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 600,
    lineHeight: '110%',
    color: '#FFFFFF',
    textShadow:
      '0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)',
  },
  createPoolButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: 152,
    border: 'double 1px transparent',
    borderRadius: 28,
    backgroundImage:
      'linear-gradient(#0F0F11, #0F0F11), linear-gradient(135deg, #37BCBD 0%, #B846B2 61.99%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',
    color: '#77E3EF',
    fontSize: 18,
    cursor: 'pointer',
  },
  cancel: {
    color: '#77E3EF',
    fontSize: 18,
    cursor: 'pointer',
  },
  white: {
    color: '#FFFFFF',
  },
  startAdornment: {
    color: '#C8CCD6',
    fontSize: 14,
  },
  input: {
    borderRadius: 4,
    color: '#FFFFFF',
    background: '#181F2B',
    width: '100%',
    border: '0.15px solid rgba(155, 163, 181, 1)',
    paddingLeft: 10,
    paddingRight: 10,
    '& .Mui-disabled': {
      color: 'rgba(255, 255, 255, 0.6)',
    },
  },
  balanceLabel: {
    color: '#C8CCD6',
    fontSize: 12,
  },
  balanceValue: {
    color: '#C8CCD6',
    fontSize: 12,
    fontWeight: 800,
  },
  feeInnerContainer: {
    display: 'flex',
    alignItems: 'top',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  feeContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  feeExplanation: {
    width: '80%',
    marginTop: 4,
    color: 'rgba(200, 204, 214, 1)',
    fontSize: 12,
  },
  modalSmallScreen: {
    position: 'absolute',
    top: 0,
    overflow: 'scroll',
    height: '100%',
    display: 'block',
  },
});

const STRATEGY_TYPES = EXTERNAL_SIGNAL_PROVIDERS.concat([
  {
    description: <></>,
    displayName: 'Custom',
    // @ts-ignore
    pubKey: undefined,
    name: 'Custom',
  },
]);

interface IAsset {
  name: string;
  mint: string | undefined;
  amount: number;
}

const AssetRow = ({
  asset,
  assets,
  setAssets,
}: {
  asset: IAsset;
  assets: IAsset[];
  setAssets: (arg: IAsset[]) => void;
}) => {
  const classes = useStyles();
  const { wallet } = useWallet();
  const [balance] = useBalanceForMint(wallet.publicKey.toBase58(), asset.mint);

  const onChange = (e) => {
    const index = assets.indexOf(asset);
    let old = [...assets];
    const amount = parseFloat(e.target.value);
    if (amount > balance) {
      return notify({ message: `You only have ${balance} ${asset.name}` });
    }
    old[index].amount = amount;

    setAssets(old);
  };

  return (
    <div style={{ margin: 10 }}>
      <CssInput
        onChange={onChange}
        type="number"
        className={classes.input}
        value={asset.amount}
        startAdornment={
          <InputAdornment position="end" style={{ marginRight: 10 }}>
            <Typography className={classes.startAdornment}>Amount</Typography>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <Typography className={classes.white}>{asset.name}</Typography>
          </InputAdornment>
        }
      />
      <div style={{ marginLeft: 5, marginTop: 5 }}>
        <Typography className={classes.balanceLabel}>
          Balance: <span className={classes.balanceValue}>{balance || 0}</span>
        </Typography>
      </div>
    </div>
  );
};

const AssetPanel = ({
  assets,
  setAssets,
}: {
  assets: IAsset[];
  setAssets: (arg: IAsset[]) => void;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.assetPanelContainer}>
      <Typography className={classes.assetTitle}>Assets</Typography>
      <Typography className={classes.text}>
        These are the assets you’ll be depositing to start the liquidity of the
        pool.
      </Typography>
      {assets.map((a) => {
        return <AssetRow asset={a} assets={assets} setAssets={setAssets} />;
      })}
    </div>
  );
};

const StrategyPanel = ({
  strategy,
  setStrategy,
}: {
  strategy: number;
  setStrategy: (arg: number) => void;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.strategyContainer}>
      <Typography className={classes.modalTitle}>
        Select a strategy template
      </Typography>
      <Grid
        container
        justify="flex-start"
        alignItems="center"
        spacing={1}
        style={{ marginTop: 5, marginBottom: 5 }}
      >
        {STRATEGY_TYPES.map((s, i) => {
          return (
            <Grid item key={`strategy-panel-${i}`}>
              <div
                onClick={() => setStrategy(i)}
                className={
                  strategy === i
                    ? classes.strategyButtonSelected
                    : classes.strategyButton
                }
              >
                {s.displayName}
              </div>
            </Grid>
          );
        })}
      </Grid>
      <Typography className={classes.text}>
        {EXTERNAL_SIGNAL_PROVIDERS[strategy]?.description}
      </Typography>
    </div>
  );
};

const FeePanel = ({
  strategy,
  feeRatio,
  setFeeRatio,
  feePeriod,
  setFeePeriod,
}: {
  strategy: number;
  feeRatio: number;
  setFeeRatio: (arg: number) => void;
  feePeriod: number;
  setFeePeriod: (arg: number) => void;
}) => {
  const classes = useStyles();
  const customIndex = STRATEGY_TYPES.length - 1;
  const disabled = customIndex !== strategy;
  const smallScreen = useSmallScreen();

  const onChangeFeePeriod = (e) => {
    setFeePeriod(parseFloat(e.target.value));
  };

  const onChangeFeeRatio = (e) => {
    setFeeRatio(parseFloat(e.target.value));
  };

  return (
    <div className={classes.feeContainer}>
      <Typography className={classes.sectionTitle}>Set your fees</Typography>
      <div
        className={classes.feeInnerContainer}
        style={{ flexDirection: smallScreen ? 'column' : 'row' }}
      >
        <div>
          {/* Fee period */}
          <CssInput
            onChange={onChangeFeePeriod}
            disabled={disabled}
            value={disabled ? 604800 : feePeriod}
            type="number"
            className={classes.input}
            style={{ width: '90%' }}
            startAdornment={
              <InputAdornment position="end" style={{ marginRight: 10 }}>
                <Typography className={classes.startAdornment}>
                  Period
                </Typography>
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <Typography className={classes.white}>sec</Typography>
              </InputAdornment>
            }
          />
          <Typography className={classes.feeExplanation}>
            The fee collection period must be set in seconds
          </Typography>
        </div>
        <div>
          {/* Fee ratio */}
          <CssInput
            onChange={onChangeFeeRatio}
            disabled={disabled}
            value={disabled ? 0.1 : feeRatio}
            type="number"
            className={classes.input}
            style={{ width: '90%' }}
            startAdornment={
              <InputAdornment position="end" style={{ marginRight: 10 }}>
                <Typography className={classes.startAdornment}>
                  Ratio
                </Typography>
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <Typography className={classes.white}>%</Typography>
              </InputAdornment>
            }
          />
          <Typography className={classes.feeExplanation}>
            Percentage of the pool that will be deduced for fees each period
          </Typography>
        </div>
      </div>
    </div>
  );
};

const MarketRow = ({
  marketAddress,
  marketAddresses,
  setMarketAddresses,
}: {
  marketAddress: string;
  marketAddresses: string[];
  setMarketAddresses;
}) => {
  const classes = useStyles();
  const onClick = () => {
    const filtered = marketAddresses.filter((m) => m !== marketAddress);
    setMarketAddresses(filtered);
  };
  return (
    <Grid container alignItems="center" justify="flex-start" spacing={2}>
      <Grid item>
        <Typography className={classes.text} style={{ width: 130 }}>
          {marketNameFromAddress(new PublicKey(marketAddress))}
        </Typography>
      </Grid>
      <Grid item>
        <img
          src={closeIcon}
          style={{ marginTop: 5, cursor: 'pointer' }}
          onClick={onClick}
          alt=""
        />
      </Grid>
    </Grid>
  );
};

const MarketPanel = ({
  marketAddresses,
  setMarketAddresses,
}: {
  marketAddresses: string[];
  setMarketAddresses: (arg: string[]) => void;
}) => {
  const classes = useStyles();

  const onChange = (e, v, r) => {
    if (!v) {
      return;
    }
    const old = [...marketAddresses.filter((m) => m !== v.address.toBase58())];
    old.push(v.address.toBase58());
    setMarketAddresses([...old]);
  };

  return (
    <>
      <Typography className={classes.sectionTitle}>
        Add a Serum market
      </Typography>
      <Typography
        className={classes.text}
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        Choose a market below and add it into the pool.
      </Typography>
      <Autocomplete
        style={{ marginTop: 5, marginBottom: 5 }}
        disableClearable={true}
        onChange={onChange}
        options={USE_MARKETS}
        getOptionLabel={(option: any) => option.name}
        renderInput={(params) => (
          <CssTextField {...params} label="Market" variant="outlined" />
        )}
      />
      <div style={{ marginTop: 20, marginLeft: 5 }}>
        {marketAddresses.map((m, i) => {
          return (
            <MarketRow
              marketAddress={m}
              marketAddresses={marketAddresses}
              setMarketAddresses={setMarketAddresses}
              key={`market-row-${m}-${i}`}
            />
          );
        })}
      </div>
    </>
  );
};

const CreatePoolModal = ({
  modalVisible,
  onClose,
}: {
  modalVisible: boolean;
  onClose: (arg: boolean) => void;
}) => {
  const classes = useStyles();
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const smallScreen = useSmallScreen();
  // Strategy index
  const [strategy, setStrategy] = useState(0);
  // TradingView credentials
  const [tradingViewCredentials, setTradingViewCredentials] = useState<
    string | null
  >(null);
  // Markets of the pool
  const [marketAddresses, setMarketAddresses] = useState<string[]>([]);
  // Fees
  const [feeRatio, setFeeRatio] = useState(0.1);
  const [feePeriod, setFeePeriod] = useState(604800);
  // Assets
  const [assets, setAssets] = useState(
    getAssetsFromMarkets(marketAddresses).map((e) => {
      return {
        name: e.name,
        mint: e.mint,
        amount: 0,
      };
    }),
  );
  // Token accounts
  const tokenAccounts = useTokenAccounts(
    // @ts-ignore
    assets.filter((e) => !!e.mint).map((e) => new PublicKey(e.mint)),
  );
  // Created pool
  const [createdPoolSeed, setCreatedPoolSeed] = useState<string | null>(null);

  useMemo(() => {
    if (!connected || marketAddresses.length === 0) return;
    setAssets(
      getAssetsFromMarkets(marketAddresses).map((e) => {
        return {
          name: e.name,
          mint: e.mint,
          amount: 0,
        };
      }),
    );
  }, [marketAddresses, connected]);

  // Create strategy

  const onSubmit = async () => {
    const isCustom = strategy === STRATEGY_TYPES.length - 1;
    const sigProvider = isCustom
      ? wallet?.publicKey
      : STRATEGY_TYPES[strategy].pubKey;
    let _feeCollectionPeriod = isCustom ? feePeriod : 604800;
    let _feeRatio = isCustom ? feeRatio : 0.1;
    if (!_feeRatio || !_feeCollectionPeriod) {
      notify({
        message: 'Invalid fees',
        variant: 'error',
      });
      return;
    }
    if (_feeCollectionPeriod < 604800) {
      notify({
        message: 'Fee period need to be greater than 7 days (604,800s)',
        variant: 'error',
      });
      return;
    }
    if (!assets || marketAddresses.length === 0) {
      notify({
        message: 'Please select at least 1 market',
        variant: 'error',
      });
      return;
    }
    try {
      setLoading(true);
      notify({
        message: 'Creating pool',
        variant: 'info',
      });
      // Check if sourceAssetKeys exist, if not create the associated token account
      for (let acc of tokenAccounts) {
        const accountInfo = await connection.getParsedAccountInfo(acc.address);
        if (!accountInfo) {
          await createAssociatedTokenAccount(connection, wallet, acc.mint);
        }
      }
      let amounts: number[] = [];
      for (let asset of assets) {
        const decimals = await decimalsFromMint(
          connection,
          // @ts-ignore
          new PublicKey(asset.mint),
        );
        amounts.push(asset.amount * Math.pow(10, decimals));
      }
      const authorizedMarkets = [...new Set(marketAddresses)].map(
        (m) => new PublicKey(m),
      );
      const [poolSeed, transactionInstructions] = await createPool(
        connection,
        wallet?.publicKey,
        tokenAccounts.map((t) => t.address),
        sigProvider,
        amounts,
        2 * marketAddresses.length,
        authorizedMarkets,
        wallet?.publicKey,
        new Numberu64(_feeCollectionPeriod),
        _feeRatio,
      );
      const signed = await signTransactions({
        transactionsAndSigners: transactionInstructions.map((i) => {
          return { transaction: new Transaction().add(i) };
        }),
        connection: connection,
        wallet: wallet,
      });
      for (let signedTransaction of signed) {
        console.log('sending signed transaction');
        await sendSignedTransaction({ signedTransaction, connection });
      }
      setCreatedPoolSeed(bs58.encode(poolSeed));
      if (STRATEGY_TYPES[strategy].displayName.includes('TradingView')) {
        notify({
          message: 'Creating TradingView password...',
        });
        const { pubKey, password } = generateTradingViewCredentials();
        console.log(pubKey, password);
        await postTradingViewCredentials(pubKey, bs58.encode(poolSeed));
        setTradingViewCredentials(password);
        saveTradingViewPassword(bs58.encode(poolSeed), password);
        notify({
          message: 'TradingView password created',
          variant: 'success',
        });
      }
    } catch (err) {
      console.warn(`Error creating the pool ${err}`);
      notify({
        message: `Error creating the pool ${err}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={modalVisible}
        onClose={onClose}
        className={smallScreen ? classes.modalSmallScreen : classes.modal}
      >
        <div className={classes.container}>
          <div
            className={classes.root}
            style={{ flexDirection: smallScreen ? 'column' : 'row' }}
          >
            <div style={{ margin: 20 }}>
              <StrategyPanel strategy={strategy} setStrategy={setStrategy} />
              <FeePanel
                strategy={strategy}
                feePeriod={feePeriod}
                setFeePeriod={setFeePeriod}
                feeRatio={feeRatio}
                setFeeRatio={setFeeRatio}
              />
              <MarketPanel
                marketAddresses={marketAddresses}
                setMarketAddresses={setMarketAddresses}
              />
            </div>
            <div style={{ margin: 20 }}>
              <AssetPanel assets={assets} setAssets={setAssets} />
            </div>
          </div>
          {createdPoolSeed && (
            <div style={{ marginLeft: 20 }}>
              <Typography className={classes.assetTitle}>Pool seed:</Typography>
              <Typography
                onClick={() => history.push(`/pool/${createdPoolSeed}`)}
                className={classes.white}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  overflowWrap: 'break-word',
                }}
              >
                {createdPoolSeed}
              </Typography>
            </div>
          )}
          {tradingViewCredentials && (
            <div style={{ marginLeft: 20, maxWidth: 500 }}>
              <Typography className={classes.assetTitle}>
                Tradingview password:
              </Typography>
              <Typography
                className={classes.white}
                style={{
                  fontSize: 14,
                  overflowWrap: 'break-word',
                }}
              >
                {tradingViewCredentials}
              </Typography>
            </div>
          )}
          <Grid
            container
            justify="space-between"
            alignItems="center"
            style={{ padding: 30 }}
          >
            <Grid item>
              <div onClick={() => onClose(false)} className={classes.cancel}>
                Cancel
              </div>
            </Grid>
            <Grid item>
              <div className={classes.createPoolButton} onClick={onSubmit}>
                {loading ? <Spin size={20} /> : 'Create pool'}
              </div>
            </Grid>
          </Grid>
        </div>
      </Modal>
    </>
  );
};

export default CreatePoolModal;
