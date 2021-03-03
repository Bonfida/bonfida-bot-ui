import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Typography } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { USE_TOKENS } from '../utils/tokens';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import getCoinIcon from '../utils/icons';
import Spin from './Spin';

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
  spinContainer: {
    margin: 20,
  },
});

const CoinInput = ({
  amountLabel,
  mint,
  amount,
  setAmount,
  balance,
  coinsList = USE_TOKENS,
  disabled = false,
}: {
  amountLabel: string;
  mint: string | undefined;
  amount: string;
  setAmount: any;
  balance: number;
  coinsList?: any;
  disabled?: boolean;
}) => {
  const classes = useStyles();

  const onChangeInput = (e) => {
    const parsed = parseFloat(e.target.value);
    console.log('input', parsed);
    console.log('isNaN(parsed) || parsed < 0', isNaN(parsed) || parsed < 0);
    if (isNaN(parsed) || parsed < 0) {
      setAmount('');
      return;
    }

    setAmount(
      e.target.value[0] === '0' && e.target.value.length > 1
        ? e.target.value.slice(1)
        : e.target.value,
    );
  };

  if (!mint) {
    return (
      <Grid container justify="center" className={classes.spinContainer}>
        <Spin size={40} />
      </Grid>
    );
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        direction="row"
        justify="space-between"
        className={classes.gridContainer}
      >
        <Grid xs={7} item>
          <Typography variant="body1" className={classes.inputLabel}>
            {amountLabel}
          </Typography>
          <TextField
            id={`amount-${mint}`}
            className={classes.textField1}
            value={amount}
            onChange={onChangeInput}
            InputProps={{
              className: classes.inputAmount,
            }}
            disabled={disabled}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="body1"
            className={classes.inputLabel}
            onClick={() => setAmount(balance)}
          >
            Balance: {balance?.toLocaleString() || 0}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default CoinInput;
