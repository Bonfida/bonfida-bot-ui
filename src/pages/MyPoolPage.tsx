import React from 'react';
import { usePoolSeedsBySigProvider, usePoolSeedsForUser } from '../utils/pools';
import { useWallet } from '../utils/wallet';
import { FancyTable } from './ExplorePage';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, Grid } from '@material-ui/core';
import WalletConnect from '../components/WalletConnect';
import bottomLight from '../assets/components/MyPoolsPage/bottom-light.svg';
import CreatePoolModal from '../components/CreatePoolModal';
import { useState } from 'react';

const useStyles = makeStyles({
  root: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    height: '90%',
  },
  bottomLigt: {
    position: 'absolute',
    transform: 'matrix(-1, 0, 0, 1, 0, 0)',
    filter: 'blur(40px)',
    right: -100,
    bottom: 0,
    zIndex: -1,
  },
  bottomLightContainer: {
    position: 'relative',
    marginBottom: 50,
  },
  h1: {
    color: '#FFFFFF',
    textShadow:
      '0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)',
    fontSize: 68,
    margin: 50,
    fontWeight: 600,
    lineHeight: '107%',
    maxWidth: 1017,
  },
  createButton: {
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    color: '#FFFFFF',
    width: 201,
    height: 56,
    textTransform: 'none',
  },
  h2: {
    color: '#FFFFFF',
    textShadow:
      '0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)',
    fontSize: 42,
    margin: 20,
    fontWeight: 600,
    lineHeight: '107%',
    maxWidth: 1017,
  },
  tableContainer: {
    maxWidth: 980,
  },
  smallScreenContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '90vh',
  },
});

const BottomLight = () => {
  const classes = useStyles();
  return (
    <div className={classes.bottomLightContainer}>
      <img src={bottomLight} className={classes.bottomLigt} alt="" />
    </div>
  );
};

const MyPoolPage = () => {
  const { connected } = useWallet();
  const classes = useStyles();
  const [ownedPoolSeeds, ownedPoolSeedsLoaded] = usePoolSeedsBySigProvider();
  const [allPoolSeeds, allPoolSeedsLoaded] = usePoolSeedsForUser();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  if (!connected) {
    return (
      <div className={classes.smallScreenContainer}>
        <Typography className={classes.h1}>My Pools</Typography>
        <WalletConnect />
      </div>
    );
  }

  return (
    <>
      <div className={classes.root} style={{ width: '60%' }}>
        <Typography align="center" className={classes.h1}>
          My Pools
        </Typography>

        {ownedPoolSeeds && (
          <>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              className={classes.tableContainer}
            >
              <Grid item>
                <Typography className={classes.h2}>
                  Your created pools
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  className={classes.createButton}
                  onClick={() => setOpen(true)}
                >
                  Create a new pool
                </Button>
              </Grid>
            </Grid>
            <FancyTable poolSeeds={ownedPoolSeeds} />
          </>
        )}
        {allPoolSeeds && (
          <div style={{ marginTop: 50 }}>
            <Typography className={classes.h2}>
              Pools you’re participating in
            </Typography>

            <FancyTable
              poolSeeds={allPoolSeeds?.filter(
                (p) => !ownedPoolSeeds?.includes(p),
              )}
            />
          </div>
        )}
      </div>
      {ownedPoolSeedsLoaded && allPoolSeedsLoaded && <BottomLight />}
      <CreatePoolModal modalVisible={open} onClose={handleClose} />
    </>
  );
};

export default MyPoolPage;
