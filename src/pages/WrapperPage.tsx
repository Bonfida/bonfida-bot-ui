import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { NATIVE_MINT } from '@solana/spl-token';
import { useConnection } from '../utils/connection';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '../utils/wallet';
import { sendTransaction } from '../utils/send';
import Wallet from '@project-serum/sol-wallet-adapter';
import CustomButton from '../components/CustomButton';
import {
  makeCloseAccountTransaction,
  makeCreateWrappedNativeAccountTransaction,
} from '../utils/wapper';
import { useTokenAccounts } from '../utils/tokens';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import FloatingCard from '../components/FloatingCard';
import InputLabel from '@material-ui/core/InputLabel';
import { Typography, Grid } from '@material-ui/core';
import { abbreviateString } from '../utils/utils';
import { nanoid } from 'nanoid';
import TextField from '@material-ui/core/TextField';
import { notify } from '../utils/notifications';
import { useTranslation } from 'react-i18next';
import Trans from '../components/Translation';

const useStyles = makeStyles({
  h2: {
    fontSize: 26,
  },
  select: {
    width: '100%',
    paddingTop: 14,
  },
  h3: {
    fontSize: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  container: {
    width: '50%',
  },
});

const createWrappedNativeAccount = async (
  connection: Connection,
  amount: number,
  wallet: Wallet,
) => {
  const { tx, newAccount } = await makeCreateWrappedNativeAccountTransaction(
    connection,
    amount,
    wallet,
  );

  await sendTransaction({
    transaction: tx,
    wallet: wallet,
    signers: [newAccount],
    connection: connection,
    sendingMessage: 'Creating wrapped account...',
  });
};

const SelectAmount = ({ amount, setAmount }) => {
  const { connected } = useWallet();
  const { t } = useTranslation();
  const onChange = (e) => {
    const parsed = parseFloat(e.target.value.trim());
    if (!isFinite(parsed) || isNaN(parsed)) {
      return;
    }
    setAmount(parsed);
  };
  return (
    <FormControl>
      <TextField
        disabled={!connected}
        value={amount}
        onChange={onChange}
        label={t('Amount to wrap')}
      />
    </FormControl>
  );
};

const SolWrapper = () => {
  const classes = useStyles();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [amount, setAmount] = useState<null | number>(null);
  const onClick = async () => {
    if (!connected) {
      notify({ message: 'Connect your wallet' });
      return;
    }
    if (!amount) {
      notify({ message: 'Invalid amount', variant: 'error' });
      return;
    }
    await createWrappedNativeAccount(
      connection,
      amount * LAMPORTS_PER_SOL,
      wallet,
    );
  };

  return (
    <>
      <Typography className={classes.h3} align="center" variant="h3">
        Wrap
      </Typography>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        direction="column"
        spacing={5}
      >
        <Grid item>
          <SelectAmount amount={amount} setAmount={setAmount} />
        </Grid>
        <Grid item>
          <CustomButton onClick={onClick}>
            <Trans>Wrapp</Trans>
          </CustomButton>
        </Grid>
      </Grid>
    </>
  );
};

const SelectAccount = ({
  tokenAccounts,
  selectedAccount,
  setSelectedAccount,
}) => {
  const { connected } = useWallet();
  const classes = useStyles();
  const handleChange = (event) => {
    setSelectedAccount(event.target.value);
  };
  const noWrappedAccount = tokenAccounts?.length === 0;
  return (
    <>
      <FormControl style={{ minWidth: 200, width: '100%' }}>
        <InputLabel style={{ marginTop: 10, marginRight: 5 }} shrink>
          <Trans>Wrapped SOL Account</Trans>
        </InputLabel>
        <Select
          disabled={!connected || noWrappedAccount}
          className={classes.select}
          value={selectedAccount}
          onChange={handleChange}
        >
          {tokenAccounts?.map((e) => {
            const pubkey = e.pubkey;
            const balance = e.account.data.parsed.info.tokenAmount.uiAmount;
            return (
              <MenuItem key={nanoid()} value={pubkey}>
                {abbreviateString(e.pubkey)} ({balance})
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </>
  );
};

const SolUnwrapper = () => {
  const classes = useStyles();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [tokenAccounts] = useTokenAccounts([NATIVE_MINT]);
  const [selectedAccount, setSelectedAccount] = useState<null | string>(null);

  const onClick = async () => {
    if (!connected) {
      notify({
        message: 'Connect your wallet',
      });
      return;
    }
    if (!selectedAccount) {
      notify({
        message: 'Please select your wrapped account',
        variant: 'error',
      });
      return;
    }
    const tx = makeCloseAccountTransaction(
      new PublicKey(selectedAccount),
      wallet,
    );
    await sendTransaction({
      transaction: tx,
      wallet: wallet,
      connection: connection,
      sendingMessage: 'Sending to native SOL account...',
    });
  };
  return (
    <>
      <Typography className={classes.h3} align="center" variant="h3">
        <Trans>Unwrap</Trans>
      </Typography>
      <Grid
        container
        direction="column"
        justify="space-around"
        alignItems="center"
        spacing={5}
      >
        <Grid item>
          <SelectAccount
            tokenAccounts={tokenAccounts}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
          />
        </Grid>
        <Grid item>
          <CustomButton onClick={onClick}>
            <Trans>Unwrap</Trans>
          </CustomButton>
        </Grid>
      </Grid>
    </>
  );
};

const WrapperPage = () => {
  const classes = useStyles();
  return (
    <Grid container justify="center">
      <div className={classes.container}>
        <FloatingCard>
          <Typography className={classes.h2} variant="h2" align="center">
            <Trans>SOL Wrapper/Unwrapper</Trans>
          </Typography>
          <Grid
            container
            justify="center"
            alignItems="center"
            direction="column"
            spacing={2}
          >
            <Grid item>
              <SolWrapper />
            </Grid>
            <Grid>
              <SolUnwrapper />
            </Grid>
          </Grid>
        </FloatingCard>
      </div>
    </Grid>
  );
};

export default WrapperPage;
