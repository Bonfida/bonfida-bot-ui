import React from 'react';
import { poolTest } from '../utils/pools';
import { PoolPanel } from '../components/Pool';
import { useParams } from 'react-router-dom';
import { findPoolFromAddress, isValidPublicKey } from '../utils/utils';

const PoolPage = () => {
  // @ts-ignore
  const { poolSeed } = useParams();
  if (!isValidPublicKey(poolSeed)) {
    return <>Invalid poolSeed</>;
  }
  return <PoolPanel poolSeed={poolSeed} />;
};

export default PoolPage;
