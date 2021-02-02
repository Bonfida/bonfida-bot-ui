import React from 'react';
import StrategyCard from '../components/StrategyCard';
import { USE_POOLS } from '../utils/pools';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import add from '../assets/add-pool/add.svg';
import { Typography } from '@material-ui/core';
import CustomButton from '../components/CustomButton';

const useStyles = makeStyles({
  container: {
    marginTop: 50,
    marginBottom: 50,
  },
  item: {
    padding: 30,
  },
  addCustomPool: {
    fontSize: 20,
    marginRight: '25%',
    marginTop: 40,
  },
  addCustomPoolButton: {
    backgroundColor: '#2178f3',
    color: 'white',
    borderRadius: 0,
    '&:hover': {
      color: '#2178f3',
      background: 'white',
    },
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
      <Typography className={classes.addCustomPool} variant="h1" align="right">
        <CustomButton
          className={classes.addCustomPoolButton}
          onClick={() => console.log('Add custom pool')}
        >
          Add Custom Pool
        </CustomButton>
      </Typography>

      {productRows.map((row) => (
        <Grid
          className={classes.container}
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={10}
        >
          {row.map((pool, i) => {
            return (
              <Grid item className={classes.item}>
                <StrategyCard pool={pool} left={i % 2 == 0 ? true : false} />
              </Grid>
            );
          })}
        </Grid>
      ))}
    </>
  );
};

export default ExplorerPage;
