import React, { useState, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FloatingCard from './FloatingCard';
import createPoolIcon from '../assets/create/create_robot.svg';
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
import { createPool, BONFIDABOT_PROGRAM_ID, Numberu64 } from 'bonfida-bot';
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
} from '../utils/externalSignalProviders';
import { ExternalSignalProvider } from '../utils/types';
import { ExplorerLink } from './Link';
import { isValidPublicKey } from '../utils/utils';

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
});

const CreatePoolCard = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [createdPoolAddress, setCreatedPoolAddress] = useState<string | null>(
    null,
  );
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

      const [poolSeed, transactionInstructions] = await createPool(
        connection,
        wallet?.publicKey,
        // @ts-ignore
        sourceAssetsKeys,
        sigProvider,
        amounts,
        2 * marketAddresses.length,
        marketAddresses.map((m) => new PublicKey(m)),
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
      const poolKey = await PublicKey.createProgramAddress(
        [poolSeed],
        BONFIDABOT_PROGRAM_ID,
      );
      setCreatedPoolAddress(poolKey.toBase58());
      setCreatedPoolSeed(bs58.encode(poolSeed));
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
    <FloatingCard>
      <form onSubmit={onSubmit}>
        <Grid container justify="center">
          <img className={classes.img} src={createPoolIcon} alt="" />
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
                  If you select an external signal provider you will not be able
                  to send trade orders yourself
                </Typography>
              </Grid>
            </Grid>
            <Grid container justify="center">
              <Autocomplete
                disableClearable={true}
                onChange={onChangeAutoComplete}
                options={EXTERNAL_SIGNAL_PROVIDERS}
                getOptionLabel={(option: ExternalSignalProvider) => option.name}
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
                    Signals will be provided by:
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
        <Grid container alignItems="center" justify="center" direction="row">
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
              setMarketAddresses([...marketAddresses, FIDA_USDC_MARKET_ADDRESS])
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
        <Typography align="center" className={classes.subsection}>
          Fees
        </Typography>
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
      {createdPoolAddress && createdPoolSeed && (
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
          <Typography align="center">Created Pool Address:</Typography>
          <Typography align="center">{createdPoolAddress}</Typography>
          <Typography align="center">Created Pool Seed:</Typography>
          <Typography align="center">{createdPoolSeed}</Typography>
        </>
      )}
    </FloatingCard>
  );
};

export default CreatePoolCard;
