import { MARKETS, TOKEN_MINTS, Market } from '@project-serum/serum';
import { AWESOME_MARKETS } from '@dr497/awesome-serum-markets';
import { tokenMintFromName } from './tokens';
import { Connection, PublicKey } from '@solana/web3.js';
import { SERUM_PROGRAM_ID } from 'bonfida-bot';
import { apiGet } from './utils';

import { abbreviateAddress } from './utils';

export let USE_MARKETS = MARKETS.concat(AWESOME_MARKETS).filter(
  (e) => !e.deprecated,
);

export const getAssetsFromMarkets = (marketAddresses: string[]) => {
  const result = new Set<string>();
  const names = marketAddresses
    .map((m) => USE_MARKETS.find((e) => e.address.toBase58() === m)?.name)
    .filter((e) => e);
  names.map((e) => {
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

export const getMidPrice = async (mintAddress: string) => {
  const token = TOKEN_MINTS.find((a) => a.address.toBase58() === mintAddress);

  if (!token) {
    return 0;
  }

  if (['USDC', 'USDT'].includes(token?.name || '')) {
    return 1.0;
  }

  try {
    const result = await apiGet(
      `https://serum-api.bonfida.com/orderbooks/${token.name}USDC`,
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
