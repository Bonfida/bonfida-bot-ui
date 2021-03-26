import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CustomButton from './CustomButton';
import { useHistory } from 'react-router-dom';
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
    fontSize: 20,
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
    marginTop: 20,
  },
  card: {
    background: '#f0e9e7',
    border: 'solid 1px',
    borderRadius: 0,
    width: 400,
    maxWidth: 512,
    padding: 30,
    // height: 350,
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
        <Typography variant="h1" className={classes.name}>
          {pool?.name}
        </Typography>
      </CardContent>

      {pool.description && (
        <CardContent>
          <Typography align="center" className={classes.text}>
            {pool?.shortDescription}
          </Typography>
        </CardContent>
      )}
      <div className={classes.center}>
        <CustomButton onClick={onClick}>Select</CustomButton>
      </div>
    </Card>
  );
};

export default StrategyCard;
