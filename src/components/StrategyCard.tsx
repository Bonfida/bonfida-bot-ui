import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CustomButton from './CustomButton';
import { useHistory } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { Pool } from '../utils/pools';

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
    fontSize: '30px',
    textAlign: 'center',
    marginLeft: 30,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'start',
    paddingLeft: 10,
  },
  balanceContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imgContainer: {
    height: 100,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  img: {
    height: 40,
  },
  center: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    background: '#f0e9e7',
    border: 'solid 1px',
    borderRadius: 0,
    width: '400px',
    maxWidth: '512px',
    padding: 30,
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
      className={classes.card}
      variant="outlined"
      elevation={0}
      style={{
        borderColor: left ? '#B80812' : '#FFE7B7',
        boxShadow: left
          ? `-12px 12px 0px 1px #B80812`
          : `12px 12px 0px 1px #FFE7B7`,
        boxSizing: 'border-box',
      }}
    >
      <CardContent className={classes.cardContent}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          {pool?.illustration && (
            <Grid item>
              <img
                src={pool?.illustration}
                className={classes.img}
                alt={pool.name}
              />
            </Grid>
          )}
          <Grid item>
            <Typography variant="h1" className={classes.name}>
              {pool.name}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>

      {pool.description && (
        <CardContent className={classes.balanceContainer}>
          <Typography className={classes.text}>{pool.description}</Typography>
        </CardContent>
      )}
      <div className={classes.center}>
        <CustomButton onClick={onClick}>{`Select ${pool.name}`}</CustomButton>
      </div>
    </Card>
  );
};

export default StrategyCard;
