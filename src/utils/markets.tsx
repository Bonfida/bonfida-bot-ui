import { MARKETS } from '@project-serum/serum';
import { AWESOME_MARKETS } from '@dr497/awesome-serum-markets';
import { tokenMintFromName } from './tokens';

export let USE_MARKETS = MARKETS.filter((e) => !e.deprecated);

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
