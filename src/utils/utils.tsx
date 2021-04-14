import { useCallback, useEffect, useMemo, useState } from 'react';
import { Market, TOKEN_MINTS, MARKETS } from '@project-serum/serum';
import { PublicKey, Connection, Account } from '@solana/web3.js';
import BN from 'bn.js';
import { MAINNET_ENDPOINT } from './connection';
import { AWESOME_TOKENS, AWESOME_MARKETS } from '@dr497/awesome-serum-markets';
import { USE_POOLS } from './pools';
import useMediaQuery from '@material-ui/core/useMediaQuery/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import { SERUM_PROGRAM_ID } from 'bonfida-bot';
import bs58 from 'bs58';
import crypto from 'crypto';

const USE_MARKETS = [...MARKETS, ...AWESOME_MARKETS];

const TOKENS = AWESOME_TOKENS.concat(TOKEN_MINTS);

export const BONFIDA_API_URL = process.env.REACT_APP_BONFIDA_API_URL;
export const BONFIDA_API_URL_PERFORMANCE =
  process.env.REACT_APP_BOT_PERFORMANCE;

export const TRADINGVIEW_NEW_CREDENTIALS =
  process.env.REACT_APP_TRADINGVIEW_NEW_CREDENTIALS;

export function isValidPublicKey(key: string | null | undefined) {
  if (!key) {
    return false;
  }
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const percentFormat = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function floorToDecimal(
  value: number,
  decimals: number | undefined | null,
) {
  return decimals ? Math.floor(value * 10 ** decimals) / 10 ** decimals : value;
}

export function roundToDecimal(
  value: number,
  decimals: number | undefined | null,
) {
  return decimals ? Math.round(value * 10 ** decimals) / 10 ** decimals : value;
}

export const roundToDecimal2 = (
  value: number | undefined | null,
  decimals: number | undefined | null,
) => {
  if (!value) {
    return value;
  }
  const strValue = value.toString();
  const indexZero = strValue.indexOf('.') + 1;
  if (indexZero === -1) {
    return roundToDecimal(value, decimals);
  }
  const sliced = strValue.slice(indexZero, -1);
  let indexNonZero = 0;
  for (let i = 0; i < sliced.length; i++) {
    if (sliced[i] !== '0') {
      indexNonZero = i;
      break;
    }
  }
  return roundToDecimal(
    value,
    decimals ? decimals + indexNonZero : indexNonZero,
  );
};

export function getDecimalCount(value): number {
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes('.')
  )
    return value.toString().split('.')[1].length || 0;
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes('e')
  )
    return parseInt(value.toString().split('e-')[1] || '0');
  return 0;
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}

export function getTokenMultiplierFromDecimals(decimals: number): BN {
  return new BN(10).pow(new BN(decimals));
}

const localStorageListeners = {};

export function useLocalStorageStringState(
  key: string,
  defaultState: string | null = null,
): [string | null, (newState: string | null) => void] {
  const state = localStorage.getItem(key) || defaultState;

  const [, notify] = useState(key + '\n' + state);

  useEffect(() => {
    if (!localStorageListeners[key]) {
      localStorageListeners[key] = [];
    }
    localStorageListeners[key].push(notify);
    return () => {
      localStorageListeners[key] = localStorageListeners[key].filter(
        (listener) => listener !== notify,
      );
      if (localStorageListeners[key].length === 0) {
        delete localStorageListeners[key];
      }
    };
  }, [key]);

  const setState = useCallback<(newState: string | null) => void>(
    (newState) => {
      const changed = state !== newState;
      if (!changed) {
        return;
      }

      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, newState);
      }
      localStorageListeners[key]?.forEach((listener) =>
        listener(key + '\n' + newState),
      );
    },
    [state, key],
  );

  return [state, setState];
}

export function useLocalStorageState<T = any>(
  key: string,
  defaultState: T | null = null,
): [T, (newState: T) => void] {
  let [stringState, setStringState] = useLocalStorageStringState(
    key,
    JSON.stringify(defaultState),
  );
  return [
    useMemo(() => stringState && JSON.parse(stringState), [stringState]),
    (newState) => setStringState(JSON.stringify(newState)),
  ];
}

export function useEffectAfterTimeout(effect, timeout) {
  useEffect(() => {
    const handle = setTimeout(effect, timeout);
    return () => clearTimeout(handle);
  });
}

export function useListener(emitter, eventName) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((i) => i + 1);
    emitter.on(eventName, listener);
    return () => emitter.removeListener(eventName, listener);
  }, [emitter, eventName]);
}

export function abbreviateAddress(address: PublicKey | undefined, size = 4) {
  if (!address) {
    return null;
  }
  const base58 = address.toBase58();
  return base58.slice(0, size) + '…' + base58.slice(-size);
}

export function isEqual(obj1, obj2, keys) {
  if (!keys && Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  keys = keys || Object.keys(obj1);
  for (const k of keys) {
    if (obj1[k] !== obj2[k]) {
      // shallow comparison
      return false;
    }
  }
  return true;
}

export function flatten(obj, { prefix = '', restrictTo }) {
  let restrict = restrictTo;
  if (restrict) {
    restrict = restrict.filter((k) => obj.hasOwnProperty(k));
  }
  const result = {};
  (function recurse(obj, current, keys) {
    (keys || Object.keys(obj)).forEach((key) => {
      const value = obj[key];
      const newKey = current ? current + '.' + key : key; // joined key with dot
      if (value && typeof value === 'object') {
        // @ts-ignore
        recurse(value, newKey); // nested object
      } else {
        result[newKey] = value;
      }
    });
  })(obj, prefix, restrict);
  return result;
}

export async function apiPost(
  url: string | null | undefined,
  body: any,
  headers: any,
) {
  if (!url) {
    throw new Error('apiPost - url undefined or null');
  }
  try {
    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    });
    if (!response.ok) {
      throw new Error(`Error apiPost - status ${response.status}`);
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.warn(err);
    throw new Error(`Error apiPost - err ${err}`);
  }
}

export const getBestBidsBestAsks = async (marketAddress: PublicKey) => {
  const ENDPOINT = 'https://solana-api.projectserum.com/';
  const connection = new Connection(ENDPOINT);
  const market = await Market.load(
    connection,
    marketAddress,
    {},
    SERUM_PROGRAM_ID,
  );

  let bids = await market.loadBids(connection);
  let asks = await market.loadAsks(connection);

  return { bestBid: bids.getL2(1)[0][0], bestAsk: asks.getL2(1)[0][0] };
};

export const getPriceFromMarketAddress = async (marketAddress: PublicKey) => {
  const { bestBid, bestAsk } = await getBestBidsBestAsks(marketAddress);
  return (bestAsk + bestBid) / 2;
};

export async function apiGet(path) {
  try {
    let response = await fetch(path);
    if (!response.ok) {
      return [];
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export const formatPercentage = (value) => {
  return `${value > 0 ? '+' : ''}${(
    Math.round(value * 1e4) / 1e2
  ).toString()}%`;
};

export const formatUsd = (value) => {
  if (value < 1e3) {
    return '$' + (Math.round(value * 1e2) / 1e2).toString();
  }
  if (1e3 <= value && value < 1e6) {
    return '$' + (Math.round((value / 1e3) * 1e2) / 1e2).toString() + 'K';
  }
  if (1e6 <= value && value < 1e9) {
    return '$' + (Math.round((value / 1e6) * 1e2) / 1e2).toString() + 'M';
  }
  if (1e9 <= value) {
    return '$' + (Math.round((value / 1e9) * 1e2) / 1e2).toString() + 'B';
  }
};

export const getVariationsFromMarket = async (
  market: string,
): Promise<string> => {
  const result = await apiGet(
    `https://serum-api.bonfida.com/variations/${market}`,
  );
  if (!result.success || !result.data) {
    throw new Error('Error getting price variation');
  }
  return result.data;
};

export const getVolumeFromMarket = async (
  market: string,
): Promise<string | undefined> => {
  const result = await apiGet(
    `https://serum-api.bonfida.com/volumes/${market}`,
  );
  if (!result.success || !result.data) {
    throw new Error('Error getting volumes');
  }
  return formatUsd(result.data[0].volumeUsd);
};

export function format(value, precision) {
  return Math.round(value * precision) / precision;
}

export const numberWithCommas = (x) => {
  return x.toLocaleString();
};

export const rpcRequest = async (method: string, params: any) => {
  try {
    let response = await fetch(MAINNET_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: method,
        params: params,
      }),
    });
    if (!response.ok) {
      return [];
    }
    if (response.status !== 200 || !response.ok) {
      throw new Error(`Error rpcRequest `);
    }
    let json = await response.json();
    return json.result;
  } catch (err) {
    console.error(err);
    throw new Error(`Error rpcRequest = ${err}`);
  }
};

export const findNameFromMint = (mint: string) => {
  return TOKENS.find((token) => token.address.toBase58() === mint)?.name;
};

export const findMarketFromAddress = (address: string | PublicKey) => {
  if (typeof address !== 'string') {
    address = address.toBase58();
  }
  return USE_MARKETS.find((m) => m.address.toBase58() === address);
};

export const isKnownPool = (poolSeed: string | PublicKey) => {
  if (typeof poolSeed !== 'string') {
    poolSeed = poolSeed.toBase58();
  }
  return !!USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
};

export const findPoolFromAddress = (poolSeed: string | PublicKey) => {
  if (typeof poolSeed !== 'string') {
    poolSeed = poolSeed.toBase58();
  }
  return USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
};

export const useSmallScreen = (breakpoint: string = 'sm') => {
  const theme = useTheme();
  // @ts-ignore
  return useMediaQuery(theme.breakpoints.down(breakpoint));
};

export const formatSeconds = (sec: number): string => {
  let min;
  let s;
  let hour;
  let day;
  switch (true) {
    case sec < 60:
      return `${sec} s`;
    case sec < 60 * 60:
      min = Math.floor(sec / 60);
      s = sec % 60;
      return `${min} min ${s} s`;
    case sec < 24 * 60 * 60:
      hour = Math.floor(sec / (60 * 60));
      min = sec % (60 * 60);
      return `${hour} h ${min} min`;
    default:
      day = Math.floor(sec / (24 * 60 * 60));
      hour = sec % (24 * 60 * 60);
      return `${day} day ${hour}h`;
  }
};

export const abbreviateString = (
  s: string | null | undefined,
  size: number = 7,
) => {
  if (!s) {
    return '';
  }
  return s.slice(0, size) + '…' + s.slice(-size);
};

export const postTradingViewCredentials = async (
  pubKey: string,
  poolSeed: string,
) => {
  await apiPost(
    TRADINGVIEW_NEW_CREDENTIALS,
    {
      poolSeed: poolSeed,
      pubKey: pubKey,
    },
    {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': 'https://bots.bonfida.com',
    },
  );
};

export const generateTradingViewCredentials = () => {
  const acc = new Account(crypto.randomBytes(64));
  return {
    pubKey: acc.publicKey.toBase58(),
    password: bs58.encode(acc.secretKey),
  };
};

export const generateTradingViewMessage = (
  auth: string,
  poolSeed: string,
  marketName: string,
  side: string,
  size: string,
) => {
  const message = {
    auth: auth,
    poolSeed: poolSeed,
    marketName: marketName,
    side: side,
    size: size,
  };
  return message;
};

export const timeConverter = (time: number) => {
  const date = new Date(time);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${day}/${month}/${year}`;
};

export const getPoolUrl = (x: string) => {
  switch (x) {
    case 'benson':
      return 'GjrAkn4wu1ijif7SYhnQc4uDMxMdW5X8AW3MLig5X33t';
    default:
      return x;
  }
};
