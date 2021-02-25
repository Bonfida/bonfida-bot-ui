import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FloatingCard from './FloatingCard';
import Grid from '@material-ui/core/Grid';
import createPoolIcon from '../assets/create/create_robot.svg';
import FormControl from '@material-ui/core/FormControl';
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
import { createPool, BONFIDABOT_PROGRAM_ID, Numberu16 } from 'bonfida-bot';
import { SERUM_PROGRAM_ID } from '../utils/serum';
import { notify } from '../utils/notifications';
import { decimalsFromMint } from '../utils/tokens';

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
});

const CreatePoolCard = () => {
  const classes = useStyles();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [tokenAccounts] = useTokenAccounts();
  const [marketAddresses, setMarketAddresses] = useState<string[]>([
    'FrDavxi4QawYnQY259PVfYUjUvuyPNfqSXbLBqMnbfWJ',
  ]);

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

  const onSubmit = async () => {
    try {
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
        BONFIDABOT_PROGRAM_ID,
        SERUM_PROGRAM_ID,
        wallet?.publicKey,
        // @ts-ignore
        sourceAssetsKeys,
        wallet?.publicKey,
        amounts,
        2 * marketAddresses.length,
        new Numberu16(marketAddresses.length + 1),
        marketAddresses.map((m) => new PublicKey(m)),
        wallet?.publicKey,
      );
      const tx = new Transaction();
      tx.add(...transactionInstructions);
      await sendTransaction({
        transaction: tx,
        wallet: wallet,
        connection: connection,
        sendingMessage: 'Sending create pool instruction...',
      });
    } catch (err) {
      console.warn(`Error creating the pool ${err}`);
      notify({
        message: 'Error creating the pool',
        variant: 'error',
      });
    } finally {
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
              <>
                <Grid
                  container
                  direction="row"
                  justify="space-between"
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
              </>
            );
          })}
        </Grid>
        <Grid container justify="center">
          <CustomButton
            onClick={() =>
              setMarketAddresses([
                ...marketAddresses,
                'FrDavxi4QawYnQY259PVfYUjUvuyPNfqSXbLBqMnbfWJ',
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
          <CustomButton onClick={onSubmit}>Create</CustomButton>
        </Grid>
      </form>
    </FloatingCard>
  );
};

export default CreatePoolCard;
