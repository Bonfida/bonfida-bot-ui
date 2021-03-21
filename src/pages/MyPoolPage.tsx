import React from 'react';
import MyPoolPageCard from '../components/MyPoolPageCard';
import Grid from '@material-ui/core/Grid';

const MyPoolPage = () => {
  return (
    <>
      <Grid container justify="center">
        <MyPoolPageCard />
      </Grid>
    </>
  );
};

export default MyPoolPage;
