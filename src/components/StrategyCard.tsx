import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import CustomButton from './CustomButton';
import { useHistory } from 'react-router-dom';
import { Pool } from '../utils/pools';
import getImageSource from '../utils/icons';

const useStyles = makeStyles({
  text: {
    color: '#838383',
    fontWeight: 500,
  },
  cardContent: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  name: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'start',
    paddingLeft: 10,
  },
  imgContainer: {
    height: 100,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  img: {
    height: 100,
  },
  center: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  card: {
    background: '#f0e9e7',
    border: 'solid 1px',
    borderRadius: 0,
    height: 200,
    width: 200,
    padding: 30,
    transition: 'transform .2s',
    cursor: 'pointer',
    borderColor: '#B80812',
    boxShadow: `-12px 12px 0px 1px #B80812`,
    boxSizing: 'border-box',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
});

export const StrategyCard = ({ pool, left }: { pool: Pool; left: boolean }) => {
  const classes = useStyles();
  const history = useHistory();
  const onClick = () => {
    history.push(`/pool/${pool.poolSeed.toBase58()}`);
  };
  return (
    <Card
      onClick={onClick}
      className={classes.card}
      variant="outlined"
      elevation={0}
    >
      <Grid container justify="center" alignItems="center" direction="column">
        <Grid item>
          <Typography variant="h1" className={classes.name}>
            {pool?.mainAsset}
          </Typography>
        </Grid>
        <Grid item>
          <img src={getImageSource(pool?.mainAsset)} className={classes.img} />
        </Grid>
      </Grid>
    </Card>
  );
};

export default StrategyCard;
