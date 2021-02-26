import { PublicKey } from '@solana/web3.js';
import { useAsyncData } from './fetch-loop';
import {
  fetchPoolInfo,
  BONFIDABOT_PROGRAM_ID,
  fetchPoolBalances,
} from 'bonfida-bot';
import { useConnection } from './connection';
import tuple from 'immutable-tuple';

export const usePoolInfo = (poolSeed: PublicKey) => {
  const connection = useConnection();
  const get = async () => {
    const poolInfo = await fetchPoolInfo(
      connection,
      BONFIDABOT_PROGRAM_ID,
      poolSeed.toBuffer(),
    );
    return poolInfo;
  };
  return useAsyncData(
    get,
    tuple('usePoolInfo', connection, poolSeed.toBase58()),
  );
};

export const usePoolBalance = (poolSeed: PublicKey) => {
  const connection = useConnection();
  const get = async () => {
    const poolBalance = await fetchPoolBalances(
      connection,
      BONFIDABOT_PROGRAM_ID,
      poolSeed.toBuffer(),
    );
    return poolBalance;
  };
  return useAsyncData(
    get,
    tuple('usePoolBalance', connection, poolSeed.toBase58()),
  );
};
