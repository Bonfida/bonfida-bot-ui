import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FloatingCard from './FloatingCard';
import Grid from '@material-ui/core/Grid';
import createPoolIcon from '../assets/create/create_robot.svg';
import TextField from '@material-ui/core/TextField';
import { useWallet } from '../utils/wallet';
import { Typography } from '@material-ui/core';
import { useConnection } from '../utils/connection';
import Divider from './Divider';
import WalletConnect from './WalletConnect';
import MarketInput from './MarketInput';
import CustomButton from './CustomButton';
import { sendTransaction } from '../utils/send';
import DeleteIcon from '@material-ui/icons/Delete';
import { getAssetsFromMarkets } from '../utils/markets';
import { useTokenAccounts } from '../utils/tokens';
import CoinInput from './CoinInputCreatePool';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createPool, BONFIDABOT_PROGRAM_ID, Numberu64 } from 'bonfida-bot';
import { notify } from '../utils/notifications';
import { decimalsFromMint } from '../utils/tokens';
import { FIDA_USDC_MARKET_ADDRESS } from '../utils/markets';
import Spin from './Spin';
import bs58 from 'bs58';
import { nanoid } from 'nanoid';

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
  const [feeRatio, setFeeRatio] = useState<string | null>(null);
  const [feeCollectionPeriod, setFeeCollectionPeriod] = useState<string | null>(
    null,
  );

  const [assets, setAssets] = useState(
    getAssetsFromMarkets(marketAddresses).map((e) => {
      return {
        name: e.name,
        mint: e.mint,
        amount: 0,
      };
    }),
  );

  useEffect(() => {
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

  if (!connected) {
    return (
      <Grid container justify="center">
        <WalletConnect />
      </Grid>
    );
  }

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

  const onSubmit = async () => {
    if (!feeRatio || !feeCollectionPeriod) {
      notify({
        message: 'Invalid fees',
        variant: 'error',
      });
      return;
    }
    if (parseFloat(feeCollectionPeriod) < 604800) {
      notify({
        message: 'Fee period need to be greater than 7 days (604,800s)',
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

      const sourceAssetsKeys = assets
        .map((asset) => {
          for (let token of tokenAccounts) {
            if (token.account.data.parsed.info.mint === asset.mint) {
              return new PublicKey(token.pubkey);
            }
          }
        })
        .filter((e) => e);

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
        wallet?.publicKey,
        amounts,
        2 * marketAddresses.length,
        marketAddresses.map((m) => new PublicKey(m)),
        wallet?.publicKey,
        new Numberu64(parseFloat(feeCollectionPeriod)),
        parseFloat(feeRatio),
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
        {assets.map((asset, index) => {
          return (
            <CoinInput
              index={index}
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
            InputProps={{
              classes: {
                input: classes.input,
              },
            }}
            className={classes.textField}
            label="Fee Collection Period"
            helperText="Must be in seconds"
            value={feeCollectionPeriod}
            onChange={onChangeFeeCollectionPeriod}
          />
        </Grid>
        <Grid container justify="center">
          <TextField
            InputProps={{
              classes: {
                input: classes.input,
              },
            }}
            className={classes.textField}
            label="Fee Ratio (%)"
            helperText="Percentage of the pool that will be deduced for fees each period"
            value={feeRatio}
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
