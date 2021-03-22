import React, { useState, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FloatingCard from './FloatingCard';
import { useWallet } from '../utils/wallet';
import { Typography, Checkbox, TextField, Grid } from '@material-ui/core';
import { useConnection } from '../utils/connection';
import Divider from './Divider';
import WalletConnect from './WalletConnect';
import MarketInput from './MarketInput';
import CustomButton from './CustomButton';
import { sendTransaction } from '../utils/send';
import DeleteIcon from '@material-ui/icons/Delete';
import { getAssetsFromMarkets } from '../utils/markets';
import {
  useTokenAccounts,
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
} from '../utils/tokens';
import CoinInput from './CoinInputCreatePool';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createPool, Numberu64 } from 'bonfida-bot';
import { notify } from '../utils/notifications';
import { decimalsFromMint } from '../utils/tokens';
import { FIDA_USDC_MARKET_ADDRESS } from '../utils/markets';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Spin from './Spin';
import Emoji from './Emoji';
import bs58 from 'bs58';
import {
  FEES,
  MONTH,
  EXTERNAL_SIGNAL_PROVIDERS,
  getDescriptionFromAddress,
  TV_CRANKER,
  getSignalProviderByName,
} from '../utils/externalSignalProviders';
import { ExternalSignalProvider, Template } from '../utils/types';
import { ExplorerLink } from './Link';
import {
  isValidPublicKey,
  generateTradingViewCredentials,
  postTradingViewCredentials,
} from '../utils/utils';
import { useHistory } from 'react-router-dom';
import { saveTradingViewPassword } from '../utils/pools';
import { nanoid } from 'nanoid';
import MouseOverPopOver from './MouseOverPopOver';

const useStyles = makeStyles({
  img: {
    height: 100,
  },
  input: {
    fontSize: 20,
  },
  textField: {
    width: 300,
    margin: 10,
  },
  formControl: {
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  subsection: {
    fontSize: 20,
    margin: 20,
  },
  remove: {
    color: '#BA0202',
  },
  gridContainer: {
    border: '1px solid #BA0202',
  },
  autoComplete: {
    height: 55,
    width: 300,
    marginTop: 30,
    marginBottom: 30,
  },
  externalSigProvider: {
    marginTop: 20,
  },
  breakWord: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
  },
  bold: {
    fontWeight: 600,
  },
  tvText: {
    marginTop: 20,
    marginBottom: 20,
  },
  createdPoolSeed: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  templateStrategy: {
    fontSize: 30,
    fontWeight: 600,
    transition: 'transform .9s',
  },
  templateStrategyContainer: {
    width: 400,
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  templateStrategyTitle: {
    fontSize: 40,
    marginBottom: 50,
  },
});

const TEMPLATES: Template[] = [
  {
    name: 'DCA Monthly',
    key: 'dcaMonthly',
  },
  { name: 'DCA Weekly', key: 'dcaWeekly' },
  { name: 'DCA Daily', key: 'dcaDaily' },
  {
    name: 'TradingView',
    key: 'tradingView',
  },
  {
    name: 'Custom',
    key: 'custom',
  },
];

const TemplateStrategyCard = ({
  name,
  setTemplate,
}: {
  name: string;
  setTemplate: (e: any) => void;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.templateStrategyContainer} onClick={setTemplate}>
      <FloatingCard>
        <Typography
          variant="body1"
          align="center"
          className={classes.templateStrategy}
        >
          {name}
        </Typography>
      </FloatingCard>
    </div>
  );
};

const CreatePoolCard = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [createdPoolSeed, setCreatedPoolSeed] = useState<string | null>(null);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [tokenAccounts] = useTokenAccounts();
  const [marketAddresses, setMarketAddresses] = useState<string[]>([
    FIDA_USDC_MARKET_ADDRESS,
  ]);

  // Fees
  const [feeRatio, setFeeRatio] = useState<string | null>('0.1');
  const [feeCollectionPeriod, setFeeCollectionPeriod] = useState<string | null>(
    '604800',
  );

  // External Signal Provider
  // Set Fees by default
  const [externalSigProvider, setExternalSigProvider] = useState<string | null>(
    null,
  );
  const [checkedExtSigProvider, setCheckedExtSigProvider] = useState(false);
  const [
    extSigProviderDescription,
    setExtSigProviderDesciption,
  ] = useState<JSX.Element | null>(null);
  const [isTradingView, setIsTradingView] = useState(false);
  const [tradingViewCredentials, setTradingViewCredentials] = useState<
    string | null
  >(null);

  const [assets, setAssets] = useState(
    getAssetsFromMarkets(marketAddresses).map((e) => {
      return {
        name: e.name,
        mint: e.mint,
        amount: 0,
      };
    }),
  );
  useMemo(() => {
    setIsTradingView(externalSigProvider === TV_CRANKER);
  }, [externalSigProvider]);

  useMemo(() => {
    const old = [...assets];
    let newAssets = getAssetsFromMarkets(marketAddresses).map((e) => {
      return {
        name: e.name,
        mint: e.mint,
        amount: old.find((oldAsset) => oldAsset.mint === e.mint)?.amount || 0,
      };
    });
    setAssets(newAssets);
  }, [marketAddresses]);

  useMemo(() => {
    const description = getDescriptionFromAddress(
      externalSigProvider ? new PublicKey(externalSigProvider) : null,
    );
    setExtSigProviderDesciption(description);
  }, [externalSigProvider]);

  // Step
  const [step, setStep] = useState(0);
  const [custom, setCustom] = useState(false);

  const onChangeAutoComplete = (e, v, r) => {
    if (!v) {
      return;
    }
    setExternalSigProvider(v.pubKey.toBase58());
  };

  const removeMarket = (i: number) => {
    setMarketAddresses([
      ...marketAddresses.slice(0, i),
      ...marketAddresses.slice(i + 1, marketAddresses.length),
    ]);
  };

  const onChangeFeeCollectionPeriod = (e) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed) || parsed < 0) {
      setFeeCollectionPeriod('');
      return;
    }
    setFeeCollectionPeriod(
      e.target.value[0] === '0' && e.target.value.length > 1
        ? e.target.value.slice(1)
        : e.target.value,
    );
  };

  const onChangeFeeRatio = (e) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setFeeRatio('');
      return;
    }
    setFeeRatio(
      e.target.value[0] === '0' && e.target.value.length > 1
        ? e.target.value.slice(1)
        : e.target.value,
    );
  };

  if (!connected) {
    return (
      <Grid container justify="center">
        <WalletConnect />
      </Grid>
    );
  }

  const onSubmit = async () => {
    const sigProvider = externalSigProvider
      ? new PublicKey(externalSigProvider)
      : wallet?.publicKey;

    let _feeCollectionPeriod = externalSigProvider
      ? MONTH
      : feeCollectionPeriod
      ? parseFloat(feeCollectionPeriod)
      : null;

    let _feeRatio = externalSigProvider
      ? FEES
      : feeRatio
      ? parseFloat(feeRatio)
      : null;

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
    if (externalSigProvider && !isValidPublicKey(externalSigProvider)) {
      notify({
        message: 'Invalid external signal provider address',
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
      let sourceAssetsKeys: PublicKey[] = [];
      for (let asset of assets) {
        if (!asset.mint) {
          notify({
            message: 'Error creating the token account - mint is undefined',
            variant: 'error',
          });
          return;
        }
        let _key: PublicKey | null = null;
        for (let token of tokenAccounts) {
          if (token.account.data.parsed.info.mint === asset.mint) {
            _key = new PublicKey(token.pubkey);
          }
        }
        if (!_key) {
          await createAssociatedTokenAccount(
            connection,
            wallet,
            new PublicKey(asset.mint),
          );
          _key = await findAssociatedTokenAddress(
            wallet.publicKey,
            new PublicKey(asset.mint),
          );
        }
        sourceAssetsKeys.push(_key);
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
        // @ts-ignore
        sourceAssetsKeys,
        sigProvider,
        amounts,
        2 * marketAddresses.length,
        authorizedMarkets,
        wallet?.publicKey,
        new Numberu64(_feeCollectionPeriod),
        _feeRatio,
      );
      const tx = new Transaction();
      tx.add(...transactionInstructions);
      await sendTransaction({
        transaction: tx,
        wallet: wallet,
        connection: connection,
        sendingMessage: 'Sending create pool instruction...',
      });

      setCreatedPoolSeed(bs58.encode(poolSeed));

      if (isTradingView) {
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

  const handleClickStrategy = (props) => (event) => {
    event.preventDefault();
    setStep(1);
    if (
      ['dcaMonthly', 'dcaWeekly', 'dcaDaily', 'tradingView'].includes(props)
    ) {
      setExternalSigProvider(getSignalProviderByName(props));
    } else if (props === 'custom') {
      setCustom(true);
    }
  };

  return (
    <>
      {step === 0 && (
        <>
          <Typography
            variant="h2"
            align="center"
            className={classes.templateStrategyTitle}
          >
            Select a strategy template
          </Typography>
          <Grid
            container
            direction="row"
            justify="space-evenly"
            alignItems="center"
          >
            {TEMPLATES.map((e) => {
              return (
                <Grid item key={nanoid()}>
                  <TemplateStrategyCard
                    name={e.name}
                    setTemplate={handleClickStrategy(e.key)}
                  />
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
      {step === 1 && (
        <FloatingCard>
          <form onSubmit={onSubmit}>
            {custom && (
              <>
                <Grid container justify="center">
                  <Typography align="center" className={classes.subsection}>
                    Signal Provider
                  </Typography>
                </Grid>
                {!checkedExtSigProvider && (
                  <Grid container justify="center">
                    <TextField
                      disabled
                      id="sol-creator-address"
                      label="Your SOL address"
                      className={classes.textField}
                      value={wallet?.publicKey}
                      InputProps={{
                        classes: {
                          input: classes.input,
                        },
                      }}
                    />
                  </Grid>
                )}
                {checkedExtSigProvider && (
                  <>
                    <Grid
                      container
                      justify="center"
                      alignItems="center"
                      direction="column"
                    >
                      <Grid item className={classes.externalSigProvider}>
                        <Emoji emoji="⚠️⚠️⚠️⚠️⚠️⚠️" />
                      </Grid>
                      <Grid item>
                        <Typography variant="body1" align="center">
                          If you select an external signal provider you will not
                          be able to send trade orders yourself
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container justify="center">
                      <Autocomplete
                        disableClearable={true}
                        onChange={onChangeAutoComplete}
                        options={EXTERNAL_SIGNAL_PROVIDERS}
                        getOptionLabel={(option: ExternalSignalProvider) =>
                          option.name
                        }
                        className={classes.autoComplete}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="External Signal Provider"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                    {externalSigProvider && (
                      <Grid
                        container
                        justify="center"
                        alignItems="center"
                        direction="column"
                      >
                        <Grid item>
                          <Typography variant="body1">
                            Transactions will be cranked by:
                          </Typography>
                        </Grid>
                        <Grid item>
                          <ExplorerLink address={externalSigProvider}>
                            {externalSigProvider}
                          </ExplorerLink>
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}
                {extSigProviderDescription && <>{extSigProviderDescription}</>}
                <Grid
                  container
                  alignItems="center"
                  justify="center"
                  direction="row"
                >
                  <Grid item>
                    <Checkbox
                      disableRipple
                      checked={checkedExtSigProvider}
                      onChange={() => {
                        setCheckedExtSigProvider((prev) => !prev);
                        setExternalSigProvider(null);
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant="body1">
                      Use an external signal provider
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
            {!custom && (
              <>
                {extSigProviderDescription && <>{extSigProviderDescription}</>}
              </>
            )}
            {/* Markets */}
            <Divider
              background="#BA0202"
              width="80%"
              opacity={0.7}
              height="1px"
              marginRight="auto"
              marginLeft="auto"
            />
            <Typography align="center" className={classes.subsection}>
              Serum Markets
            </Typography>
            <Grid container justify="center">
              {marketAddresses.map((m, i) => {
                return (
                  <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item>
                      <MarketInput
                        marketAddresses={marketAddresses}
                        setMarketAddresses={setMarketAddresses}
                        index={i}
                      />
                    </Grid>
                    <Grid item>
                      <DeleteIcon
                        className={classes.remove}
                        onClick={() => removeMarket(i)}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
            <Grid container justify="center" style={{ marginTop: 20 }}>
              <CustomButton
                onClick={() =>
                  setMarketAddresses([
                    ...marketAddresses,
                    FIDA_USDC_MARKET_ADDRESS,
                  ])
                }
              >
                Add Market
              </CustomButton>
            </Grid>
            {/* Assets and min amount */}
            <Divider
              background="#BA0202"
              width="80%"
              opacity={0.7}
              height="1px"
              marginRight="auto"
              marginLeft="auto"
              marginTop="20px"
            />
            <Typography align="center" className={classes.subsection}>
              Initial Assets
            </Typography>
            {assets.map((asset) => {
              return (
                <CoinInput
                  assets={assets}
                  amountLabel={asset.name}
                  mint={asset.mint || ''}
                  setAssets={setAssets}
                  tokenAccounts={tokenAccounts}
                />
              );
            })}
            {/* Select Fees schedule + period*/}
            <Divider
              background="#BA0202"
              width="80%"
              opacity={0.7}
              height="1px"
              marginRight="auto"
              marginLeft="auto"
              marginTop="20px"
            />
            <MouseOverPopOver popOverText="Fees are split 50/50 between the Signal Provider and FIDA buy and burn">
              <Typography align="center" className={classes.subsection}>
                Fees
              </Typography>
            </MouseOverPopOver>

            <Grid container justify="center">
              <TextField
                disabled={!!externalSigProvider}
                InputProps={{
                  classes: {
                    input: classes.input,
                  },
                }}
                className={classes.textField}
                InputLabelProps={{ shrink: true }}
                label={externalSigProvider ? null : 'Fee Collection Period'}
                helperText="Must be in seconds"
                value={!!externalSigProvider ? MONTH : feeCollectionPeriod}
                onChange={onChangeFeeCollectionPeriod}
              />
            </Grid>
            <Grid container justify="center">
              <TextField
                disabled={!!externalSigProvider}
                InputProps={{
                  classes: {
                    input: classes.input,
                  },
                }}
                InputLabelProps={{ shrink: true }}
                className={classes.textField}
                label={externalSigProvider ? null : 'Fee Ratio (%)'}
                helperText="Percentage of the pool that will be deduced for fees each period"
                value={!!externalSigProvider ? FEES : feeRatio}
                onChange={onChangeFeeRatio}
              />
            </Grid>

            {/* Create */}
            <Divider
              background="#BA0202"
              width="80%"
              opacity={0.7}
              height="1px"
              marginRight="auto"
              marginLeft="auto"
              marginTop="20px"
              marginBottom="20px"
            />
            <Grid container justify="center">
              <CustomButton onClick={onSubmit}>
                {loading ? <Spin size={20} /> : 'Create'}
              </CustomButton>
            </Grid>
          </form>
          {createdPoolSeed && (
            <>
              <Divider
                background="#BA0202"
                width="80%"
                opacity={0.7}
                height="1px"
                marginRight="auto"
                marginLeft="auto"
                marginTop="20px"
                marginBottom="20px"
              />
              <Typography
                align="center"
                style={{ marginTop: 20, marginBottom: 20 }}
              >
                Created Pool Seed:
              </Typography>
              <Typography
                align="center"
                className={classes.createdPoolSeed}
                onClick={() => history.push(`/pool/${createdPoolSeed}`)}
              >
                {createdPoolSeed}
              </Typography>
            </>
          )}
          {isTradingView && tradingViewCredentials && (
            <>
              <Typography align="center" className={classes.tvText}>
                <Emoji emoji="🚨" /> TradingView Password: <Emoji emoji="🚨" />
              </Typography>
              <div className={classes.breakWord}>
                <Typography align="center" className={classes.bold}>
                  {tradingViewCredentials}
                </Typography>
              </div>
              <Typography align="center" className={classes.tvText}>
                <Emoji emoji="💾" /> Make sure to save this password in a safe
                place
              </Typography>
            </>
          )}
        </FloatingCard>
      )}
    </>
  );
};

export default CreatePoolCard;
