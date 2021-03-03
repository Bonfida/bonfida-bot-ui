import React from 'react';
import SignalProviderCard from '../components/SignalProviderCard';
import { useParams } from 'react-router-dom';
import { isValidPublicKey } from '../utils/utils';
import Grid from '@material-ui/core/Grid';

const SignalProviderPage = () => {
  const { poolSeed } = useParams<{ poolSeed: string }>();
  if (!isValidPublicKey(poolSeed)) {
    return <>Invalid poolSeed</>;
  }
  return (
    <Grid container justify="center">
      <SignalProviderCard poolSeed={poolSeed} />
    </Grid>
  );
};

export default SignalProviderPage;
