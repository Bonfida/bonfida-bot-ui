import React, { memo } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Link, { ExplorerLink } from './Link';
import { abbreviateString } from '../utils/utils';

const useStyles = makeStyles({
  infoTextLabel: {
    color: 'black',
    opacity: 0.75,
    borderBottom: '1px dashed #F1F1F2',
    '&:hover': {
      opacity: 1,
    },
  },
  value: {
    color: 'black',
  },
  gridContainer: {
    marginTop: 5,
    marginBottom: 5,
  },
});

const InformationRow = ({
  label,
  value,
  isExplorerLink,
  isLink,
  linkText,
}: {
  label: any;
  value: string | number | undefined | null;
  isExplorerLink?: boolean;
  isLink?: boolean;
  linkText?: string;
}) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="center"
      className={classes.gridContainer}
    >
      <Grid item>
        <Typography variant="body1" className={classes.infoTextLabel}>
          {label}
        </Typography>
      </Grid>
      <Grid item>
        {!isExplorerLink && !isLink && (
          <Typography variant="body1" className={classes.value}>
            {value}
          </Typography>
        )}
        {isExplorerLink && typeof value === 'string' && (
          <ExplorerLink address={value}>{abbreviateString(value)}</ExplorerLink>
        )}
        {isLink && typeof value === 'string' && (
          <Link external={value.includes('https')} to={value}>
            {linkText}
          </Link>
        )}
      </Grid>
    </Grid>
  );
};

export default memo(InformationRow);
