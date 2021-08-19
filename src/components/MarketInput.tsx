import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Input, TextField } from '@material-ui/core';
import { USE_MARKETS } from '../utils/markets';
import Autocomplete from '@material-ui/lab/Autocomplete';

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
  autoComplete: {
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
    width: 300,
  },
});

const fn = withStyles({
  root: {
    '& label': {
      color: '#FFFFFF',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#FFFFFF',
    },
    '& .MuiOutlinedInput-root': {
      background: '#181F2B',
      '& fieldset': {
        borderColor: 'rgba(155, 163, 181, 1)',
      },
      '&:hover fieldset': {
        borderColor: '#FFFFFF',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FFFFFF',
      },
      '& .MuiInputBase-input': {
        color: '#C8CCD6',
      },
    },
  },
});

export const CssTextField = fn(TextField);
export const CssInput = fn(Input);

export const MarketInput = ({
  marketAddresses,
  setMarketAddresses,
  index = 0,
  marketsList = USE_MARKETS,
}: {
  marketAddresses: string[];
  setMarketAddresses: (arg: any) => void;
  index?: number;
  disabled?: boolean;
  marketsList?: any;
}) => {
  const classes = useStyles();

  const onChange = (e, v, r) => {
    if (!v) {
      return;
    }
    const old = [...marketAddresses];
    old[index] = v.address.toBase58();
    setMarketAddresses([...old]);
  };

  return (
    <div className={classes.root}>
      <Autocomplete
        disableClearable={true}
        onChange={onChange}
        options={marketsList}
        getOptionLabel={(option: any) => option.name}
        className={classes.autoComplete}
        renderInput={(params) => (
          <CssTextField {...params} label="Market" variant="outlined" />
        )}
      />
    </div>
  );
};

export default MarketInput;
