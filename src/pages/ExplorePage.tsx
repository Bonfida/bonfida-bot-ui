import React, { useState } from 'react';
import { USE_POOLS, STRATEGY_TYPES, Pool, usePoolStats } from '../utils/pools';
import Grid from '@material-ui/core/Grid';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Typography, TextField, Box, Collapse } from '@material-ui/core';
import CustomButton from '../components/CustomButton';
import { useHistory } from 'react-router-dom';
import { notify } from '../utils/notifications';
import StrategyCard from '../components/StrategyCard';
import { nanoid } from 'nanoid';
import Modal from '../components/Modal';
import { isValidPublicKey, roundToDecimal } from '../utils/utils';
import Link from '../components/Link';
import Trans from '../components/Translation';
import { useTranslation } from 'react-i18next';
import bottomLight from '../assets/components/ExplorePage/bottom-light.svg';
import topLight from '../assets/components/ExplorePage/top-light.svg';
import getImageSource from '../utils/icons';
import '../index.css';

export const RSI_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.RSI,
);

const MACD_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.MACD,
);

export const SUPER_TRENDS_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.SUPER_TREND,
);

const VOLATILITY_EXPANSION_STRATEGIES = USE_POOLS.find(
  (p) => p.strategyType === STRATEGY_TYPES.VOLATILITY_EXPANSION,
);

const BENSON_STRATEGIES = USE_POOLS.find(
  (p) => p.strategyType === STRATEGY_TYPES.SENTIMENT_BENSON,
);

const COMPENDIUM_STRATEGIES = USE_POOLS.filter(
  (p) => p.strategyType === STRATEGY_TYPES.COMPENDIUML,
);

const BARTBOT_STRATEGIES = USE_POOLS.find(
  (p) => p.strategyType === STRATEGY_TYPES.BART,
);

export const OVERHEAD_STRATEGIES = USE_POOLS.filter(
  (p) => p.name.includes('Dreamcatcher') || p.name.includes('Earthshaker'),
);

const useStyles = makeStyles({
  root: {
    display: 'flex',
    paddingTop: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  bottomLigt: {
    position: 'absolute',
    transform: 'matrix(-1, 0, 0, 1, 0, 0)',
    filter: 'blur(40px)',
    right: -600,
    top: -200,
    zIndex: -1,
  },
  bottomLightContainer: {
    position: 'relative',
  },
  topLight: {
    position: 'absolute',
    filter: 'blur(40px)',
    top: -90,
    left: -150,
    zIndex: -1,
  },
  topLightContainer: {
    position: 'relative',
  },
  h1: {
    color: '#FFFFFF',
    textShadow:
      '0px 2px 13px rgba(119, 227, 239, 0.28), 0px 4px 26px rgba(119, 227, 239, 0.34)',
    fontSize: 68,
    margin: 10,
    fontWeight: 600,
    lineHeight: '107%',
    maxWidth: 1017,
  },
  accordionHeadText: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '115%',
    color: '#FFFFFF',
  },
  rowText: {
    fontWeight: 400,
    fontSize: 18,
    lineHeight: '115%',
    color: '#FFFFFF',
  },
  up: {
    color: '#4EDC76',
    fontWeight: 400,
    fontSize: 18,
    lineHeight: '115%',
  },
  down: {
    color: '#EB5252',
    fontWeight: 400,
    fontSize: 18,
    lineHeight: '115%',
  },
  buttonContainer: {
    background: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    borderRadius: 4,
    width: 190,
    height: 32,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    margin: 1,
    borderRadius: 4,
    width: 188,
    height: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  assetContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  assetItems: {
    marginLeft: 3,
    marginRight: 3,
  },
  blueText: {
    color: '#77E3EF',
    lineHeight: '115%',
    fontSize: 14,
    fontWeight: 800,
  },
  thead: {
    background: '#121838',
    borderRadius: 8,
    padding: 10,
    display: 'table',
  },
  trHead: {
    background: '#121838',
    borderRadius: 8,
    padding: 10,
  },
  tr: {
    background: '#121838',
    borderRadius: 8,
    padding: 10,
    '&:hover': {
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.07)',
    },
  },
  th: {
    padding: 15,
    '&:first-child': {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    '&:last-child': {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
  },
  td: {
    padding: 15,
    '&:first-child': {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    '&:last-child': {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
  },
  tdMultipleAssets: {
    padding: 15,
  },
  trMultipleAssets: {
    '&:hover': {
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.07)',
    },
  },
});

const BottomLight = () => {
  const classes = useStyles();
  return (
    <div className={classes.bottomLightContainer}>
      <img src={bottomLight} className={classes.bottomLigt} />
    </div>
  );
};

const TopLight = () => {
  const classes = useStyles();
  return (
    <div className={classes.topLightContainer}>
      <img src={topLight} className={classes.topLight} />
    </div>
  );
};

const Title = () => {
  const classes = useStyles();
  return (
    <div
      style={{
        height: 150,
      }}
    >
      <TopLight />
      <Typography align="center" className={classes.h1} variant="h1">
        Strategies from trusted signal providers
      </Typography>
    </div>
  );
};

const Head = () => {
  const classes = useStyles();
  return (
    <thead>
      <tr className={classes.trHead}>
        <th className={classes.th}>
          <Typography className={classes.accordionHeadText}>
            Strategy
          </Typography>
        </th>
        <th className={classes.th}>
          <Typography className={classes.accordionHeadText}>
            Base token
          </Typography>
        </th>
        <th className={classes.th}>
          <Typography className={classes.accordionHeadText}>
            Value of pool (USD)
          </Typography>
        </th>
        <th className={classes.th}>
          <Typography className={classes.accordionHeadText}>
            Pool token value
          </Typography>
        </th>
        <th className={classes.th}>
          <Typography className={classes.accordionHeadText}>
            Pool token supply
          </Typography>
        </th>
        <th className={classes.th}>
          <Typography className={classes.accordionHeadText}>
            Performance
          </Typography>
        </th>
      </tr>
    </thead>
  );
};

const AssetAndIcon = ({ asset }: { asset: string }) => {
  const classes = useStyles();
  return (
    <div className={classes.assetContainer}>
      <div className={classes.assetItems}>
        <img src={getImageSource(asset)} style={{ height: 25 }} />
      </div>
      <div className={classes.assetItems}>{asset}</div>
    </div>
  );
};

const RowOneAsset = ({ pool }: { pool: Pool }) => {
  const classes = useStyles();
  const poolStats = usePoolStats(pool);
  const history = useHistory();
  const perf = roundToDecimal(poolStats?.inceptionPerformance, 1);
  const assets = poolStats?.assets?.filter((a) => a !== 'USDC');
  if (!assets) {
    return null;
  }
  return (
    <tr
      className={classes.tr}
      onClick={() => history.push(`pool/${pool.poolSeed.toBase58()}`)}
    >
      <td className={classes.td}>
        <Typography className={classes.rowText}>{pool.name}</Typography>
      </td>
      <td className={classes.td}>
        <Typography className={classes.rowText}>
          <AssetAndIcon asset={assets[0]} />
        </Typography>
      </td>
      <td className={classes.td}>
        <Typography className={classes.rowText}>
          ${roundToDecimal(poolStats?.usdValue, 1)}
        </Typography>
      </td>
      <td className={classes.td}>
        <Typography className={classes.rowText}>
          ${roundToDecimal(poolStats?.poolTokenValue, 1)}
        </Typography>
      </td>
      <td className={classes.td}>
        <Typography className={classes.rowText}>
          ${roundToDecimal(poolStats?.tokenSupply, 1)}
        </Typography>
      </td>
      <td className={classes.td}>
        {perf && (
          <Typography className={perf > 0 ? classes.up : classes.down}>
            {perf}%
          </Typography>
        )}
      </td>
    </tr>
  );
};

const MultiAssetsRow = ({
  pools,
  strategyName,
}: {
  pools: Pool[];
  strategyName: string;
}) => {
  const classes = useStyles();
  return (
    <tbody className="fancy-table">
      <tr>
        <td className={classes.td}>
          <Typography className={classes.rowText}>{strategyName}</Typography>
        </td>
        <td>
          <div className={classes.buttonContainer}>
            <div className={classes.button}>
              <Typography className={classes.blueText}>
                Multiple token strategies
              </Typography>
            </div>
          </div>
        </td>
      </tr>
      {pools.map((p) => (
        <MultiAssetInnerRow pool={p} key={p.poolSeed.toBase58()} />
      ))}
    </tbody>
  );
};

const MultiAssetInnerRow = ({ pool }: { pool: Pool }) => {
  const classes = useStyles();
  const history = useHistory();
  const poolStats = usePoolStats(pool);
  const perf = roundToDecimal(poolStats?.inceptionPerformance, 1);
  const assets = poolStats?.assets?.filter((a) => a !== 'USDC');
  if (!assets) {
    return null;
  }
  return (
    <tr
      className={classes.trMultipleAssets}
      onClick={() => history.push(`pool/${pool.poolSeed.toBase58()}`)}
    >
      <td className={classes.tdMultipleAssets}></td>
      <td className={classes.tdMultipleAssets}>
        <Typography className={classes.rowText}>
          <AssetAndIcon asset={assets[0]} />
        </Typography>
      </td>
      <td className={classes.tdMultipleAssets}>
        <Typography className={classes.rowText}>
          ${roundToDecimal(poolStats?.usdValue, 1)}
        </Typography>
      </td>
      <td className={classes.tdMultipleAssets}>
        <Typography className={classes.rowText}>
          ${roundToDecimal(poolStats?.poolTokenValue, 1)}
        </Typography>
      </td>
      <td className={classes.tdMultipleAssets}>
        <Typography className={classes.rowText}>
          ${roundToDecimal(poolStats?.tokenSupply, 1)}
        </Typography>
      </td>
      <td className={classes.tdMultipleAssets}>
        {perf && (
          <Typography className={perf > 0 ? classes.up : classes.down}>
            {perf}%
          </Typography>
        )}
      </td>
    </tr>
  );
};

const ExplorerPage = () => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.root}>
        <div>
          <Title />
        </div>
        <div style={{ marginTop: '10%', marginBottom: 40 }}>
          <table style={{ borderSpacing: '0 4px', borderCollapse: 'separate' }}>
            <Head />
            <tbody>
              {BENSON_STRATEGIES && <RowOneAsset pool={BENSON_STRATEGIES} />}
              {BARTBOT_STRATEGIES && <RowOneAsset pool={BARTBOT_STRATEGIES} />}
              {VOLATILITY_EXPANSION_STRATEGIES && (
                <RowOneAsset pool={VOLATILITY_EXPANSION_STRATEGIES} />
              )}
            </tbody>
            <MultiAssetsRow
              pools={RSI_STRATEGIES}
              strategyName="RSI strategies"
            />
            <MultiAssetsRow
              pools={MACD_STRATEGIES}
              strategyName="MACD strategies"
            />
            <MultiAssetsRow
              pools={SUPER_TRENDS_STRATEGIES}
              strategyName="Super Trend strategies"
            />
            <MultiAssetsRow
              pools={COMPENDIUM_STRATEGIES}
              strategyName="Compendium ML strategies"
            />
          </table>
          <div style={{ height: 200 }}>
            <BottomLight />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExplorerPage;
