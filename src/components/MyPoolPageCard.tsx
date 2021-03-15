import React, { useMemo } from 'react';
import {
  usePoolSeedsBySigProvider,
  usePoolSeedsForUser,
  usePoolName,
  usePoolInfo,
  marketNamesFromPoolInfo,
} from '../utils/pools';
import { Typography } from '@material-ui/core';
import { useWallet } from '../utils/wallet';
import Grid from '@material-ui/core/Grid';
import Spin from './Spin';
import WalletConnect from './WalletConnect';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import FloatingCard from './FloatingCard';
import CustomButton from './CustomButton';
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import { useHistory } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { PublicKey } from '@solana/web3.js';
import { Translate } from 'react-localize-redux';

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
  owned = false,
}: {
  poolSeed: string;
  owned?: boolean;
}) => {
  const history = useHistory();
  const poolName = usePoolName(poolSeed);
  const [poolInfo, poolInfoLoaded] = usePoolInfo(new PublicKey(poolSeed));

  const marketNames = useMemo(
    () => marketNamesFromPoolInfo(poolInfo)?.join(', '),
    [poolInfoLoaded],
  );

  return (
    <TableRow>
      <TableCell>{owned ? <OwnerTag /> : null}</TableCell>
      <TableCell>{poolName}</TableCell>
      {poolInfo && <TableCell>{marketNames}</TableCell>}
      <TableCell>
        <CustomButton onClick={() => history.push(`/pool/${poolSeed}`)}>
          <Translate id="myPool.poolPage">Pool Page</Translate>
        </CustomButton>
      </TableCell>
      {owned && (
        <TableCell>
          <CustomButton
            onClick={() => history.push(`/signal-provider/${poolSeed}`)}
          >
            <Translate id="myPool.poolPage">Admin Page</Translate>
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

  useMemo(
    () =>
      ownedPoolSeeds?.sort((a, b) => {
        return a.localeCompare(b);
      }),
    [ownedPoolSeedsLoaded],
  );

  useMemo(
    () =>
      allPoolSeeds?.sort((a, b) => {
        return a.localeCompare(b);
      }),
    [allPoolSeedsLoaded],
  );

  const _allPoolSeeds = useMemo(
    () => allPoolSeeds?.filter((p) => !ownedPoolSeeds?.includes(p)),
    [allPoolSeeds?.length],
  );

  if (!connected) {
    return (
      <Grid container alignItems="center" justify="center" direction="row">
        <WalletConnect />
      </Grid>
    );
  }
  if (!ownedPoolSeedsLoaded || !allPoolSeedsLoaded) {
    return (
      <>
        <Grid container alignItems="center" justify="center" direction="column">
          <Grid item>
            <Spin size={50} />
          </Grid>
          <Grid item>
            <Typography variant="body1">
              <Translate id="myPool.loading">
                Loading all your pools... This might take several seconds
              </Translate>
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <>
      <FloatingCard>
        <Typography variant="body1">
          <Translate id="myPool.yourPools">Your Pools</Translate>
        </Typography>
        <Table className={classes.table}>
          <TableBody>
            {ownedPoolSeeds?.map((poolSeed) => {
              return (
                <PoolTableRow key={nanoid()} poolSeed={poolSeed} owned={true} />
              );
            })}
            {_allPoolSeeds?.map((poolSeed) => {
              return (
                <PoolTableRow
                  key={nanoid()}
                  poolSeed={poolSeed}
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
