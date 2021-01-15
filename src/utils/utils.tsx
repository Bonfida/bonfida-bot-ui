import { useCallback, useEffect, useMemo, useState } from 'react';
import { Market } from '@project-serum/serum';
import { PublicKey, Connection } from '@solana/web3.js';
import BN from 'bn.js';

export function isValidPublicKey(key) {
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

export function abbreviateAddress(address: PublicKey, size = 4) {
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

export async function apiPost(url: string, body: any, headers: any) {
  try {
    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    });
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

export const getFeeRebate = async (walletPublicKey) => {
  await apiPost(
    'https://wallet-api.bonfida.com/fee-rebate',
    {
      publicKey: walletPublicKey,
    },
    { 'Content-Type': 'application/json' },
  );
};

export const getBestBidsBestAsks = async (marketAddress: PublicKey) => {
  const ENDPOINT = 'https://solana-api.projectserum.com/';
  const connection = new Connection(ENDPOINT);
  const market = await Market.load(
    connection,
    marketAddress,
    {},
    new PublicKey('EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o'),
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

export const getMarketTableData = async () => {
  const URL = 'https://wallet-api.bonfida.com/cached/market-table';
  const result = await apiGet(URL);
  if (result.success) {
    return result.data.sort((a, b) => {
      return b.volume - a.volume;
    });
  }
  return [];
};

export const numberWithCommas = (x) => {
  return x.toLocaleString();
};
