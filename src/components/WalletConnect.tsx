import React from 'react';
import Button from '@material-ui/core/Button';
import { useWallet } from '../utils/wallet';
import { makeStyles } from '@material-ui/core/styles';
import lock from '../assets/components/WalletConnect/lock.svg';

const useStyles = makeStyles({
  button: {
    color: 'white',
    background: '#BA0202',
    width: 'auto',
    borderRadius: '8px',
    height: '50px',
    '&:hover': {
      background: 'white',
      color: '#BA0202',
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
        onClick={connected ? wallet.disconnect : wallet.connect}
        variant="contained"
        className={classes.button}
      >
        <img src={lock} alt="locked" className={classes.lock} />
        {!connected ? <>Connect wallet</> : <>Disconnect</>}
      </Button>
    </React.Fragment>
  );
}
