import React from 'react';
import { USE_POOLS, STRATEGY_TYPES, Pool, usePoolStats } from '../utils/pools';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { roundToDecimal, useSmallScreen } from '../utils/utils';
import bottomLight from '../assets/components/ExplorePage/bottom-light.svg';
import topLight from '../assets/components/ExplorePage/top-light.svg';
import getImageSource from '../utils/icons';
import '../index.css';
import { PublicKey } from '@solana/web3.js';

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

const TYCHE_STRATEGY = USE_POOLS.find(
  (p) => p.strategyType === STRATEGY_TYPES.TYCHE,
);

const NOVA_STRATEGY = USE_POOLS.find((p) => p.name.includes('Nova Kapital'));

const DUNKUN_STRATEGY = USE_POOLS.find((p) => p.name.includes('Dukun'));

export const OVERHEAD_STRATEGIES = USE_POOLS.filter(
  (p) => p.name.includes('Dreamcatcher') || p.name.includes('Earthshaker'),
);

const useStyles = makeStyles({
  root: {
    display: 'flex',
    paddingTop: '5%',
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
  headText: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '115%',
    color: '#7C7CFF',
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
    marginRight: 20,
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
    textAlign: 'start',
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
    textAlign: 'end',
    '&:first-child': {
      paddingLeft: 30,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    '&:last-child': {
      paddingRight: 30,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
  },
  tdMultipleAssets: {
    textAlign: 'end',
    padding: 15,
    '&:first-child': {
      paddingLeft: 30,
    },
    '&:last-child': {
      paddingRight: 30,
    },
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
      <img src={bottomLight} className={classes.bottomLigt} alt="" />
    </div>
  );
};

const TopLight = () => {
  const classes = useStyles();
  return (
    <div className={classes.topLightContainer}>
      <img src={topLight} className={classes.topLight} alt="" />
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
  const smallScreen = useSmallScreen();
  return (
    <thead>
      <tr className={classes.trHead}>
        <th className={classes.th}>
          <Typography className={classes.headText}>Strategy</Typography>
        </th>
        <th className={classes.th}>
          <Typography className={classes.headText}>Base token</Typography>
        </th>
        {!smallScreen && (
          <>
            <th className={classes.th}>
              <Typography className={classes.headText}>
                Value of pool (USD)
              </Typography>
            </th>
            <th className={classes.th}>
              <Typography className={classes.headText}>
                Pool token value
              </Typography>
            </th>
            <th className={classes.th}>
              <Typography className={classes.headText}>
                Pool token supply
              </Typography>
            </th>
            <th className={classes.th}>
              <Typography className={classes.headText}>Performance</Typography>
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};

const AssetAndIcon = ({ asset }: { asset: string }) => {
  const classes = useStyles();
  return (
    <div className={classes.assetContainer}>
      <div className={classes.assetItems}>
        <img src={getImageSource(asset)} style={{ height: 25 }} alt="" />
      </div>
      <div className={classes.assetItems}>{asset}</div>
    </div>
  );
};

const RowOneAsset = ({ poolSeed }: { poolSeed: string }) => {
  const classes = useStyles();
  const pool = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
  const poolStats = usePoolStats(new PublicKey(poolSeed));
  const history = useHistory();
  const perf = roundToDecimal(poolStats?.inceptionPerformance, 1);
  const assets = poolStats?.assets?.filter((a) => a !== 'USDC' && a !== 'USDT');
  const smallScreen = useSmallScreen();
  if (!assets) {
    return null;
  }
  return (
    <tr className={classes.tr} onClick={() => history.push(`pool/${poolSeed}`)}>
      <td className={classes.td}>
        <Typography className={classes.rowText} style={{ textAlign: 'start' }}>
          {pool?.name || 'Unknown pool'}
        </Typography>
      </td>
      <td className={classes.td}>
        <Typography className={classes.rowText}>
          <AssetAndIcon asset={assets[0]} />
        </Typography>
      </td>
      {!smallScreen && (
        <>
          <td className={classes.td}>
            <Typography className={classes.rowText}>
              ${roundToDecimal(poolStats?.usdValue, 1)?.toLocaleString()}
            </Typography>
          </td>
          <td className={classes.td}>
            <Typography className={classes.rowText}>
              ${roundToDecimal(poolStats?.poolTokenValue, 1)?.toLocaleString()}
            </Typography>
          </td>
          <td className={classes.td}>
            <Typography className={classes.rowText}>
              {roundToDecimal(poolStats?.tokenSupply, 1)?.toLocaleString()}
            </Typography>
          </td>
          <td className={classes.td}>
            {perf && (
              <Typography className={perf > 0 ? classes.up : classes.down}>
                {perf}%
              </Typography>
            )}
          </td>
        </>
      )}
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
    <tbody className="fancy-card">
      <tr>
        <td className={classes.td} style={{ textAlign: 'start' }}>
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
  const poolStats = usePoolStats(pool.poolSeed);
  const perf = roundToDecimal(poolStats?.inceptionPerformance, 1);
  const assets = poolStats?.assets?.filter((a) => a !== 'USDC' && a !== 'USDT');
  const smallScreen = useSmallScreen();
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
      {!smallScreen && (
        <>
          <td className={classes.tdMultipleAssets}>
            <Typography className={classes.rowText}>
              ${roundToDecimal(poolStats?.usdValue, 1)?.toLocaleString()}
            </Typography>
          </td>
          <td className={classes.tdMultipleAssets}>
            <Typography className={classes.rowText}>
              ${roundToDecimal(poolStats?.poolTokenValue, 1)?.toLocaleString()}
            </Typography>
          </td>
          <td className={classes.tdMultipleAssets}>
            <Typography className={classes.rowText}>
              {roundToDecimal(poolStats?.tokenSupply, 1)?.toLocaleString()}
            </Typography>
          </td>
          <td className={classes.tdMultipleAssets}>
            {perf && (
              <Typography className={perf > 0 ? classes.up : classes.down}>
                {perf}%
              </Typography>
            )}
          </td>
        </>
      )}
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
              {OVERHEAD_STRATEGIES.map((s) => {
                return <RowOneAsset poolSeed={s.poolSeed.toBase58()} />;
              })}
              {BENSON_STRATEGIES && (
                <RowOneAsset poolSeed={BENSON_STRATEGIES.poolSeed.toBase58()} />
              )}
              {BARTBOT_STRATEGIES && (
                <RowOneAsset
                  poolSeed={BARTBOT_STRATEGIES.poolSeed.toBase58()}
                />
              )}
              {TYCHE_STRATEGY && (
                <RowOneAsset poolSeed={TYCHE_STRATEGY.poolSeed.toBase58()} />
              )}
              {NOVA_STRATEGY && (
                <RowOneAsset poolSeed={NOVA_STRATEGY.poolSeed.toBase58()} />
              )}
              {DUNKUN_STRATEGY && (
                <RowOneAsset poolSeed={DUNKUN_STRATEGY.poolSeed.toBase58()} />
              )}
              {VOLATILITY_EXPANSION_STRATEGIES && (
                <RowOneAsset
                  poolSeed={VOLATILITY_EXPANSION_STRATEGIES.poolSeed.toBase58()}
                />
              )}
            </tbody>
            <MultiAssetsRow
              pools={COMPENDIUM_STRATEGIES}
              strategyName="Compendium ML strategies"
            />
            <MultiAssetsRow
              pools={SUPER_TRENDS_STRATEGIES}
              strategyName="Super Trend strategies"
            />
            <MultiAssetsRow
              pools={RSI_STRATEGIES}
              strategyName="RSI strategies"
            />
            <MultiAssetsRow
              pools={MACD_STRATEGIES}
              strategyName="MACD strategies"
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

export const FancyTable = ({ poolSeeds }: { poolSeeds: string[] }) => {
  return (
    <table style={{ borderSpacing: '0 4px', borderCollapse: 'separate' }}>
      <Head />
      <tbody>
        {poolSeeds.map((p) => {
          return <RowOneAsset poolSeed={p} key={`fancy-table-${p}`} />;
        })}
      </tbody>
    </table>
  );
};
