import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Typography } from '@material-ui/core';
import { tokenNameFromMint } from '../utils/tokens';
import getCoinIcon from '../utils/icons';
import { useBalanceForMint } from '../utils/tokens';
import { notify } from '../utils/notifications';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  root: {
    borderRadius: 4,
    padding: 10,
  },
  textField1: {
    width: 'auto',
    maxWidth: '100%',
    height: 55,
    '& input:disabled': {
      color: '#F1F1F2',
    },
  },
  textField2: {
    width: 'auto',
    maxWidth: '100%',
    height: 55,
    '& input:disabled': {
      color: '#F1F1F2',
    },
    '& input': {
      fontSize: 20,
    },
  },
  textField3: {
    width: 'auto',
    maxWidth: '100%',
    height: 55,
    '& input:disabled': {
      color: '#F1F1F2',
    },
    '& input': {
      fontSize: 14,
    },
  },
  select: {
    height: 55,
  },
  inputAmount: {
    color: 'black',
    fontWeight: 600,
  },
  inputLabel: {
    color: 'black',
    opacity: 0.5,
  },
  textIcon: {
    color: 'black',
    fontWeight: 600,
  },
  gridContainer: {
    background: 'transparent',
    padding: 15,
    borderRadius: 0,
    border: '1px solid #BA0202',
  },
});

const RenderCoinRow = ({ name }: { name: string }) => {
  const classes = useStyles();
  const _name = name === 'SOL' ? 'Wrapped Sol' : name;
  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="center"
      spacing={3}
    >
      <Grid item>
        <img src={getCoinIcon(name)} height="25px" alt="" />
      </Grid>
      <Grid item>
        <Typography className={classes.textIcon} variant="body1">
          {_name}
        </Typography>
      </Grid>
    </Grid>
  );
};

const CoinInput = ({
  amountLabel,
  mint,
  setAssets,
  assets,
  tokenAccounts,
}: {
  amountLabel: string;
  mint: string;
  setAssets: any;
  assets: any;
  tokenAccounts: any;
}) => {
  const classes = useStyles();
  const balance = useBalanceForMint(tokenAccounts, mint);
  const { t } = useTranslation();
  const onChangeInput = (e) => {
    const parsed = parseFloat(e.target.value);
    if (parsed > balance) {
      notify({
        message: 'Insufficient funds',
        variant: 'error',
      });
      return;
    }
    if (parsed < 0) {
      notify({
        message: 'Invalid input',
        variant: 'error',
      });
      return;
    }
    let newAssets = assets.map((asset) => {
      return {
        name: asset.name,
        mint: asset.mint,
        amount:
          asset.mint === mint
            ? e.target.value[0] === '0' && e.target.value.length > 1
              ? e.target.value.slice(1)
              : isNaN(parsed)
              ? '0'
              : e.target.value
            : asset.amount,
      };
    });
    setAssets(newAssets);
  };

  return (
    <div className={classes.root}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        className={classes.gridContainer}
      >
        <Grid xs={7} item>
          <Typography variant="body1" className={classes.inputLabel}>
            {amountLabel}
          </Typography>
          <TextField
            id={`amount-${mint}`}
            className={classes.textField1}
            value={assets.find((asset) => asset.mint === mint)?.amount || 0}
            onChange={onChangeInput}
            InputProps={{
              className: classes.inputAmount,
            }}
          />
        </Grid>
        <Grid item>
          <Typography variant="body1" className={classes.inputLabel}>
            {t('Balance')}: {balance?.toLocaleString() || 0}
          </Typography>
          <RenderCoinRow name={tokenNameFromMint(mint) || ''} />
        </Grid>
      </Grid>
    </div>
  );
};

export default CoinInput;
