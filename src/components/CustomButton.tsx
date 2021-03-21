import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

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
  text: {
    textTransform: 'capitalize',
    fontWeight: 'bold',
    padding: '8px',
  },
});

const CustomButton = ({ children, onClick, ...rest }) => {
  const classes = useStyles();
  const { disabled, style, className } = rest;
  return (
    <Button
      disableRipple
      variant="contained"
      className={className ? className : classes.button}
      onClick={onClick}
      disabled={disabled}
      // @ts-ignore
      style={{ ...style }}
    >
      <Typography className={classes.text}>{children}</Typography>
    </Button>
  );
};

export default CustomButton;
