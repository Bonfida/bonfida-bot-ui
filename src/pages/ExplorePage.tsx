import React from 'react';
import StrategyCard from '../components/StrategyCard';
import { USE_POOLS } from '../utils/pools';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  container: {
    marginTop: 50,
    marginBottom: 50,
  },
  item: {
    padding: 30,
  },
});

const ExplorerPage = () => {
  const classes = useStyles();
  const rows = [...Array(Math.ceil(USE_POOLS.length / 2))];
  const productRows = rows.map((row, idx) =>
    USE_POOLS.slice(idx * 2, idx * 2 + 2),
  );
  return (
    <>
      {productRows.map((row) => (
        <Grid
          className={classes.container}
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={10}
        >
          {row.map((pool) => {
            return (
              <Grid item className={classes.item}>
                <StrategyCard pool={pool} />
              </Grid>
            );
          })}
        </Grid>
      ))}
    </>
  );
};

export default ExplorerPage;
