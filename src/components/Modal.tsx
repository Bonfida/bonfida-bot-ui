import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiModal from '@material-ui/core/Modal';

const useStyles = makeStyles({
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#1C274F',
    border: '1px solid #1C274F',
    boxShadow: '0px 4px 12px rgba(19, 26, 53, 0.25)',
    borderRadius: 4,
  },
});

const Modal = ({ children, open, setOpen }) => {
  const classes = useStyles();

  return (
    <>
      <MuiModal open={open} onClose={() => setOpen(false)}>
        <div className={classes.modal}>{children}</div>
      </MuiModal>
    </>
  );
};

export default Modal;
