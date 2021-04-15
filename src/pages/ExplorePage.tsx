import React, { useState } from 'react';
import { USE_POOLS, STRATEGY_TYPES, Pool } from '../utils/pools';
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
import Link from '../components/Link';
import Trans from '../components/Translation';
import { useTranslation } from 'react-i18next';

export const RSI_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.RSI,
);

const MACD_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.MACD,
);

export const SUPER_TRENDS_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.SUPER_TREND,
);

const VOLATILITY_EXPANSION_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.VOLATILITY_EXPANSION,
);

const BENSON_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.SENTIMENT_BENSON,
);

const COMPENDIUM_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.COMPENDIUML,
);

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
  createYourOwn: {
    fontSize: 30,
    margin: 20,
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
            <Trans>Custom Pool Seed</Trans>
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
            <Trans>Go</Trans>
          </CustomButton>
        </Grid>
      </Grid>
    </div>
  );
};

export const productRows = (array: Pool[], n: number = 4) => {
  const arrayRows = [...Array(Math.ceil(array.length / n))];
  const arrayProductRows = arrayRows.map((row, idx) =>
    array.slice(idx * n, idx * n + n),
  );
  return arrayProductRows;
};

export const StrategySection = ({
  h2,
  strategiesArray,
}: {
  h2: string;
  strategiesArray: Pool[];
}) => {
  const classes = useStyles();
  const rows = productRows(strategiesArray);
  return (
    <>
      <Typography
        variant="h2"
        align="center"
        style={{ fontSize: '1.38rem', marginTop: '2%' }}
      >
        {h2}
      </Typography>
      {rows.map((row) => (
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

const CreateYourOwn = () => {
  const classes = useStyles();
  return (
    <>
      <Typography align="center" variant="h2" className={classes.createYourOwn}>
        <Trans i18nKey="cannotFind">
          Cannot find your dream strategy?{' '}
          <Link to="/create">Create your own</Link>
        </Trans>
      </Typography>
    </>
  );
};

const ExplorerPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Typography className={classes.addCustomPool} variant="h1" align="center">
        <CustomButton
          className={classes.addCustomPoolButton}
          onClick={() => setOpen(true)}
        >
          <Trans>Add Custom Pool</Trans>
        </CustomButton>
        <Modal open={open} setOpen={setOpen}>
          <CustomPoolDialog />
        </Modal>
        <CustomButton
          className={classes.addCustomPoolButton}
          onClick={() => history.push('/create')}
        >
          <Trans>Create Pool</Trans>
        </CustomButton>
      </Typography>
      <StrategySection
        h2={t('Sentiment Strategy Pro [Benson]')}
        strategiesArray={BENSON_STRATEGIES}
      />
      <StrategySection
        h2={t('CompendiuML')}
        strategiesArray={COMPENDIUM_STRATEGIES}
      />
      <StrategySection h2="RSI Strategies" strategiesArray={RSI_STRATEGIES} />
      <StrategySection
        h2="Super Trend Strategies"
        strategiesArray={SUPER_TRENDS_STRATEGIES}
      />
      <StrategySection h2="MACD Strategies" strategiesArray={MACD_STRATEGIES} />
      <StrategySection
        h2="Volatility Expansion Strategies"
        strategiesArray={VOLATILITY_EXPANSION_STRATEGIES}
      />
      <CreateYourOwn />
    </>
  );
};

export default ExplorerPage;
