import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const Spin = ({ size }: { size: number }) => {
  return <CircularProgress size={size} />;
};

export default Spin;
