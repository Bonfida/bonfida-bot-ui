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
import { nanoid } from 'nanoid';

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
          {name}
        </Typography>
      </Grid>
    </Grid>
  );
};

const DepositInput = ({
  amountLabel,
  mint,
  setMint,
  amount,
  setAmount,
  balance,
  coinsList = USE_TOKENS,
  disabled = false,
}: {
  amountLabel: string;
  mint: string;
  setMint: (arg: string) => void;
  amount: string;
  setAmount: any;
  balance: number;
  coinsList?: any;
  disabled?: boolean;
}) => {
  const classes = useStyles();

  const onChangeInput = (e) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed) || parsed < 0) {
      setAmount('');
      return;
    }
    setAmount(
      e.target.value[0] === '0' ? e.target.value.slice(1) : e.target.value,
    );
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
            className={
              amount.length < 10
                ? classes.textField1
                : amount.length < 17
                ? classes.textField2
                : classes.textField3
            }
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
            Balance: {balance?.toLocaleString()}
          </Typography>
          <Select
            className={classes.select}
            onChange={(e) => setMint(e.target.value as string)}
            IconComponent={ExpandMoreIcon}
            value={mint}
          >
            {coinsList.map((t) => {
              return (
                <MenuItem value={t.address.toBase58()} key={nanoid()}>
                  <RenderCoinRow name={t.name} />
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      </Grid>
    </div>
  );
};

export default DepositInput;
