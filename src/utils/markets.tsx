import { MARKETS, TOKEN_MINTS, Market } from '@project-serum/serum';
import { AWESOME_MARKETS } from '@dr497/awesome-serum-markets';
import { tokenMintFromName } from './tokens';
import { Connection, PublicKey } from '@solana/web3.js';
import { USE_TOKENS } from './tokens';
import { abbreviateAddress } from './utils';

export let USE_MARKETS = MARKETS.filter((e) => !e.deprecated).concat(
  AWESOME_MARKETS,
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

export const getMidPrice = async (
  connection: Connection,
  mintAddress: string,
) => {
  const token = TOKEN_MINTS.find((a) => a.address.toBase58() === mintAddress);

  if (!token) {
    return 0;
  }

  if (['USDC', 'USDT'].includes(token?.name || '')) {
    return 1.0;
  }

  const market = USE_MARKETS.find((m) => m.name === `${token?.name}/USDC`);

  if (!market) {
    return 0;
  }

  try {
    const marketTest = await Market.load(
      connection,
      market.address,
      {},
      new PublicKey('EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o'),
    );

    let bids = await marketTest.loadBids(connection);
    let asks = await marketTest.loadAsks(connection);

    return (bids.getL2(1)[0][0] + asks.getL2(1)[0][0]) / 2;
  } catch (err) {
    console.log(`Error getting midPrice for ${market.name}`);
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
