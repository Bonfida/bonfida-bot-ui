import React from 'react';
import FloatingCard from '../components/FloatingCard';
import FaqCard from '../components/Faq/FaqCard';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) => createStyles({}));

const FaqPage = () => {
  const classes = useStyles();
  return (
    <Grid container direction="row" justify="center">
      <FloatingCard>
        <FaqCard />
      </FloatingCard>
    </Grid>
  );
};

export default FaqPage;
