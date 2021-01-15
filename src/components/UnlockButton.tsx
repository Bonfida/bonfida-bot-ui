import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import lock from '../assets/lock.svg';

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

const onClick = () => {
  console.log('Clicked');
};

const UnlockButton = () => {
  const classes = useStyles();
  return (
    <Button variant="contained" className={classes.button} onClick={onClick}>
      <img src={lock} alt="locked" className={classes.lock} />
      <Typography>Unlock wallet</Typography>
    </Button>
  );
};

export default UnlockButton;
