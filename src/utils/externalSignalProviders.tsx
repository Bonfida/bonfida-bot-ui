import { ExternalSignalProvider } from './types';
import { PublicKey } from '@solana/web3.js';
import { Typography } from '@material-ui/core';
import Trans from '../components/Translation';

export const MONTH = 30 * 24 * 60 * 60;
export const FEES = 0.1;

const styles = {
  descriptionTitle: {
    marginTop: 30,
    marginBottom: 30,
    fontSize: 20,
    fontWeight: 600,
  },
  descriptionText: {
    marginBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
};

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
    displayName: 'Custom Weekly DCA',
    pubKey: new PublicKey('8km6prR9BNjvZFVGRh7YoU2PnsQPn7XnVeYKJfWJvhqa'),
    description: (
      <>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionTitle}
        >
          <Trans>Weekly DCA strategy:</Trans>
        </Typography>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionText}
        >
          <Trans>
            Every Sunday at 08:00 UTC, the pool will use 10% of the quote
            currency contained in the pool to perform a DCA strategy on each
            market.
          </Trans>
        </Typography>
      </>
    ),
  },
  {
    name: 'Monthly DCA (9vs...eCP)',
    displayName: 'Custom Monthly DCA',
    pubKey: new PublicKey('9vsePNS3HfZtLHoP4tPCpa16wdq19DJWzifuMjX7keCP'),
    description: (
      <>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionTitle}
        >
          <Trans>Monthly DCA strategy:</Trans>
        </Typography>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionText}
        >
          <Trans>
            On the 1st of each month 08:00 UTC, the pool will use 10% of the
            quote currency contained in the pool to perform a DCA strategy on
            each market.
          </Trans>
        </Typography>
      </>
    ),
  },
  {
    name: 'Daily DCA (Fuk...Z4x)',
    displayName: 'Custom Daily DCA',
    pubKey: new PublicKey('FukKpDC8AX76sHjU8p717qUneDgpR35nHyFjqT8LaZ4x'),
    description: (
      <>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionTitle}
        >
          <Trans>Daily DCA strategy:</Trans>
        </Typography>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionText}
        >
          <Trans>
            Every day at 08:00 UTC, the pool will use 10% of the quote currency
            contained in the pool to perform a DCA strategy on each market.
          </Trans>
        </Typography>
      </>
    ),
  },
  {
    name: 'TradingView Alerts',
    displayName: 'Custom TradingView Alert',
    pubKey: new PublicKey('3hhmaQycsGNEocctmkCnTLgZboNeF7bM3DARB63N2BeA'),
    description: (
      <>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionTitle}
        >
          <Trans>TradingView Alerts</Trans>
        </Typography>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionText}
        >
          <Trans>Trade on Serum using your own custom TradingView Alerts</Trans>
        </Typography>
      </>
    ),
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
