import React from 'react';
import CreatePoolCard from '../components/CreatePoolCard';
import Grid from '@material-ui/core/Grid';

const CreatePoolPage = () => {
  return (
    <Grid container justify="center">
      <div
        style={{
          width: 700,
        }}
      >
        <CreatePoolCard />
      </div>
    </Grid>
  );
};

export default CreatePoolPage;
