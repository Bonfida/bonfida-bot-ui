import React from 'react';
import BalancesTable from '../components/BalancesTable';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const BalancesPage = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <BalancesTable />
    </div>
  );
};

export default BalancesPage;
