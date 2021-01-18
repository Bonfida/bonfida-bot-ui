import { PublicKey } from '@solana/web3.js';
import dca from '../../assets/strategies/dca.svg';

export interface Coin {
  name: string;
  mint: PublicKey;
}

interface PoolI {
  name: string;
  description: string;
  poolAddress: PublicKey;
  basket: Coin[];
  depositCoins: Coin[];
  serumMarkets: PublicKey[];
  illustration?: string;
  keywords?: string[];
}

export class Pool {
  name: string;
  description: string;
  poolAddress: PublicKey;
  basket: Coin[];
  depositCoins: Coin[];
  serumMarkets: PublicKey[];
  illustration?: string;
  keywords: string[];
  constructor(props: PoolI) {
    this.name = props.name;
    this.description = props.description;
    this.poolAddress = props.poolAddress;
    this.basket = props.basket;
    this.depositCoins = props.depositCoins;
    this.serumMarkets = props.serumMarkets;
    this.illustration = props.illustration;
    this.keywords = props.keywords
      ? [...props.keywords, props.name]
      : [props.name];
  }
}

export const poolTest = new Pool({
  name: 'DCA',
  description:
    'img elements must have an alt prop, either with meaningful text, or an empty string for decorative images',
  poolAddress: new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
  basket: [
    {
      name: 'USDC',
      mint: new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
    },
    {
      name: 'FIDA',
      mint: new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
    },
  ],
  depositCoins: [
    {
      name: 'FIDA',
      mint: new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
    },
  ],
  serumMarkets: [
    new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
    new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
  ],
  illustration: dca,
});
