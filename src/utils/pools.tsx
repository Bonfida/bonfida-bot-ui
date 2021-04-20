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
import { abbreviateString, apiGet, timeConverter } from './utils';
import { USE_MARKETS } from './markets';
import {
  useLocalStorageState,
  BONFIDA_API_URL_PERFORMANCE,
  roundToDecimal,
} from './utils';
import Link from '../components/Link';
import HelpUrls from './HelpUrls';
import { Trans } from 'react-i18next';

export const TV_PASSWORD_STORAGE_PREFIX = 'tvAuth';
export const CUSTOME_NAME_PREFIX = 'customName';

export interface Pool {
  name: string;
  poolSeed: PublicKey;
  illustration: string | null;
  description: string | JSX.Element;
  shortDescription?: string | JSX.Element;
  mintAddress: PublicKey;
  mainAsset?: ASSETS;
  strategyType?: STRATEGY_TYPES;
  initialPoolTokenUsdValue?: number;
}

export enum STRATEGY_TYPES {
  RSI = 'RSI',
  MACD = 'MACD',
  VOLATILITY_EXPANSION = 'Volatility Expansion',
  SUPER_TREND = 'Super Trend',
  SENTIMENT_BENSON = 'Sentiment Strategy Pro [Benson]',
  COMPENDIUML = 'CompendiuML',
  BART = 'BartBot',
}

export enum ASSETS {
  BTC = 'BTC',
  ETH = 'ETH',
  FIDA = 'FIDA',
  SRM = 'SRM',
  SOL = 'SOL',
}

const styles = {
  b: {
    opacity: 0.75,
  },
};

const superTrendDescription = (
  marketName: string,
  tf: string,
  short: boolean = false,
) => {
  if (short) {
    return (
      <>
        <b style={styles.b}>{{ tf }} Super Trend</b> strategy on{' '}
        <b style={styles.b}>{{ marketName }}</b>. Super Trend is a TradingView
        indicator, you can find more information about...
      </>
    );
  }
  return (
    <Trans i18nKey="superTrend">
      <b style={styles.b}>{tf} Super Trend</b> strategy on{' '}
      <b style={styles.b}>{marketName}</b>. Super Trend is a TradingView
      indicator, you can find more information about it on the{' '}
      <Link external to="https://www.tradingview.com/script/P5Gu6F8k/">
        dedicated page
      </Link>
    </Trans>
  );
};

const rsiDescription = (
  marketName: string,
  tf: string,
  short: boolean = false,
) => {
  if (short) {
    return (
      <>
        <b style={styles.b}>{tf} RSI</b> strategy on{' '}
        <b style={styles.b}>{marketName}</b>. RSI is a momentum oscillator that
        measures the speed and change of price movements...
      </>
    );
  }
  return (
    <Trans i18nKey="rsi">
      <b style={styles.b}>{{ tf }} RSI</b> strategy on{' '}
      <b style={styles.b}>{{ marketName }}</b>. RSI is a momentum oscillator
      that measures the speed and change of price movements, learn more about it
      on the{' '}
      <Link external to="https://www.investopedia.com/terms/r/rsi.asp">
        dedicated page
      </Link>
    </Trans>
  );
};

const macdDescription = (
  marketName: string,
  tf: string,
  short: boolean = false,
) => {
  if (short) {
    return (
      <>
        <b style={styles.b}>{tf} MACD</b> strategy on{' '}
        <b style={styles.b}>{marketName}</b>. MACD is a trend-following momentum
        indicator, learn more about...
      </>
    );
  }
  return (
    <Trans i18nKey="macd">
      <b style={styles.b}>{tf} MACD</b> strategy on{' '}
      <b style={styles.b}>{marketName}</b>. MACD is a trend-following momentum
      indicator, learn more about it on the{' '}
      <Link
        external
        to="https://www.investopedia.com/articles/trading/08/macd-stochastic-double-cross.asp"
      >
        dedicated page
      </Link>
    </Trans>
  );
};

const bensonDescription = (short: boolean = false) => {
  if (short) {
    return (
      <>The bot aggregates exchanges data to identify the market sentiment...</>
    );
  }
  return (
    <Trans i18nKey="benson">
      <div>
        The bot aggregates exchanges spot and future trading data from Binance,
        Coinbase, BitMEX, Bybit and FTX to identify the market sentiment.{' '}
        <b style={styles.b}>Long</b> when the market is in{' '}
        <b style={styles.b}>fear</b> and exit when the market is{' '}
        <b style={styles.b}>optimistic</b>.
      </div>
    </Trans>
  );
};

const volExpansionDescription = (
  marketName: string,
  tf: string,
  short: boolean = false,
) => {
  if (short) {
    return (
      <>
        <b style={styles.b}>{tf} Volatility Expansion Close</b> strategy on{' '}
        <b>{marketName}</b>. Use volatility to catch trends...
      </>
    );
  }
  return (
    <>
      <b style={styles.b}>{tf} Volatility Expansion Close</b> strategy on{' '}
      <b style={styles.b}>{marketName}</b>. Use volatility to catch new trends
      in the market. Learn more about it on the{' '}
      <Link
        external
        to="https://www.forex.academy/volatility-expansion-strategy/#:~:text=The%20Strategy,as%20a%20measure%20of%20volatility."
      >
        dedicated page
      </Link>
    </>
  );
};

const compendiumDescription = () => {
  return (
    <>
      <Link external to={HelpUrls.compendium}>
        CompendiumFi
      </Link>{' '}
      bots are powered by Compendium proprietary machine learning algorithm:
      CompendiuML.
      <br />
      CompendiuML looks at specific longer time frames like 4H candle charts.
      <br />
      The Bonfida integrations feature a specific version of this algorithm with
      the main mission of growing overall user balance. The bot will hold the
      main asset during bullish momentum and hedge to eventually grow overall
      balance while bearish.
    </>
  );
};

const bartBotDescription = () => {
  return (
    <>
      Bartbot is breakout/trend following strategy that aims to capture the
      majority of the move while staying on the sidelines during ranging periods
      to reduce drawdown as much as possible.
    </>
  );
};

export const USE_POOLS: Pool[] = [
  // Super Trend
  {
    name: 'BTC Super Trend',
    poolSeed: new PublicKey('CmGfYkZD7sXp3tCUNKdiUHV2cg2KscqAoY6EMKehNM4S'),
    illustration: null,
    description: superTrendDescription('BTC/USDC', '4H'),
    shortDescription: superTrendDescription('BTC/USDC', '4H', true),
    mintAddress: new PublicKey('BMTwkARS5jTygykkAukwL2GW15kt4pij1kqmBn4oNc62'),
    mainAsset: ASSETS.BTC,
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'ETH Super Trend',
    poolSeed: new PublicKey('Fm9m2muT5pSSsugiq8Ro7XVBnQoPopZpQVLDKgqY71LJ'),
    illustration: null,
    description: superTrendDescription('ETH/USDC', '4H'),
    shortDescription: superTrendDescription('ETH/USDC', '4H', true),
    mintAddress: new PublicKey('BiZh12i7dXcGNBAP774zXoJthS3HhV8gdRXokhdMjdPw'),
    mainAsset: ASSETS.ETH,
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'SRM Super Trend',
    poolSeed: new PublicKey('8uSTbreQ9ywGw3AYA7yP74KBsa78Y3wEEiDfnBKDFss'),
    illustration: null,
    description: superTrendDescription('SRM/USDC', '4H'),
    shortDescription: superTrendDescription('SRM/USDC', '4H', true),
    mintAddress: new PublicKey('3bysFcvbEDwqRKzRYpF6kXEwdwMYiBPWgyHfU3xJxRoN'),
    mainAsset: ASSETS.SRM,
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'FIDA Super Trend',
    poolSeed: new PublicKey('9Wrpzph39RPbkKtgap3xak4Dga7SgHedLwWEcTF2zSpV'),
    illustration: null,
    description: superTrendDescription('FIDA/USDC', '4H'),
    shortDescription: superTrendDescription('FIDA/USDC', '4H', true),
    mintAddress: new PublicKey('AwJYRT7ecgF18rZDatU9DpUGPwB3tYJ3u7jongCumsKA'),
    mainAsset: ASSETS.FIDA,
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  // Benson
  {
    name: 'Sentiment Strategy Pro [Benson]',
    poolSeed: new PublicKey('GjrAkn4wu1ijif7SYhnQc4uDMxMdW5X8AW3MLig5X33t'),
    illustration: null,
    description: bensonDescription(),
    shortDescription: bensonDescription(true),
    mintAddress: new PublicKey('C1a6WeNFZ3bXYP3gA2GKVQKyfHGZ5ecTS7V7m5ykmwLF'),
    mainAsset: ASSETS.BTC,
    strategyType: STRATEGY_TYPES.SENTIMENT_BENSON,
    initialPoolTokenUsdValue: 1,
  },
  // Volatility Expanson
  {
    name: 'Volatility Expansion BTC',
    poolSeed: new PublicKey('5tLDije3S75K8wgwnuk941cQuJGKu6EVAgEwN6jB6WVk'),
    illustration: dca,
    description: volExpansionDescription('4H', 'BTC/USDC'),
    shortDescription: volExpansionDescription('4H', 'BTC/USDC', true),
    mintAddress: new PublicKey('Caj7qWJDHNsjhP9EpcdeGwSeguST8cPwLGRjVdYW2RtH'),
    mainAsset: ASSETS.BTC,
    strategyType: STRATEGY_TYPES.VOLATILITY_EXPANSION,
    initialPoolTokenUsdValue: 1,
  },
  // RSI
  {
    name: 'RSI BTC',
    poolSeed: new PublicKey('CShN6X5S8vKkbECJzZj6M1cKBiMGxKkZyJBmzkBRbUJA'),
    illustration: dca,
    description: rsiDescription('BTC/USDC', '4H'),
    shortDescription: rsiDescription('BTC/USDC', '4H', true),
    mintAddress: new PublicKey('6GZoDMn1UFG16v9KjRUMao5kRZ978v1DGUzAg1ZjyzJu'),
    mainAsset: ASSETS.BTC,
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'RSI ETH',
    poolSeed: new PublicKey('HgBwzZPEQi1fmj9UKdDuHMry15seykh9KQiTnMR5ZkF7'),
    illustration: dca,
    description: rsiDescription('ETH/USDC', '4H'),
    shortDescription: rsiDescription('ETH/USDC', '4H', true),
    mintAddress: new PublicKey('GNPF6P8DNBavyYkhhMMn53hKQVdz9dAJdpLwF7rgWRSe'),
    mainAsset: ASSETS.ETH,
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'RSI SRM',
    poolSeed: new PublicKey('69aKAxbteNuPYeEamWSSsY3QQ58SxW275xftRJHW9wmX'),
    illustration: dca,
    description: rsiDescription('SRM/USDC', '4H'),
    shortDescription: rsiDescription('SRM/USDC', '4H', true),
    mintAddress: new PublicKey('ERsY5zAYGyaMcPTGXZJdk5HKcpW7LQ5joiHbxunm7RzR'),
    mainAsset: ASSETS.SRM,
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'RSI FIDA',
    poolSeed: new PublicKey('Bv3Acsiojxtj15f2tADwRA2VyLsQVm6CQqpaRsH8wHiN'),
    illustration: dca,
    description: rsiDescription('FIDA/USDC', '4H'),
    shortDescription: rsiDescription('FIDA/USDC', '4H', true),
    mintAddress: new PublicKey('HTCjo4azj2x6F1eCWCgV6jr1XsxPu2ig9rQPBkT8p75S'),
    mainAsset: ASSETS.FIDA,
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  // MACD Strategies
  {
    name: 'MACD BTC',
    poolSeed: new PublicKey('CwAcCoFZRxUppbwU1xp5qv8hUqNvDWasuRdAibKLXnj8'),
    illustration: dca,
    description: macdDescription('BTC/USDC', 'Daily'),
    shortDescription: macdDescription('BTC/USDC', 'Daily', true),
    mintAddress: new PublicKey('25XmCiAQX9diUfTA8KwSmUFQRbKByi57VDp2SddVEsZ1'),
    mainAsset: ASSETS.BTC,
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'MACD ETH',
    poolSeed: new PublicKey('7nmoqCBGzHcFgpiDCx25kJp4zLnUMdEnb1k3kAN36YuK'),
    illustration: dca,
    description: macdDescription('ETH/USDC', 'Daily'),
    shortDescription: macdDescription('ETH/USDC', 'Daily', true),
    mintAddress: new PublicKey('26ZS2DADN23Yqgi8hRA2bKXdZtqBz9t5uqC15gjpAP7Q'),
    mainAsset: ASSETS.ETH,
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'MACD SRM',
    poolSeed: new PublicKey('2ekyVKS2Sq54mPUwx4eybA3gnrHKR9nBZP6DFRDcZn9j'),
    illustration: dca,
    description: macdDescription('SRM/USDC', 'Daily'),
    shortDescription: macdDescription('SRM/USDC', 'Daily', true),
    mintAddress: new PublicKey('4NDwbkYhwZDWbBkVsGUZVqFfok7S4KkoLqAP8y7QqNo2'),
    mainAsset: ASSETS.SRM,
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  {
    name: 'MACD FIDA',
    poolSeed: new PublicKey('3u6zrpaW9uRfpVqZYwCAiQLvQpiY1JmCCdvZV8ydro4r'),
    illustration: dca,
    description: macdDescription('FIDA/USDC', 'Daily'),
    shortDescription: macdDescription('FIDA/USDC', 'Daily', true),
    mintAddress: new PublicKey('DjYdPqYto61n1gBrhnc64s3tEawsLAmTRKwmSxZ5BLc6'),
    mainAsset: ASSETS.FIDA,
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  // CompendiumFi
  {
    name: 'CompendiuML Bitcoin 4H',
    poolSeed: new PublicKey('77WNkckkVG1vGePs35azez8C8PqcqwepExZG1kFzpm2m'),
    illustration: null,
    description: compendiumDescription(),
    shortDescription: '',
    mintAddress: new PublicKey('47KQ3vVPa9hRNyo5DkrGfM4Cuva6p1BZ2mi29KMJL4UA'),
    mainAsset: ASSETS.BTC,
    strategyType: STRATEGY_TYPES.COMPENDIUML,
  },
  {
    name: 'CompendiuML SOL 4H',
    poolSeed: new PublicKey('HLSW8oP7aCzUbkBYfYqXTmHNRx1KRGATKuoje1xG8pVb'),
    illustration: null,
    description: compendiumDescription(),
    shortDescription: '',
    mintAddress: new PublicKey('DHJiwcEsSXEhuwqycvUSj1Ja79jhwf46MjmdLdFMKG8x'),
    mainAsset: ASSETS.SOL,
    strategyType: STRATEGY_TYPES.COMPENDIUML,
  },
  {
    name: 'BartBot',
    poolSeed: new PublicKey('HZyfPT9Dun8mSPX9m7ezbedasc8owdtPqHQVDzHtdE1U'),
    illustration: null,
    description: bartBotDescription(),
    shortDescription: '',
    mintAddress: new PublicKey('JCDk3AABR2FCj1WHvAGBBdV14pSy6wJhQFrhrjXMzA8N'),
    mainAsset: ASSETS.BTC,
    strategyType: STRATEGY_TYPES.BART,
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
      try {
        let _usdValue = 0;
        for (let balance of poolBalance) {
          const price = await getTokenPrice(balance.mint);
          _usdValue += price * balance.tokenAmount.uiAmount;
        }
        setUsdValue(_usdValue);
      } catch (err) {
        console.warn(err);
        return null;
      }
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

export const useHistoricalPerformance = (
  poolSeed: string,
): [any | null, boolean] => {
  const get = async () => {
    const result = await apiGet(BONFIDA_API_URL_PERFORMANCE + poolSeed);
    return result?.performance?.map((e) => {
      return {
        time: timeConverter(e.time),
        poolTokenUsdValue: roundToDecimal(e.poolTokenUsdValue, 3),
      };
    });
  };
  return useAsyncData(get, `getHistoricalPerformance-${poolSeed}`);
};
