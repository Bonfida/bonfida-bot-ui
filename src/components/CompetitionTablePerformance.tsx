import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { nanoid } from 'nanoid';
import { roundToDecimal } from '../utils/utils';
import { Grid, Typography } from '@material-ui/core';
import FloatingCard from './FloatingCard';
import Button from './CustomButton';
import { useHistory } from 'react-router-dom';
import {
  useBotCompetitionPerformance,
  BotWithPerf,
} from '../utils/competition/hooks';
import Spin from '../components/Spin';

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

const CompetitionTableRow = ({ pool }: { pool: BotWithPerf | undefined }) => {
  const history = useHistory();
  if (!pool) {
    return <Spin size={20} />;
  }
  return (
    <TableRow>
      <TableCell>{pool?.name}</TableCell>
      <TableCell>{pool?.description}</TableCell>
      <TableCell>{roundToDecimal(pool?.tokenValue, 2)}</TableCell>
      <TableCell>{`${roundToDecimal(pool.performance, 2)}%`}</TableCell>
      <TableCell>
        <Button
          onClick={() => history.push(`/pool/${pool.poolSeed?.toBase58()}`)}
        >
          Trade
        </Button>
      </TableCell>
    </TableRow>
  );
};

const CompetitionTable = () => {
  const classes = useStyles();
  const [bots, botsLoaded] = useBotCompetitionPerformance();
  if (!botsLoaded || !bots) {
    return (
      <>
        <Typography variant="body1" align="center">
          Loading all bots...
        </Typography>
        <Grid container justify="center">
          <Spin size={40} />
        </Grid>
      </>
    );
  }
  return (
    <Grid container justify="center">
      <div className={classes.root}>
        <FloatingCard>
          <TableContainer component={Paper} elevation={0}>
            <Table className={classes.table}>
              <CompetitionTableHead />
              <TableBody>
                {bots
                  // @ts-ignore
                  ?.sort((a, b) => b?.performance - a?.performance)
                  ?.map((b) => {
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
