import React from 'react';
import SignalProviderCard from '../components/SignalProviderCard';
import { useParams } from 'react-router-dom';
import { isValidPublicKey } from '../utils/utils';
import Grid from '@material-ui/core/Grid';
import Trans from '../components/Translation';

const SignalProviderPage = () => {
  const { poolSeed } = useParams<{ poolSeed: string }>();
  if (!isValidPublicKey(poolSeed)) {
    return <Trans>Invalid poolSeed</Trans>;
  }
  return (
    <Grid container justify="center">
      <SignalProviderCard poolSeed={poolSeed} />
    </Grid>
  );
};

export default SignalProviderPage;
