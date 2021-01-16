import { PublicKey } from '@solana/web3.js';

interface PoolI {
  name: string;
  description: string;
  poolAddress: PublicKey;
  poolBasket: PublicKey[];
  serumMarkets: PublicKey[];
  illustration?: Object;
}

export class Pool {
  name: string;
  description: string;
  poolAddress: PublicKey;
  poolBasket: PublicKey[];
  serumMarkets: PublicKey[];
  illustration?: Object;
  constructor(props: PoolI) {
    this.name = props.name;
    this.description = props.description;
    this.poolAddress = props.poolAddress;
    this.poolBasket = props.poolBasket;
    this.serumMarkets = props.serumMarkets;
    this.illustration = props.illustration;
  }
}

export const poolTest = new Pool({
  name: 'DCA',
  description:
    'img elements must have an alt prop, either with meaningful text, or an empty string for decorative images',
  poolAddress: new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
  poolBasket: [
    new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
    new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
  ],
  serumMarkets: [
    new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
    new PublicKey('FBycjnjoUW9hZh6a4VzkLCoYzFgjQBjHgbBhNuxZv3WA'),
  ],
  illustration: require('../../assets/strategies/dca/dca.svg'),
});
