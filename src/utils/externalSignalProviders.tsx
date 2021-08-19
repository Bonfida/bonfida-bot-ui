import { ExternalSignalProvider } from './types';
import { PublicKey } from '@solana/web3.js';

export const MONTH = 30 * 24 * 60 * 60;
export const FEES = 0.1;

export const getSignalProviderByName = (name: string) => {
  switch (name) {
    case 'dcaWeekly':
      return '8km6prR9BNjvZFVGRh7YoU2PnsQPn7XnVeYKJfWJvhqa';
    case 'dcaMonthly':
      return '9vsePNS3HfZtLHoP4tPCpa16wdq19DJWzifuMjX7keCP';
    case 'dcaDaily':
      return 'FukKpDC8AX76sHjU8p717qUneDgpR35nHyFjqT8LaZ4x';
    case 'tradingView':
      return '3hhmaQycsGNEocctmkCnTLgZboNeF7bM3DARB63N2BeA';
    default:
      throw new Error('Unknow signal provider name');
  }
};

export const EXTERNAL_SIGNAL_PROVIDERS: ExternalSignalProvider[] = [
  {
    name: 'Weekly DCA (8km...hqa)',
    displayName: 'DCA weekly',
    pubKey: new PublicKey('8km6prR9BNjvZFVGRh7YoU2PnsQPn7XnVeYKJfWJvhqa'),
    description: (
      <>
        Every Sunday at 08:00 UTC, the pool will use 10% of the quote currency
        contained in the pool to perform a DCA strategy on each market.
      </>
    ),
  },
  {
    name: 'Monthly DCA (9vs...eCP)',
    displayName: 'DCA monthly',
    pubKey: new PublicKey('9vsePNS3HfZtLHoP4tPCpa16wdq19DJWzifuMjX7keCP'),
    description: (
      <>
        On the 1st of each month 08:00 UTC, the pool will use 10% of the quote
        currency contained in the pool to perform a DCA strategy on each market.
      </>
    ),
  },
  {
    name: 'Daily DCA (Fuk...Z4x)',
    displayName: 'DCA daily',
    pubKey: new PublicKey('FukKpDC8AX76sHjU8p717qUneDgpR35nHyFjqT8LaZ4x'),
    description: (
      <>
        Every day at 08:00 UTC, the pool will use 10% of the quote currency
        contained in the pool to perform a DCA strategy on each market.
      </>
    ),
  },
  {
    name: 'TradingView Alerts',
    displayName: 'TradingView',
    pubKey: new PublicKey('3hhmaQycsGNEocctmkCnTLgZboNeF7bM3DARB63N2BeA'),
    description: <>Trade on Serum using your own custom TradingView Alerts</>,
  },
];

export const TV_CRANKER = '3hhmaQycsGNEocctmkCnTLgZboNeF7bM3DARB63N2BeA';

export const KNOWN_SIGNAL_PROVIDERS = EXTERNAL_SIGNAL_PROVIDERS.map((e) =>
  e.pubKey.toBase58(),
);

export const poolTitleForExtSigProvider = (
  signalProvider: PublicKey | null | undefined,
) => {
  if (!signalProvider) {
    return null;
  }
  const pool = EXTERNAL_SIGNAL_PROVIDERS.find((e) =>
    e.pubKey.equals(signalProvider),
  );
  if (!pool) {
    return null;
  }
  return pool.displayName;
};

export const getDescriptionFromAddress = (address: PublicKey | null) => {
  if (!address) {
    return null;
  }
  const sigProvider = EXTERNAL_SIGNAL_PROVIDERS.find((sp) =>
    sp.pubKey.equals(address),
  );
  if (!sigProvider) {
    return null;
  }
  return sigProvider.description;
};
