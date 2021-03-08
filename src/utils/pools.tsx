import { PublicKey } from '@solana/web3.js';
import { useAsyncData } from './fetch-loop';
import {
  fetchPoolInfo,
  BONFIDABOT_PROGRAM_ID,
  fetchPoolBalances,
  PoolAssetBalance,
  getPoolsSeedsBySigProvider,
  getPoolTokenMintFromSeed,
} from 'bonfida-bot';
import { useConnection } from './connection';
import tuple from 'immutable-tuple';
import dca from '../assets/icons/illustrations/control.svg';
import rsi from '../assets/icons/illustrations/line-chart.svg';
import bs58 from 'bs58';
import { getTokenPrice } from './markets';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { useWallet } from './wallet';
import { useTokenAccounts } from './tokens';

export interface Pool {
  name: string;
  poolSeed: PublicKey;
  illustration: string;
  description: string;
  mintAddress: PublicKey;
}

export const USE_POOLS: Pool[] = [
  {
    name: 'FIDA/USDC',
    poolSeed: new PublicKey('AHpWNKTasNrJLx9cj3zonVMpqXZw86xe6DQXAPTTJFC1'),
    illustration: dca,
    description:
      'Dollar cost average and reduce the impact of volatility of the market on FIDA/USDC.',
    mintAddress: new PublicKey('ahFRgebqMtH5Y4JT5RYscZKuhmK5btModzKHHpXezn3'),
  },
  {
    name: 'BTC/USDC',
    poolSeed: new PublicKey('7b3RPKFvRHXTq9iXhF8y2WufHojUfVL3R9Kwm5kULTX4'),
    illustration: dca,
    description:
      'Dollar cost average and reduce the impact of volatility of the market on BTC/USDC.',
    mintAddress: new PublicKey('6HAS1NE7i2eo3YGYoGysgFwWih2WmW1uSsCSmrBhHcpz'),
  },
  {
    name: 'SRM/USDC',
    poolSeed: new PublicKey('9yyiNcBv98HRdCf6XdpLjVF3T4KjijFMUDwpLoYhjGLe'),
    illustration: dca,
    description:
      'Dollar cost average and reduce the impact of volatility of the market on SRM/USDC.',
    mintAddress: new PublicKey('DH6Jo6JsoDQ7YWPgFUtt9ZXJVZun3kCyhg4Da5fDeyCa'),
  },
  {
    name: 'FTT/USDC',
    poolSeed: new PublicKey('J2wGXgGNGieAikem2jpuT8DdwhoTtRPFVZ4dH5DaKfQJ'),
    illustration: dca,
    description:
      'Dollar cost average and reduce the impact of volatility of the market on FTT/USDC.',
    mintAddress: new PublicKey('AnVnTDsQqunWe7NDxTRRC441EYfgp4Lehur5wpEPArSt'),
  },
  {
    name: 'ETH/USDC',
    poolSeed: new PublicKey('8JJZWQ8RpmwRB55tsQYWhXh2iDtnJG2gzVoMkvs84NvZ'),
    illustration: dca,
    description:
      'Dollar cost average and reduce the impact of volatility of the market on ETH/USDC.',
    mintAddress: new PublicKey('6mN2vpHXmqXAyeUXv1MZpyGgJQCZGBicRSUKWvhDm6AT'),
  },
];

export const usePoolInfo = (poolSeed: PublicKey) => {
  const connection = useConnection();
  const get = async () => {
    const poolInfo = await fetchPoolInfo(
      connection,
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
        const price = await getTokenPrice(balance.mint);
        _usdValue += price * balance.tokenAmount.uiAmount;
      }
      setUsdValue(_usdValue);
    };
    get();
  }, [connection, poolBalance]);

  return usdValue;
};

export const usePoolSeedsBySigProvider = (): [string[] | null, boolean] => {
  const connection = useConnection();
  const { connected, wallet } = useWallet();
  const [poolSeeds, setPoolSeeds] = useState<string[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const get = async () => {
      if (!connection || !wallet || !connected) {
        return null;
      }
      const _poolSeeds = await getPoolsSeedsBySigProvider(
        connection,
        wallet?.publicKey,
      );
      setPoolSeeds(_poolSeeds.map((e) => bs58.encode(e)));
      setLoaded(true);
    };
    get();
  }, [connection, wallet, connected]);
  return [poolSeeds, loaded];
};

export const usePoolSeedsForUser = (): [string[] | null, boolean] => {
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [tokenAccounts, tokenAccountsLoaded] = useTokenAccounts();
  const [poolSeeds, setPoolSeeds] = useState<string[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const get = async () => {
      if (!connection || !wallet || !connected || !tokenAccounts) {
        return null;
      }
      const _poolSeeds: string[] = [];
      const _allPoolSeeds = await getPoolsSeedsBySigProvider(
        connection,
        BONFIDABOT_PROGRAM_ID,
      );
      for (let seed of _allPoolSeeds) {
        try {
          const mint = await getPoolTokenMintFromSeed(seed);
          const hasPoolToken = tokenAccounts.find(
            (acc) => acc.account.data.parsed.info.mint === mint.toBase58(),
          );
          if (!!hasPoolToken) {
            _poolSeeds.push(mint.toBase58());
          }
        } catch {
          continue;
        }
      }
      setPoolSeeds(_poolSeeds);
      setLoaded(true);
    };
    get();
  }, [connection, connected, wallet, tokenAccountsLoaded]);
  return [poolSeeds, loaded];
};

export const poolNameFromSeed = (poolSeed: string) => {
  const knowPool = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
  if (!knowPool) {
    const size = 7;
    return poolSeed.slice(0, size) + '...' + poolSeed.slice(-size);
  }
  return knowPool.name;
};
