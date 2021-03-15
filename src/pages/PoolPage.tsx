import React from 'react';
import { PoolPanel } from '../components/Pool';
import { useParams } from 'react-router-dom';
import { isValidPublicKey } from '../utils/utils';
import Grid from '@material-ui/core/Grid';
import { Translate } from 'react-localize-redux';

const PoolPage = () => {
  const { poolSeed } = useParams<{ poolSeed: string }>();
  if (!isValidPublicKey(poolSeed)) {
    return <Translate id="pool.invalidSeed">Invalid Pool Seed</Translate>;
  }
  return (
    <Grid container justify="center">
      <PoolPanel poolSeed={poolSeed} />
    </Grid>
  );
};

export default PoolPage;
