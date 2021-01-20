import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { blue } from '@material-ui/core/colors';
import send from '../assets/components/BalancesTable/send.svg';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { TabPanel } from '../utils/tabs';
import CopyableDisplay from './CopyableDisplay';
import { Typography } from '@material-ui/core';
import { ExplorerLink } from './Link';
import { useConnection } from '../utils/connection';
import { isValidPublicKey } from '../utils/utils';
import { notify } from '../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';
import { sendSplToken } from '../utils/send';
import { useWallet } from '../utils/wallet';
import CircularProgress from '@material-ui/core/CircularProgress';
import CustomButton from './CustomButton';

const useStyles = makeStyles({
  centeredContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  explorerLink: {
    textDecoration: 'none',
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    border: '2.5px solid',
    borderRadius: '20px',
    height: '40px',
    textAlign: 'center',
    width: '100%',
  },
});

export const MINT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(44),
  BufferLayout.u8('decimals'),
  BufferLayout.blob(37),
]);

export function parseMintData(data) {
  let { decimals } = MINT_LAYOUT.decode(data);
  return { decimals };
}

const DepositTab = ({ pubkey }: { pubkey: string }) => {
  const classes = useStyles();
  return (
    <>
      <Typography>Your deposit address:</Typography>
      <ExplorerLink
        address={pubkey}
        // @ts-ignore
        className={classes.explorerLink}
      >
        {pubkey}
      </ExplorerLink>
      <CopyableDisplay text="Some text jnnk" />
    </>
  );
};

const SendTab = ({ pubkey, mint }: { pubkey: string; mint: string }) => {
  const classes = useStyles();
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef<HTMLInputElement | null>(null);
  const connection = useConnection();

  const destinationRef = useRef<HTMLInputElement | null>(null);
  const savedContactRef = useRef<string | null>(null);
  const { wallet } = useWallet();

  const onFinish = async () => {
    setSubmitting(true);
    const destinationString = destinationRef.current?.value;
    if (!isValidPublicKey(destinationString)) {
      notify({ message: 'Invalid public key', variant: 'error' });
      setSubmitting(false);
      return;
    }
    try {
      if (!amountRef.current) {
        notify({ message: 'Invalid amount', variant: 'error' });
        setSubmitting(false);
        return;
      }
      if (!destinationString) {
        notify({ message: 'Invalid destination', variant: 'error' });
        setSubmitting(false);
        return;
      }
      const amount = Math.round(parseFloat(amountRef.current.value));
      let destination: PublicKey;
      let _decimals: number;
      if (!amount || amount <= 0) {
        setSubmitting(false);
        throw new Error('Invalid amount');
      }
      // @ts-ignore
      if (isValidPublicKey(destinationString)) {
        destination = new PublicKey(destinationString);
        const mintInfo = await connection.getAccountInfo(new PublicKey(mint));
        const { decimals } = parseMintData(mintInfo?.data);
        _decimals = decimals;
      } else {
        notify({ message: 'Invalid public key', variant: 'error' });
        setSubmitting(false);
        return;
      }

      const txid = await sendSplToken({
        connection: connection,
        owner: wallet.publicKey,
        // @ts-ignore
        sourceSpl: new PublicKey(pubkey),
        destination: destination,
        amount: amount * Math.pow(10, _decimals),
        wallet: wallet,
        isSol: SOL_MINT === mint,
      });

      notify({ message: 'Transfer successful', variant: 'success', txid });
    } catch (err) {
      console.log(`Error sending the token: ${err}`);
      notify({
        message: 'Error sending the token - Try again',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <form>
        <label htmlFor="amount">Amount:</label>
        <br />
        <input
          id="amount"
          name="amount"
          ref={amountRef}
          className={classes.input}
        />
        <br style={{ height: 20 }} />
        <label htmlFor="destination">Destination:</label>
        <br />
        <input
          id={`destination-${mint}`}
          name="destination"
          ref={destinationRef}
          className={classes.input}
          style={{ width: '400px' }}
        />
        <br />
        <div className={classes.centeredContainer}>
          <CustomButton onClick={() => onFinish()}>
            {submitting ? <CircularProgress size={25} /> : 'Send'}
          </CustomButton>
        </div>
      </form>
    </>
  );
};

const SendReceiveDialogButton = ({
  pubkey,
  mint,
}: {
  pubkey: string;
  mint: string;
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <img src={send} height="40px" />
      </Button>
      <Dialog
        aria-labelledby="simple-dialog-title"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Tabs
          value={value}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
          aria-label="deposit-withdraw-tabs"
          centered
        >
          <Tab label="Deposit" />
          <Tab label="Send" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <DepositTab pubkey={pubkey} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SendTab mint={mint} pubkey={pubkey} />
        </TabPanel>
      </Dialog>
    </>
  );
};

export default SendReceiveDialogButton;
