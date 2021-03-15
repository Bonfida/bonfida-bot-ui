import React from 'react';
import SignalProviderCard from '../components/SignalProviderCard';
import { useParams } from 'react-router-dom';
import { isValidPublicKey } from '../utils/utils';
import Grid from '@material-ui/core/Grid';
import { Translate } from 'react-localize-redux';

const SignalProviderPage = () => {
  const { poolSeed } = useParams<{ poolSeed: string }>();
  if (!isValidPublicKey(poolSeed)) {
    return <Translate id="pool.invalidSeed">Invalid Pool Seed</Translate>;
  }
  return (
    <Grid container justify="center">
      <SignalProviderCard poolSeed={poolSeed} />
    </Grid>
  );
};

export default SignalProviderPage;
