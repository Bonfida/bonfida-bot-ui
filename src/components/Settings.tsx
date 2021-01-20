import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import gear from '../assets/components/Settings/gear.svg';
import { WALLET_PROVIDERS, useWallet } from '../utils/wallet';
import Typography from '@material-ui/core/Typography';
import { useConnectionConfig } from '../utils/connection';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 100,
      margin: 10,
      width: 300,
    },
    button: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
    },
    text: {
      textTransform: 'capitalize',
      fontWeight: 'bold',
      padding: '8px',
    },
  }),
);

const Settings = (): JSX.Element => {
  const classes = useStyles();
  const { wallet, providerUrl, setProvider, providerName } = useWallet();
  const { setEndpoint, availableEndpoints } = useConnectionConfig();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <button onClick={handleClick} className={classes.button}>
        <img src={gear} height="30px" />
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div className={classes.root}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
            <Grid item>
              <Typography className={classes.text}>
                Wallet:{' '}
                <select
                  name="wallet-provider"
                  onChange={(v) => setProvider(v.target.value)}
                  className={classes.text}
                >
                  {WALLET_PROVIDERS.map((w, i) => {
                    return (
                      <option
                        key={`wallet-provider-${i}`}
                        selected={providerName === w.name}
                        value={w.url}
                      >
                        {w.name}
                      </option>
                    );
                  })}
                </select>
              </Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.text}>
                Endpoint:{' '}
                <select
                  name="endpoint"
                  onChange={(v) => {
                    setEndpoint(v.target.value);
                  }}
                  className={classes.text}
                >
                  {availableEndpoints.map((w, i) => {
                    return (
                      <option
                        key={`available-endpoints-${i}`}
                        selected={providerName === w.name}
                        value={w.endpoint}
                      >
                        {w.name}
                      </option>
                    );
                  })}
                </select>
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Popover>
    </div>
  );
};

export default Settings;
