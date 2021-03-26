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
  BONFIDABOT_PROGRAM_ID,
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
import Link from '../components/Link';
import HelpUrls from './HelpUrls';

export const TV_PASSWORD_STORAGE_PREFIX = 'tvAuth';
export const CUSTOME_NAME_PREFIX = 'customName';

export interface Pool {
  name: string;
  poolSeed: PublicKey;
  illustration: string | null;
  description: string | JSX.Element;
  mintAddress: PublicKey;
}

export const TV_POOLS: Pool[] = [
  // Super Trend
  {
    name: 'BTC Super Trend',
    poolSeed: new PublicKey('CmGfYkZD7sXp3tCUNKdiUHV2cg2KscqAoY6EMKehNM4S'),
    illustration: null,
    description: (
      <>
        <b>4H Super Trend</b> strategy on <b>BTC/USDC</b>. Super Trend is a
        TradingView indicator, you can find more information about it on the{' '}
        <Link external to={HelpUrls.strategies.superTrend}>
          dedicated page
        </Link>
      </>
    ),
    mintAddress: new PublicKey('BMTwkARS5jTygykkAukwL2GW15kt4pij1kqmBn4oNc62'),
  },
  // RSI
  {
    name: 'RSI BTC',
    poolSeed: new PublicKey('CShN6X5S8vKkbECJzZj6M1cKBiMGxKkZyJBmzkBRbUJA'),
    illustration: dca,
    description: (
      <>
        <b>4H RSI</b> strategy on <b>BTC/USDC</b>. RSI is a momentum oscillator
        that measures the speed and change of price movements, learn more about
        it on the{' '}
        <Link external to={HelpUrls.strategies.rsi}>
          dedicated page
        </Link>
      </>
    ),
    mintAddress: new PublicKey('6GZoDMn1UFG16v9KjRUMao5kRZ978v1DGUzAg1ZjyzJu'),
  },
  // SAR
  {
    name: 'Volatility Expansion BTC',
    poolSeed: new PublicKey('5tLDije3S75K8wgwnuk941cQuJGKu6EVAgEwN6jB6WVk'),
    illustration: dca,
    description: (
      <>
        <b>4H Volatility Expansion Close</b> strategy on <b>BTC/USDC</b>. Use
        volatility to catch new trends in the market. Learn more about it on the{' '}
        <Link external to={HelpUrls.strategies.volatilityExpan}>
          dedicated page
        </Link>
      </>
    ),
    mintAddress: new PublicKey('Caj7qWJDHNsjhP9EpcdeGwSeguST8cPwLGRjVdYW2RtH'),
  },
  {
    name: 'RSI ETH',
    poolSeed: new PublicKey('HgBwzZPEQi1fmj9UKdDuHMry15seykh9KQiTnMR5ZkF7'),
    illustration: dca,
    description: (
      <>
        <b>4H RSI</b> strategy on <b>ETH/USDC</b>. RSI is a momentum oscillator
        that measures the speed and change of price movements, learn more about
        it on the{' '}
        <Link external to={HelpUrls.strategies.rsi}>
          dedicated page
        </Link>
      </>
    ),
    mintAddress: new PublicKey('GNPF6P8DNBavyYkhhMMn53hKQVdz9dAJdpLwF7rgWRSe'),
  },
  // MACD Strategies
  {
    name: 'MACD BTC',
    poolSeed: new PublicKey('CwAcCoFZRxUppbwU1xp5qv8hUqNvDWasuRdAibKLXnj8'),
    illustration: dca,
    description: (
      <>
        <b>Daily MACD</b> strategy on <b>BTC/USDC</b>. MACD is a trend-following
        momentum indicator, learn more about it on the{' '}
        <Link external to={HelpUrls.strategies.macd}>
          dedicated page
        </Link>
      </>
    ),
    mintAddress: new PublicKey('25XmCiAQX9diUfTA8KwSmUFQRbKByi57VDp2SddVEsZ1'),
  },
  {
    name: 'MACD ETH',
    poolSeed: new PublicKey('7nmoqCBGzHcFgpiDCx25kJp4zLnUMdEnb1k3kAN36YuK'),
    illustration: dca,
    description: (
      <>
        <b>Daily MACD</b> strategy on <b>ETH/USDC</b>. MACD is a trend-following
        momentum indicator, learn more about it on the{' '}
        <Link external to={HelpUrls.strategies.macd}>
          dedicated page
        </Link>
      </>
    ),
    mintAddress: new PublicKey('26ZS2DADN23Yqgi8hRA2bKXdZtqBz9t5uqC15gjpAP7Q'),
  },
  {
    name: 'MACD SRM',
    poolSeed: new PublicKey('2ekyVKS2Sq54mPUwx4eybA3gnrHKR9nBZP6DFRDcZn9j'),
    illustration: dca,
    description: (
      <>
        <b>Daily MACD</b> strategy on <b>SRM/USDC</b>. MACD is a trend-following
        momentum indicator, learn more about it on the{' '}
        <Link external to={HelpUrls.strategies.macd}>
          dedicated page
        </Link>
      </>
    ),
    mintAddress: new PublicKey('4NDwbkYhwZDWbBkVsGUZVqFfok7S4KkoLqAP8y7QqNo2'),
  },
  {
    name: 'MACD FIDA',
    poolSeed: new PublicKey('3u6zrpaW9uRfpVqZYwCAiQLvQpiY1JmCCdvZV8ydro4r'),
    illustration: dca,
    description: (
      <>
        <b>Daily MACD</b> strategy on <b>FIDA/USDC</b>. MACD is a
        trend-following momentum indicator, learn more about it on the{' '}
        <Link external to={HelpUrls.strategies.macd}>
          dedicated page
        </Link>
      </>
    ),
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

export const getPublicKeyFromSeed = async (poolSeed: PublicKey) => {
  const poolKey = await PublicKey.createProgramAddress(
    [poolSeed.toBuffer()],
    BONFIDABOT_PROGRAM_ID,
  );
  return poolKey;
};

export const usePublicKeyFromSeed = (poolSeed: PublicKey) => {
  const get = async () => {
    return await getPublicKeyFromSeed(poolSeed);
  };
  return useAsyncData(get, `usePublicKeyFromSeed-${poolSeed.toBase58()}`);
};
