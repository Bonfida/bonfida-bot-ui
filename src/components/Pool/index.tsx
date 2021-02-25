import React, { useState, useEffect } from 'react';
import { Pool } from '../../utils/pools';
import FloatingCard from '../FloatingCard';
import CoinInput from '../CoinInputCreateRedeem';
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
} from '../../utils/tokens';
import Divider from '../Divider';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    poolTitle: {
      fontSize: 30,
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

const PoolTitle = ({ poolName }: { poolName: string }) => {
  const classes = useStyles(0);
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <img src={robot} style={{ height: 70 }} />
      </Grid>
      <Grid item>
        <Typography variant="h1" className={classes.poolTitle}>
          {poolName}
        </Typography>
      </Grid>
    </Grid>
  );
};

export const PoolPanel = ({ pool }: { pool: Pool }) => {
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  const [mint, setMint] = useState(
    'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp',
  );
  const [amount, setAmount] = useState('0');
  const [tokenAccounts] = useTokenAccounts();
  const balance = useBalanceForMint(tokenAccounts, mint);

  return (
    <div style={{ width: 700, padding: 20, margin: 20 }}>
      <FloatingCard>
        <VerifiedPool isVerified />

        <PoolTitle poolName={pool.name} />
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
        <CoinInput
          amountLabel={tokenNameFromMint(mint) || ''}
          mint={mint}
          setMint={setMint}
          amount={amount}
          setAmount={setAmount}
          balance={balance}
        />
      </FloatingCard>
    </div>
  );
};
