import React, { useState } from 'react';
import { TV_POOLS } from '../utils/pools';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, TextField } from '@material-ui/core';
import CustomButton from '../components/CustomButton';
import { useHistory } from 'react-router-dom';
import { notify } from '../utils/notifications';
import StrategyCard from '../components/StrategyCard';
import { nanoid } from 'nanoid';
import Modal from '../components/Modal';
import { isValidPublicKey } from '../utils/utils';
import { Translate } from 'react-localize-redux';

const useStyles = makeStyles({
  container: {
    marginTop: 50,
    marginBottom: 50,
  },
  item: {
    padding: 30,
  },
  addCustomPool: {
    fontSize: 20,
    marginRight: '25%',
    marginTop: 40,
  },
  addCustomPoolButton: {
    backgroundColor: '#2178f3',
    color: 'white',
    borderRadius: 0,
    '&:hover': {
      backgroundColor: '#2178f3',
      color: 'white',
    },
    margin: 10,
  },
  dialogGridItem: {
    marginTop: 10,
    marginBottom: 10,
  },
  dialogContainer: {
    padding: 25,
    background: 'white',
  },
  input: {
    fontSize: 15,
  },
});

const CustomPoolDialog = () => {
  const classes = useStyles();
  const history = useHistory();
  const [poolSeed, setPoolSeed] = useState<string | null>(null);

  const onChange = (e) => {
    const input = e.target.value.trim();
    setPoolSeed(input);
  };

  const onClick = () => {
    const isValid = isValidPublicKey(poolSeed);
    if (!isValid) {
      notify({
        message: 'Invalid Pool Seed',
        variant: 'error',
      });
      return;
    }
    history.push(`/pool/${poolSeed}`);
  };

  return (
    <div className={classes.dialogContainer}>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item className={classes.dialogGridItem}>
          <Typography variant="body1">
            <Translate id="explore.customSeed">Custom Pool Seed</Translate>
          </Typography>
        </Grid>
        <Grid item className={classes.dialogGridItem}>
          <TextField
            onChange={onChange}
            value={poolSeed}
            label="Pool Seed"
            InputProps={{ className: classes.input }}
          />
        </Grid>
        <Grid item className={classes.dialogGridItem}>
          <CustomButton onClick={onClick}>
            <Translate id="explore.go">Go</Translate>
          </CustomButton>
        </Grid>
      </Grid>
    </div>
  );
};

const ExplorerPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const tvRows = [...Array(Math.ceil(TV_POOLS.length / 2))];
  const tvProductRows = tvRows.map((row, idx) =>
    TV_POOLS.slice(idx * 2, idx * 2 + 2),
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      <Typography className={classes.addCustomPool} variant="h1" align="center">
        <CustomButton
          className={classes.addCustomPoolButton}
          onClick={() => setOpen(true)}
        >
          <Translate id="explore.addCustomPool">Add Custom Pool</Translate>
        </CustomButton>
        <Modal open={open} setOpen={setOpen}>
          <CustomPoolDialog />
        </Modal>
        <CustomButton
          className={classes.addCustomPoolButton}
          onClick={() => history.push('/create')}
        >
          <Translate id="explore.createPool">Create Pool</Translate>
        </CustomButton>
      </Typography>
      {tvProductRows.map((row) => (
        <Grid
          key={nanoid()}
          className={classes.container}
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={10}
        >
          {row.map((pool, i) => {
            return (
              <Grid item className={classes.item} key={nanoid()}>
                <StrategyCard pool={pool} left={i % 2 === 0 ? true : false} />
              </Grid>
            );
          })}
        </Grid>
      ))}
    </>
  );
};

export default ExplorerPage;
