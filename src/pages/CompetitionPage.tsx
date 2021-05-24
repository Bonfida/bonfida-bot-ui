import React from 'react';
import CompetitionTablePerformance from '../components/CompetitionTablePerformance';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  h1: {
    fontSize: 30,
    fontWeight: 600,
    margin: 20,
  },
});

const CompetitionPage = () => {
  const classes = useStyles();
  return (
    <>
      <Typography className={classes.h1} align="center" variant="h1">
        Competition Bots
      </Typography>
      <CompetitionTablePerformance />
    </>
  );
};

export default CompetitionPage;
