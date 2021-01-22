import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

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
  text: {
    textTransform: 'capitalize',
    fontWeight: 'bold',
    padding: '8px',
  },
});

const CustomButton = ({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: (props: any) => void;
  disabled?: boolean;
}) => {
  const classes = useStyles();
  return (
    <Button
      variant="contained"
      className={classes.button}
      onClick={onClick}
      disabled={disabled}
    >
      <Typography className={classes.text}>{children}</Typography>
    </Button>
  );
};

export default CustomButton;
