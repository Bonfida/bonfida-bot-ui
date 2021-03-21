import React from 'react';
import FloatingCard from '../components/FloatingCard';
import { TradingViewCard } from '../components/Faq/FaqCard';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: '80%',
    },
  }),
);

const TradingViewPage = () => {
  const classes = useStyles();
  return (
    <Grid container direction="row" justify="center">
      <div className={classes.container}>
        <FloatingCard>
          <TradingViewCard />
        </FloatingCard>
      </div>
    </Grid>
  );
};

export default TradingViewPage;
