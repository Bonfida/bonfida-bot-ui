import { PublicKey } from '@solana/web3.js';
import { useAsyncData } from './fetch-loop';
import {
  fetchPoolInfo,
  PoolInfo,
  fetchPoolBalances,
  PoolAssetBalance,
  getPoolsSeedsBySigProvider,
  getPoolTokenMintFromSeed,
  getPoolOrderInfos,
  PoolOrderInfo,
} from 'bonfida-bot';
import { useConnection } from './connection';
import tuple from 'immutable-tuple';
import dca from '../assets/icons/illustrations/control.svg';
import bs58 from 'bs58';
import { getTokenPrice } from './markets';
import { useEffect, useState } from 'react';
import { useWallet } from './wallet';
import { useTokenAccounts } from './tokens';
import { poolTitleForExtSigProvider } from './externalSignalProviders';
import { abbreviateString } from './utils';
import { USE_MARKETS } from './markets';
import { useLocalStorageState } from './utils';

export const TV_PASSWORD_STORAGE_PREFIX = 'tvAuth';
export const CUSTOME_NAME_PREFIX = 'customName';

export interface Pool {
  name: string;
  poolSeed: PublicKey;
  illustration: string;
  description: string;
  mintAddress: PublicKey;
}

export const TV_POOLS: Pool[] = [
  // MACD Strategies
  {
    name: 'MACD BTC',
    poolSeed: new PublicKey('CwAcCoFZRxUppbwU1xp5qv8hUqNvDWasuRdAibKLXnj8'),
    illustration: dca,
    description: 'Daily MACD strategy on BTC/USDC',
    mintAddress: new PublicKey('25XmCiAQX9diUfTA8KwSmUFQRbKByi57VDp2SddVEsZ1'),
  },
  {
    name: 'MACD ETH',
    poolSeed: new PublicKey('7nmoqCBGzHcFgpiDCx25kJp4zLnUMdEnb1k3kAN36YuK'),
    illustration: dca,
    description: 'Daily MACD strategy on ETH/USDC',
    mintAddress: new PublicKey('26ZS2DADN23Yqgi8hRA2bKXdZtqBz9t5uqC15gjpAP7Q'),
  },
  {
    name: 'MACD SRM',
    poolSeed: new PublicKey('2ekyVKS2Sq54mPUwx4eybA3gnrHKR9nBZP6DFRDcZn9j'),
    illustration: dca,
    description: 'Daily MACD strategy on SRM/USDC',
    mintAddress: new PublicKey('4NDwbkYhwZDWbBkVsGUZVqFfok7S4KkoLqAP8y7QqNo2'),
  },
  {
    name: 'MACD FIDA',
    poolSeed: new PublicKey('3u6zrpaW9uRfpVqZYwCAiQLvQpiY1JmCCdvZV8ydro4r'),
    illustration: dca,
    description: 'Daily MACD strategy on FIDA/USDC',
    mintAddress: new PublicKey('DjYdPqYto61n1gBrhnc64s3tEawsLAmTRKwmSxZ5BLc6'),
  },
];

export const USE_POOLS = TV_POOLS;

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
      const _allPoolSeeds = await getPoolsSeedsBySigProvider(connection);
      for (let seed of _allPoolSeeds) {
        try {
          const mint = await getPoolTokenMintFromSeed(seed);
          const hasPoolToken = tokenAccounts.find(
            (acc) => acc.account.data.parsed.info.mint === mint.toBase58(),
          );
          if (!!hasPoolToken) {
            _poolSeeds.push(bs58.encode(seed));
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

export const usePoolOrderInfos = (
  poolSeed: PublicKey | null,
): [PoolOrderInfo[] | null, boolean] => {
  const connection = useConnection();
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState<PoolOrderInfo[] | null>(null);

  useEffect(() => {
    const get = async () => {
      if (!poolSeed) {
        return;
      }
      const _orders = await getPoolOrderInfos(
        connection,
        poolSeed.toBuffer(),
        10,
      );
      setOrders(_orders);
      setLoaded(true);
    };
    get();
  }, [connection]);

  return [orders, loaded];
};

export const usePoolName = (poolSeed: string) => {
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const [customName] = useLocalStorageState(CUSTOME_NAME_PREFIX + poolSeed);
  if (customName) {
    return customName;
  }
  const pool = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
  const poolName =
    pool?.name ||
    poolTitleForExtSigProvider(poolInfo?.signalProvider) ||
    abbreviateString(poolSeed);
  return poolName;
};

export const marketNamesFromPoolInfo = (
  poolInfo: PoolInfo | null | undefined,
) => {
  if (!poolInfo) {
    return null;
  }
  const authorizedMarkets = poolInfo.authorizedMarkets.map((m) => m.toBase58());
  const names = USE_MARKETS.filter(({ address }) =>
    authorizedMarkets.includes(address.toBase58()),
  ).map(({ name }) => name);
  return names;
};

export const saveTradingViewPassword = (poolSeed: string, password: string) => {
  localStorage.setItem(
    TV_PASSWORD_STORAGE_PREFIX + poolSeed,
    JSON.stringify(password),
  );
};

export const saveCustomName = (poolSeed: string, customName: string) => {
  localStorage.setItem(
    CUSTOME_NAME_PREFIX + poolSeed,
    JSON.stringify(customName),
  );
};
