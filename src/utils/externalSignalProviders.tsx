import { ExternalSignalProvider } from './types';
import { PublicKey } from '@solana/web3.js';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export const MONTH = 30 * 24 * 60 * 60;
export const FEES = 0.01;

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

export const EXTERNAL_SIGNAL_PROVIDERS: ExternalSignalProvider[] = [
  {
    name: 'Weekly DCA (8km...hqa)',
    pubKey: new PublicKey('8km6prR9BNjvZFVGRh7YoU2PnsQPn7XnVeYKJfWJvhqa'),
    description: (
      <>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionTitle}
        >
          Weekly DCA strategy:
        </Typography>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionText}
        >
          Every Sunday at 00:00 UTC, the pool will use 10% of the quote currency
          contained in the pool to perform a DCA strategy on each market.
        </Typography>
      </>
    ),
  },
  {
    name: 'Monthly DCA (9vs...eCP)',
    pubKey: new PublicKey('9vsePNS3HfZtLHoP4tPCpa16wdq19DJWzifuMjX7keCP'),
    description: (
      <>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionTitle}
        >
          Monthly DCA strategy:
        </Typography>
        <Typography
          align="center"
          variant="body1"
          style={styles.descriptionText}
        >
          On the 1st of each month 00:00 UTC, the pool will use 10% of the quote
          currency contained in the pool to perform a DCA strategy on each
          market.
        </Typography>
      </>
    ),
  },
];

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
