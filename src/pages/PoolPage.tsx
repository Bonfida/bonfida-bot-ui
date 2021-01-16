import React from 'react';
import { poolTest } from '../utils/pools';
import { PoolPanel } from '../components/Pool';

const PoolPage = () => {
  const pool = poolTest;
  return <PoolPanel pool={pool} />;
};

export default PoolPage;
