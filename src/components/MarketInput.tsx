import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Typography } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { USE_TOKENS } from '../utils/tokens';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import getCoinIcon from '../utils/icons';
import { USE_MARKETS } from '../utils/markets';

const useStyles = makeStyles({
  root: {
    borderRadius: 4,
    padding: 10,
    width: 250,
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

const RenderMarketRow = ({ name }: { name: string }) => {
  const classes = useStyles();
  const base = name.split('/')[0];
  const quote = name.split('/')[1];

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="center"
      spacing={3}
    >
      <Grid item>
        <img src={getCoinIcon(base)} height="25px" alt="" />
        <img src={getCoinIcon(quote)} height="25px" alt="" />
      </Grid>
      <Grid item>
        <Typography className={classes.textIcon} variant="body1">
          {name}
        </Typography>
      </Grid>
    </Grid>
  );
};

const MarketInput = ({
  marketAddresses,
  setMarketAddresses,
  index,
  disabled = false,
}: {
  marketAddresses: string[];
  setMarketAddresses: (arg: any) => void;
  index: number;
  disabled?: boolean;
}) => {
  const classes = useStyles();
  const [display, setDisplay] = useState(marketAddresses[index]);

  const onChange = (e) => {
    const old = [...marketAddresses];
    old[index] = e.target.value as string;
    setMarketAddresses([...old]);
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
        <Select
          disabled={disabled}
          className={classes.select}
          onChange={onChange}
          IconComponent={ExpandMoreIcon}
          value={marketAddresses[index]}
        >
          {USE_MARKETS.map((m, i) => {
            return (
              <MenuItem
                value={m.address.toBase58()}
                key={`menu-item-${i}-${m.name}`}
              >
                <RenderMarketRow name={m.name} />
              </MenuItem>
            );
          })}
        </Select>
      </Grid>
    </div>
  );
};

export default MarketInput;
