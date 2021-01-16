import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { Pool } from '../../utils/pools';

const useStyles = makeStyles({
  root: { flex: 1 },
});

const PoolAction = ({ pool }: { pool: Pool }) => {
  return null;
};

const PoolBasketData = ({ pool }: { pool: Pool }) => {
  return null;
};

const PoolDescription = ({ pool }: { pool: Pool }) => {
  return null;
};

export const PoolPanel = ({ pool }: { pool: Pool }) => {
  return (
    <>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid>
          <PoolDescription pool={pool} />
        </Grid>
        <Grid>
          <PoolBasketData pool={pool} />
        </Grid>
      </Grid>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid>
          <PoolAction pool={pool} />
        </Grid>
      </Grid>
    </>
  );
};
