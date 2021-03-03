import React, { useState, useEffect } from 'react';
import { usePoolInfo } from '../utils/pools';
import { PublicKey, Transaction, Account } from '@solana/web3.js';
import { useWallet } from '../utils/wallet';
import Grid from '@material-ui/core/Grid';
import WalletConnect from './WalletConnect';
import FloatingCard from './FloatingCard';
import Emoji from './Emoji';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useConnection } from '../utils/connection';
import CustomButton from './CustomButton';
import { collectFees, BONFIDABOT_PROGRAM_ID } from 'bonfida-bot';
import { notify } from '../utils/notifications';
import Spin from './Spin';
import { sendTransaction } from '../utils/send';

const useStyles = makeStyles((theme: Theme) => createStyles({}));

// Order, collect fees

const CollectFees = ({ poolSeed }: { poolSeed: string }) => {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const onSubmit = async () => {
    try {
      setLoading(true);

      const instructions = await collectFees(
        connection,
        BONFIDABOT_PROGRAM_ID,
        [new PublicKey(poolSeed).toBuffer()],
      );
      const tx = new Transaction();
      const signers: Account[] = [];

      tx.add(...instructions);

      const result = await sendTransaction({
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
        message: 'Error collecting fees',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomButton onClick={onSubmit}>
      {loading ? <Spin size={20} /> : 'Collect Fees'}
    </CustomButton>
  );
};

const SignalProviderCard = ({ poolSeed }: { poolSeed: string }) => {
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const { connected, wallet } = useWallet();

  if (!connected) {
    return (
      <Grid container alignItems="center" justify="center" direction="row">
        <WalletConnect />
      </Grid>
    );
  }
  if (wallet?.publicKey.toBase58() !== poolInfo?.signalProvider.toBase58()) {
    return (
      <FloatingCard>
        <div style={{ width: 500 }}>
          You do not own this pool <Emoji emoji="🤖" />
        </div>
      </FloatingCard>
    );
  }
  return (
    <>
      <FloatingCard>
        <div style={{ width: 500 }}>
          <CollectFees poolSeed={poolSeed} />
        </div>
      </FloatingCard>
    </>
  );
};

export default SignalProviderCard;
