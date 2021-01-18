import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CustomButton from './CustomButton';

const useStyles = makeStyles({
  card: {
    background: '#f0e9e7',
    border: 'solid 1px',
    borderRadius: '12px',
    width: '400px',
    maxWidth: '512px',
    padding: 30,
  },
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
    height: '100%',
  },
  center: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

const StrategyCard = ({
  name,
  description,
  img,
}: {
  name: string;
  description?: string;
  img?: any;
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} variant="outlined" elevation={0}>
      <CardContent className={classes.cardContent}>
        <div className={classes.textContainer}>
          <Typography variant="h1" className={classes.name}>
            {name}
          </Typography>
        </div>
      </CardContent>
      {img && (
        <div className={classes.imgContainer}>
          <img src={img} className={classes.img} alt={name} />
        </div>
      )}
      {description && (
        <CardContent className={classes.balanceContainer}>
          <Typography className={classes.text}>{description}</Typography>
        </CardContent>
      )}
      <div className={classes.center}>
        <CustomButton onClick={() => console.log('Select')}>
          {`Select ${name}`}
        </CustomButton>
      </div>
    </Card>
  );
};

export default StrategyCard;
