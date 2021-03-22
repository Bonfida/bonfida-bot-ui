import { MARKETS, TOKEN_MINTS, Market } from '@project-serum/serum';
import { AWESOME_MARKETS } from '@dr497/awesome-serum-markets';
import { tokenMintFromName } from './tokens';
import { PublicKey } from '@solana/web3.js';
import { apiGet } from './utils';
import { useAsyncData } from './fetch-loop';
import tuple from 'immutable-tuple';
import { abbreviateAddress, BONFIDA_API_URL } from './utils';

export let USE_MARKETS = MARKETS.concat(AWESOME_MARKETS).filter(
  (e) => !e.deprecated,
);

export const FIDA_USDC_MARKET_ADDRESS =
  'E14BKBhDWD4EuTkWj1ooZezesGxMW8LPCps4W5PuzZJo';

export const getAssetsFromMarkets = (marketAddresses: string[]) => {
  const result = new Set<string>();
  const names = marketAddresses
    .map((m) => USE_MARKETS.find((e) => e.address.toBase58() === m)?.name)
    .filter((e) => e);
  names.forEach((e) => {
    // @ts-ignore
    result.add(e?.split('/')[0]);
    // @ts-ignore
    result.add(e?.split('/')[1]);
  });

  return [...result]
    .map((e) => {
      return { mint: tokenMintFromName(e), name: e };
    })
    .filter((e) => e);
};

export const getTokenPrice = async (mintAddress: string) => {
  const token = TOKEN_MINTS.find((a) => a.address.toBase58() === mintAddress);

  if (!token) {
    return 0;
  }

  if (['USDC', 'USDT'].includes(token?.name || '')) {
    return 1.0;
  }

  try {
    const result = await apiGet(
      `${BONFIDA_API_URL}orderbooks/${token.name}USDC`,
    );
    if (!result.success) {
      return 0;
    }
    const { bids, asks } = result.data;
    if (!bids || !asks) {
      return 0;
    }
    return (bids[0].price + asks[0].price) / 2;
  } catch (err) {
    console.log(`Error getting midPrice err`);
    return 0;
  }
};

export const marketNameFromAddress = (address: PublicKey) => {
  const market = USE_MARKETS.find(
    (m) => m.address.toBase58() === address.toBase58(),
  );
  if (!market) {
    return abbreviateAddress(address);
  }
  return market.name;
};

export const marketAssetsFromAddress = (
  address: string | null,
): [string | null, string | null] => {
  if (!address) {
    return [null, null];
  }
  const market = USE_MARKETS.find((m) => m.address.toBase58() === address);
  if (!market) {
    return ['Unknow Token', 'Unknown Token'];
  }
  const split = market.name.split('/');
  return [split[0], split[1]];
};

export const useExpectedSlippage = (
  marketAddress: string | null | undefined,
  orderSize: number | null | undefined,
  side: string,
) => {
  const get = async () => {
    if (!marketAddress || !orderSize) {
      return null;
    }
    let marketName = marketNameFromAddress(new PublicKey(marketAddress));
    if (!marketName) {
      return null;
    }
    marketName = marketName?.split('/')[0] + marketName?.split('/')[1];
    const orderbook = await apiGet(
      `${BONFIDA_API_URL}orderbooks/${marketName}`,
    );
    if (!orderbook.success || !orderbook.data) {
      return null;
    }
    if (side === 'sell') {
      const bids = orderbook.data.bids;
      const { price: bestBidPrice, size: bestBidSize } = bids[0];
      if (orderSize < bestBidSize) {
        return 0;
      }
      let cumSize = bestBidSize;
      for (let row of bids.slice(1)) {
        const { size, price } = row;
        cumSize += size;
        if (cumSize > orderSize) {
          return (price - bestBidPrice) / bestBidPrice;
        }
      }
      return (bids[bids.length - 1][0] - bestBidPrice) / bestBidPrice;
    } else {
      const asks = orderbook.data.asks;
      const { price: bestAskPrice, size: bestAskSize } = asks[0];
      if (orderSize < bestAskSize) {
        return 0;
      }
      let cumSize = bestAskSize;
      for (let row of asks.slice(1)) {
        const { size, price } = row;

        cumSize += size;
        if (cumSize > orderSize) {
          return (price - bestAskPrice) / bestAskPrice;
        }
      }
      return (asks[asks.length - 1][0] - bestAskPrice) / bestAskPrice;
    }
  };
  return useAsyncData(
    get,
    tuple('useExpectedSlippage', marketAddress, orderSize, side),
  );
};

export const useMarketPrice = (marketAddress: string | null) => {
  const get = async () => {
    if (!marketAddress) {
      return null;
    }
    let marketName = marketNameFromAddress(new PublicKey(marketAddress));
    if (!marketName) {
      return null;
    }
    marketName = marketName?.split('/')[0] + marketName?.split('/')[1];
    try {
      const result = await apiGet(`${BONFIDA_API_URL}orderbooks/${marketName}`);
      if (!result.success) {
        return null;
      }
      const { bids, asks } = result.data;
      if (!bids || !asks) {
        return null;
      }
      return (bids[0].price + asks[0].price) / 2;
    } catch (err) {
      console.warn(`Error useMarketPrice ${err}`);
      return null;
    }
  };
  return useAsyncData(get, tuple('useMarketPrice', marketAddress));
};

export const getReferreKey = (market: Market) => {
  let referrerQuoteWallet: PublicKey | null = null;
  const usdc = TOKEN_MINTS.find(({ name }) => name === 'USDC');
  const usdt = TOKEN_MINTS.find(({ name }) => name === 'USDT');

  if (market.supportsReferralFees) {
    if (
      process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS &&
      usdt &&
      market.quoteMintAddress.equals(usdt?.address)
    ) {
      referrerQuoteWallet = new PublicKey(
        process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS,
      );
    }
    if (
      process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS &&
      usdc &&
      market.quoteMintAddress.equals(usdc?.address)
    ) {
      referrerQuoteWallet = new PublicKey(
        process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS,
      );
    }
  }
  return referrerQuoteWallet;
};
