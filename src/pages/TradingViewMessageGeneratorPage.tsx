import React, { useMemo, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Grid, Typography } from '@material-ui/core';
import { USE_MARKETS } from '../utils/markets';
import {
  generateTradingViewMessage,
  isValidPublicKey,
  useSmallScreen,
} from '../utils/utils';
import FloatingCard from '../components/FloatingCard';
import CustomButton from '../components/CustomButton';
import { notify } from '../utils/notifications';
import CopyableDisplay from '../components/CopyableDisplay';

const SIDES = [{ side: 'Buy' }, { side: 'Sell' }];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridItem: {
      margin: 20,
      width: '90%',
      maxWidth: 300,
    },
  }),
);

const Generator = () => {
  const classes = useStyles();
  const [side, setSide] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [marketName, setMarketName] = useState<string | null>(null);
  const [poolSeed, setPoolSeed] = useState<string | null>(null);
  const [auth, setAuth] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onClick = () => {
    if (!side || !size || !marketName || !poolSeed || !auth) {
      notify({
        message: 'No parameters can be null',
        variant: 'error',
      });
      return;
    }
    const isValidPoolSeed = isValidPublicKey(poolSeed);
    if (!isValidPoolSeed) {
      notify({
        message: 'Invalid pool seed',
        variant: 'error',
      });
      return;
    }
    const parsedSize = parseFloat(size);
    if (isNaN(parsedSize) || parsedSize < 0 || parsedSize > 100) {
      notify({
        message: 'Size need to be between 0 and 100',
        variant: 'error',
      });
      return;
    }
    setMessage(
      generateTradingViewMessage(
        auth,
        poolSeed,
        marketName,
        side.toLowerCase(),
        size,
      ),
    );
  };

  return (
    <>
      <Grid container direction="column" alignItems="center" justify="center">
        <Grid item className={classes.gridItem}>
          <TextField
            label="Pool Seed"
            onChange={(e) => setPoolSeed(e.target.value.trim())}
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <TextField
            label="TradingView Password"
            onChange={(e) => setAuth(e.target.value.trim())}
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <Autocomplete
            disableClearable={true}
            onChange={(e, v, r) => setMarketName(v.name)}
            options={USE_MARKETS}
            getOptionLabel={(option: any) => option.name}
            renderInput={(params) => (
              <TextField {...params} label="Market Name" variant="outlined" />
            )}
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <Autocomplete
            disableClearable={true}
            onChange={(e, v, r) => setSide(v.side)}
            options={SIDES}
            getOptionLabel={(option: any) => option.side}
            renderInput={(params) => (
              <TextField {...params} label="Side" variant="outlined" />
            )}
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <TextField
            label="Size"
            onChange={(e) => setSize(e.target.value.trim())}
          />
        </Grid>
        <Grid item className={classes.gridItem}>
          <CustomButton onClick={onClick}>Generate</CustomButton>
        </Grid>
      </Grid>
      {message && (
        <>
          <Grid container alignItems="center" justify="center">
            <Grid item>{message}</Grid>
            <Grid item>
              <CopyableDisplay text={message} />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

const TradingViewMessageGeneratorPage = () => {
  const smallScreen = useSmallScreen();
  return (
    <Grid container direction="column" alignItems="center" justify="center">
      <Typography align="center" variant="h2">
        TradingView Message Generator
      </Typography>
      <div style={{ width: smallScreen ? '100%' : '30%' }}>
        <FloatingCard>
          <Generator />
        </FloatingCard>
      </div>
    </Grid>
  );
};

export default TradingViewMessageGeneratorPage;
