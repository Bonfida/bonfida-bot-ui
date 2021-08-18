import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      borderRadius: 4,
      backgroundColor: '#202430',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }),
);

const CustomModal = ({
  openModal,
  setOpen,
  children,
  disableBackdropClick,
  noPadding,
}: {
  openModal: boolean;
  setOpen: (args: boolean) => void;
  children: React.ReactNode;
  noPadding?: boolean;
  disableBackdropClick?;
}) => {
  const classes = useStyles();
  console.log();
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Modal
        className={classes.modal}
        open={openModal}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        disableBackdropClick={!!disableBackdropClick}
      >
        <Fade in={openModal}>
          <div
            className={classes.paper}
            style={{ padding: noPadding ? 0 : undefined }}
          >
            {children}
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

export default CustomModal;
