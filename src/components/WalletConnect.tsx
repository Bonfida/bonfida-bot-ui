import React from 'react';
import Button from '@material-ui/core/Button';
import { useWallet } from '../utils/wallet';
import { makeStyles } from '@material-ui/core/styles';
import Trans from './Translation';

const useStyles = makeStyles({
  button: {
    color: 'white',
    background: '#BA0202',
    width: 'auto',
    borderRadius: 0,
    height: '50px',
    transitionDuration: '0s',
    '&:hover': {
      color: 'white',
      background: '#BA0202',
    },
  },
  lock: {
    marginRight: '10px',
  },
});

export default function WalletConnect() {
  const classes = useStyles();
  const { connected, wallet } = useWallet();

  return (
    <React.Fragment>
      <Button
        disableRipple
        onClick={connected ? wallet?.disconnect : wallet?.connect}
        variant="contained"
        className={classes.button}
      >
        {!connected ? <Trans>Connect wallet</Trans> : <Trans>Disconnect</Trans>}
      </Button>
    </React.Fragment>
  );
}
