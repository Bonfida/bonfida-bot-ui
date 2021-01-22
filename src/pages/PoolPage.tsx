import React from 'react';
import { poolTest } from '../utils/pools';
import { PoolPanel } from '../components/Pool';
import { useParams } from 'react-router-dom';
import { findPoolFromAddress } from '../utils/utils';

const PoolPage = () => {
  // @ts-ignore
  const { poolAddress } = useParams();
  const pool = findPoolFromAddress(poolAddress);
  return <PoolPanel pool={pool ? pool : poolTest} />;
};

export default PoolPage;
