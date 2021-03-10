import React from 'react';
import { usePoolSeedsBySigProvider, usePoolSeedsForUser } from '../utils/pools';
import { Typography } from '@material-ui/core';
import { useWallet } from '../utils/wallet';
import Grid from '@material-ui/core/Grid';
import Spin from './Spin';
import WalletConnect from './WalletConnect';
import { poolNameFromSeed } from '../utils/pools';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import FloatingCard from './FloatingCard';
import { useTokenAccounts } from '../utils/tokens';
import CustomButton from './CustomButton';
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import { useHistory } from 'react-router-dom';
import { nanoid } from 'nanoid';

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
  const history = useHistory();

  return (
    <TableRow>
      <TableCell>{owned ? <OwnerTag /> : null}</TableCell>
      <TableCell>{poolNameFromSeed(poolSeed)}</TableCell>
      <TableCell>
        <CustomButton onClick={() => history.push(`/pool/${poolSeed}`)}>
          Pool Page
        </CustomButton>
      </TableCell>
      {owned && (
        <TableCell>
          <CustomButton
            onClick={() => history.push(`/signal-provider/${poolSeed}`)}
          >
            Admin Page
          </CustomButton>
        </TableCell>
      )}
    </TableRow>
  );
};

const MyPoolPageCard = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  const [ownedPoolSeeds, ownedPoolSeedsLoaded] = usePoolSeedsBySigProvider();
  const [allPoolSeeds, allPoolSeedsLoaded] = usePoolSeedsForUser();
  const [tokenAccounts, tokenAccountsLoaded] = useTokenAccounts();

  ownedPoolSeeds?.sort((a, b) => {
    return a.localeCompare(b);
  });

  allPoolSeeds?.sort((a, b) => {
    return a.localeCompare(b);
  });

  const _allPoolSeeds = allPoolSeeds?.filter(
    (p) => !ownedPoolSeeds?.includes(p),
  );

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
                  key={nanoid()}
                  poolSeed={poolSeed}
                  tokenAccounts={tokenAccounts}
                  owned={true}
                />
              );
            })}
            {_allPoolSeeds?.map((poolSeed) => {
              return (
                <PoolTableRow
                  key={nanoid()}
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
