import React from 'react';
import { PoolPanel } from '../components/Pool';
import { useParams } from 'react-router-dom';
import { isValidPublicKey } from '../utils/utils';
import Grid from '@material-ui/core/Grid';

const PoolPage = () => {
  const { poolSeed } = useParams<{ poolSeed: string }>();
  if (!isValidPublicKey(poolSeed)) {
    return <>Invalid poolSeed</>;
  }
  return (
    <Grid container justify="center">
      <PoolPanel poolSeed={poolSeed} />
    </Grid>
  );
};

export default PoolPage;
