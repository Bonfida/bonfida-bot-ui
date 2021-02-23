import { PublicKey } from '@solana/web3.js';
import dca from '../../assets/icons/illustrations/control.svg';
import rsi from '../../assets/icons/illustrations/line-chart.svg';
import { findMarketFromAddress, findNameFromMint } from '../utils';

export interface Coin {
  name: string;
  mint: PublicKey;
}

export interface Market {
  name: string;
  address: PublicKey;
}

const createMarket = (address: string): Market => {
  return {
    address: new PublicKey(address),
    name: findMarketFromAddress(address),
  };
};

const createCoin = (mint: string): Coin => {
  return {
    mint: new PublicKey(mint),
    name: findNameFromMint(mint),
  };
};

interface PoolI {
  name: string;
  description: string;
  poolAddress: PublicKey;
  basket: Coin[];
  depositCoins: Coin[];
  serumMarkets: Market[];
  illustration?: string;
  keywords?: string[];
}

export class Pool {
  name: string;
  description: string;
  poolAddress: PublicKey;
  basket: Coin[];
  depositCoins: Coin[];
  serumMarkets: Market[];
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
  name: 'DCA Strategy',
  description:
    'Dollar cost average and reduce the impact of volatility of the market.',
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
      mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      name: 'USDC',
    },
    {
      mint: new PublicKey('EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp'),
      name: 'FIDA',
    },
  ],
  serumMarkets: [
    {
      name: 'FIDA/USDC',
      address: new PublicKey('CVfYa8RGXnuDBeGmniCcdkBwoLqVxh92xB1JqgRQx3F'),
    },
  ],
  illustration: dca,
});

export const poolRsi = new Pool({
  name: 'RSI Strategy',
  description:
    'This strategy follows overbought or oversold conditions in a market.',
  poolAddress: new PublicKey('EvXsVnNu9mxo63tPiGNbLy3mwb6Zy4qT59RR62Y2UJW1'),
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
      mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      name: 'USDC',
    },
    {
      mint: new PublicKey('EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp'),
      name: 'FIDA',
    },
  ],
  serumMarkets: [
    {
      name: 'FIDA/USDC',
      address: new PublicKey('CVfYa8RGXnuDBeGmniCcdkBwoLqVxh92xB1JqgRQx3F'),
    },
  ],
  illustration: rsi,
});

export const USE_POOLS = [poolTest, poolRsi];
