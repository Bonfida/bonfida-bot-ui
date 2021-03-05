import React, { useEffect, useState } from 'react';
import { usePoolSeedsBySigProvider, usePoolSeedsForUser } from '../utils/pools';
import { Typography } from '@material-ui/core';
import { useWallet } from '../utils/wallet';
import Grid from '@material-ui/core/Grid';
import Spin from './Spin';
import WalletConnect from './WalletConnect';
import { USE_POOLS, poolNameFromSeed } from '../utils/pools';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import FloatingCard from './FloatingCard';
import { useBalanceForMint, useTokenAccounts } from '../utils/tokens';
import { getPoolTokenMintFromSeed, BONFIDABOT_PROGRAM_ID } from 'bonfida-bot';
import { PublicKey } from '@solana/web3.js';
import CustomButton from './CustomButton';
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';

const useStyles = makeStyles({
  table: {
    width: '900px',
    marginTop: 30,
  },
  tableText: {
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 24,
    color: 'rgb(0,0,0,0.5)',
  },
  tableTitle: {
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 24,
    color: 'black',
  },
});

const OwnerTag = () => {
  return (
    <Chip
      label="Owner"
      color="primary"
      deleteIcon={<DoneIcon />}
      style={{ backgroundColor: '#51d07b' }}
    />
  );
};

const PoolTableRow = ({
  poolSeed,
  tokenAccounts,
  owned = false,
}: {
  poolSeed: string;
  tokenAccounts: any;
  owned?: boolean;
}) => {
  const classes = useStyles();
  const [mint, setMint] = useState<string | null>(null);

  return (
    <TableRow>
      <TableCell>{owned ? <OwnerTag /> : null}</TableCell>
      <TableCell>{poolNameFromSeed(poolSeed)}</TableCell>
      <TableCell>
        <CustomButton onClick={() => console.log()}>Pool Page</CustomButton>
      </TableCell>
      {owned && (
        <TableCell>
          <CustomButton onClick={() => console.log()}>Admin Page</CustomButton>
        </TableCell>
      )}
    </TableRow>
  );
};

const MyPoolPageCard = () => {
  const classes = useStyles();
  const { wallet, connected } = useWallet();
  const [ownedPoolSeeds, ownedPoolSeedsLoaded] = usePoolSeedsBySigProvider();
  const [allPoolSeeds, allPoolSeedsLoaded] = usePoolSeedsForUser();
  const [tokenAccounts, tokenAccountsLoaded] = useTokenAccounts();

  if (!connected) {
    return (
      <Grid container alignItems="center" justify="center" direction="row">
        <WalletConnect />
      </Grid>
    );
  }
  if (!ownedPoolSeedsLoaded || !allPoolSeedsLoaded || !tokenAccountsLoaded) {
    return (
      <>
        <Grid container alignItems="center" justify="center" direction="column">
          <Grid item>
            <Spin size={50} />
          </Grid>
          <Grid item>
            <Typography variant="body1">
              Loading all your pools... This might take several seconds
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <>
      <FloatingCard>
        <Typography variant="body1">Your Pools</Typography>
        <Table className={classes.table}>
          <TableBody>
            {ownedPoolSeeds?.map((poolSeed) => {
              return (
                <PoolTableRow
                  poolSeed={poolSeed}
                  tokenAccounts={tokenAccounts}
                  owned={true}
                />
              );
            })}
            {allPoolSeeds?.map((poolSeed) => {
              return (
                <PoolTableRow
                  poolSeed={poolSeed}
                  tokenAccounts={tokenAccounts}
                  owned={false}
                />
              );
            })}
          </TableBody>
        </Table>
      </FloatingCard>
    </>
  );
};

export default MyPoolPageCard;
