import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Pool, usePoolBalance, usePoolUsdBalance } from '../utils/pools';
import { COMPETITION_BOTS } from '../utils/competition/bots';
import { nanoid } from 'nanoid';
import { roundToDecimal } from '../utils/utils';
import { Grid } from '@material-ui/core';
import FloatingCard from './FloatingCard';
import Button from './CustomButton';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    maxWidth: '60%',
  },
  table: {
    background: '#F0E9E7',
  },
});

const CompetitionTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Token Value</TableCell>
        <TableCell>Competition Perf</TableCell>
        <TableCell>Trade</TableCell>
      </TableRow>
    </TableHead>
  );
};

const CompetitionTableRow = ({ pool }: { pool: Pool }) => {
  const [poolBalance] = usePoolBalance(pool.poolSeed);
  const poolUsdBalance = usePoolUsdBalance(poolBalance && poolBalance[1]);
  const history = useHistory();
  const poolSupplyUiAmount = poolBalance && poolBalance[0]?.uiAmount;
  return (
    <TableRow>
      <TableCell>{pool.name}</TableCell>
      <TableCell>{pool.description}</TableCell>
      <TableCell>
        {poolSupplyUiAmount &&
          roundToDecimal(poolUsdBalance / poolSupplyUiAmount, 2)}
      </TableCell>
      <TableCell>
        {pool.initialPoolTokenUsdValue && poolSupplyUiAmount && (
          <>
            {`${
              roundToDecimal(
                1 -
                  poolUsdBalance /
                    poolSupplyUiAmount /
                    pool.initialPoolTokenUsdValue,
                2,
              ) * 100
            }%`}
          </>
        )}
      </TableCell>
      <TableCell>
        <Button
          onClick={() => history.push(`/pool/${pool.poolSeed.toBase58()}`)}
        >
          Trade
        </Button>
      </TableCell>
    </TableRow>
  );
};

const CompetitionTable = () => {
  const classes = useStyles();
  return (
    <Grid container justify="center">
      <div className={classes.root}>
        <FloatingCard>
          <TableContainer component={Paper} elevation={0}>
            <Table className={classes.table}>
              <CompetitionTableHead />
              <TableBody>
                {COMPETITION_BOTS.map((b) => {
                  return <CompetitionTableRow key={nanoid()} pool={b} />;
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </FloatingCard>
      </div>
    </Grid>
  );
};

export default CompetitionTable;
