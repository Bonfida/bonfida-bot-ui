import { PublicKey } from '@solana/web3.js';
import { useAsyncData } from './fetch-loop';
import {
  fetchPoolInfo,
  BONFIDABOT_PROGRAM_ID,
  fetchPoolBalances,
  PoolAssetBalance,
} from 'bonfida-bot';
import { useConnection } from './connection';
import tuple from 'immutable-tuple';
import dca from '../assets/icons/illustrations/control.svg';
import rsi from '../assets/icons/illustrations/line-chart.svg';
import bs58 from 'bs58';
import { getMidPrice } from './markets';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export interface Pool {
  name: string;
  poolSeed: PublicKey;
  illustration: string;
  description: string;
}

export const USE_POOLS: Pool[] = [
  {
    name: 'RSI',
    poolSeed: new PublicKey('HFhJ3k84H3K3iCNHbkTZ657r9fwQGux7czUZavhm4ebV'),
    illustration: rsi,
    description:
      'This strategy follows overbought or oversold conditions in a market.',
  },
  {
    name: 'DCA',
    poolSeed: new PublicKey('HFhJ3k84H3K3iCNHbkTZ657r9fwQGux7czUZavhm4ebV'),
    illustration: dca,
    description:
      'Dollar cost average and reduce the impact of volatility of the market.',
  },
];

export const usePoolInfo = (poolSeed: PublicKey) => {
  const connection = useConnection();
  const get = async () => {
    const poolInfo = await fetchPoolInfo(
      connection,
      BONFIDABOT_PROGRAM_ID,
      new Uint8Array(poolSeed.toBuffer()),
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
      bs58.decode(poolSeed.toBase58()),
    );
    return poolBalance;
  };
  return useAsyncData(
    get,
    tuple('usePoolBalance', connection, poolSeed.toBase58()),
  );
};

export const usePoolTokenSupply = (poolSeed: PublicKey) => {
  const connection = useConnection();
  const get = async () => {
    const poolBalance = await fetchPoolBalances(
      connection,
      BONFIDABOT_PROGRAM_ID,
      bs58.decode(poolSeed.toBase58()),
    );
    return poolBalance[0]?.uiAmount;
  };
  return useAsyncData(
    get,
    tuple('usePoolBalance', connection, poolSeed.toBase58()),
  );
};

export const usePoolUsdBalance = (
  poolBalance: PoolAssetBalance[] | null | undefined,
) => {
  const connection = useConnection();
  const [usdValue, setUsdValue] = useState(0);
  useEffect(() => {
    const get = async () => {
      if (!poolBalance) {
        return null;
      }
      let _usdValue = 0;
      for (let balance of poolBalance) {
        const price = await getMidPrice(connection, balance.mint);
        _usdValue += price * balance.tokenAmount.uiAmount;
      }
      setUsdValue(_usdValue);
    };
    get();
  }, [connection, poolBalance]);

  return usdValue;
};
