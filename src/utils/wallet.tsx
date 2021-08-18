import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Button, Grid, Typography } from '@material-ui/core';
import Modal from '../components/Modal';
import {
  WalletAdapter,
  LedgerWalletAdapter,
  SolongWalletAdapter,
  PhantomWalletAdapter,
  SolflareExtensionWalletAdapter,
  BloctoWalletAdapter,
  MathWalletAdapter,
} from '../wallet-adapters';
import { useConnectionConfig } from '../utils/connection';
import { useLocalStorageState } from '../utils/utils';
import { notify } from '../utils/notifications';
import { makeStyles } from '@material-ui/core/styles';
import blockto from '../assets/wallets/blocto.png';
import solflare from '../assets/wallets/solflare.svg';

const useStyles = makeStyles({
  buttonContainer: {
    background: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    borderRadius: 25,
    width: 250,
  },
  button: {
    background: 'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    margin: 1,
    borderRadius: 25,
    width: 248,
    '&:hover': {
      background:
        'linear-gradient(135deg, rgba(19, 30, 48, 0.5) 0%, #0F0F11 0%)',
    },
  },
  modalTitle: {
    color: 'white',
    opacity: 0.8,
    fontSize: 24,
    marginBottom: 10,
  },
  img: {
    height: 30,
    marginTop: 4,
  },
  coloredText: {
    textTransform: 'capitalize',
    fontWeight: 400,
    backgroundImage: 'linear-gradient(135deg, #60C0CB 18.23%, #6868FC 100%)',
    backgroundClip: 'text',
    color: '#60C0CB',
    '-webkit-background-clip': 'text',
    '-moz-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    '-moz-text-fill-color': 'transparent',
  },
});

const ASSET_URL =
  'https://cdn.jsdelivr.net/gh/solana-labs/oyster@main/assets/wallets';
export const WALLET_PROVIDERS = [
  {
    name: 'Phantom',
    url: 'https://www.phantom.app',
    icon: `https://www.phantom.app/img/logo.png`,
    adapter: PhantomWalletAdapter,
  },
  {
    name: 'Blocto',
    url: 'https://blocto.portto.io//',
    icon: blockto,
    adapter: BloctoWalletAdapter,
  },
  {
    name: 'sollet.io',
    url: 'https://www.sollet.io',
    icon: `${ASSET_URL}/sollet.svg`,
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com/access-wallet',
    icon: solflare,
  },
  {
    name: 'Solflare Extension',
    url: 'https://www.solflare.com',
    icon: solflare,
    adapter: SolflareExtensionWalletAdapter,
  },
];

const WalletContext = React.createContext<any>(null);

export function WalletProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const classes = useStyles();
  const [autoConnect, setAutoConnect] = useState(false);
  const [providerUrl, setProviderUrl] = useLocalStorageState('walletProvider');

  const provider = useMemo(
    () => WALLET_PROVIDERS.find(({ url }) => url === providerUrl),
    [providerUrl],
  );

  const wallet = useMemo(
    function () {
      if (provider) {
        return new (provider.adapter || Wallet)(
          providerUrl,
          endpoint,
        ) as WalletAdapter;
      }
    },
    [provider, providerUrl, endpoint],
  );

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (wallet) {
      wallet.on('connect', () => {
        if (wallet.publicKey) {
          console.log('connected');
          localStorage.removeItem('feeDiscountKey');
          setConnected(true);
          const walletPublicKey = wallet.publicKey.toBase58();
          const keyToDisplay =
            walletPublicKey.length > 20
              ? `${walletPublicKey.substring(
                  0,
                  7,
                )}.....${walletPublicKey.substring(
                  walletPublicKey.length - 7,
                  walletPublicKey.length,
                )}`
              : walletPublicKey;

          notify({
            message: 'Wallet update Connected to wallet ' + keyToDisplay,
          });
        }
      });

      wallet.on('disconnect', () => {
        setConnected(false);
        notify({
          message: 'Wallet update - Disconnected from wallet',
        });
        localStorage.removeItem('feeDiscountKey');
      });
    }

    return () => {
      setConnected(false);
      if (wallet) {
        wallet.disconnect();
        setConnected(false);
      }
    };
  }, [wallet]);

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }

    return () => {};
  }, [wallet, autoConnect]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const select = useCallback(() => setIsModalVisible(true), []);
  const close = useCallback(() => setIsModalVisible(false), []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        select,
        providerUrl,
        setProviderUrl,
        providerName:
          WALLET_PROVIDERS.find(({ url }) => url === providerUrl)?.name ??
          providerUrl,
      }}
    >
      {children}
      <Modal openModal={isModalVisible} setOpen={setIsModalVisible}>
        <Typography className={classes.modalTitle} align="center">
          Connect to a wallet
        </Typography>
        <Grid
          container
          alignItems="center"
          justify="center"
          direction="column"
          spacing={2}
        >
          {WALLET_PROVIDERS.map((provider, i) => {
            const onClick = function () {
              setProviderUrl(provider.url);
              setAutoConnect(true);
              close();
            };

            return (
              <Grid item key={`wallet-provider-${provider.name}`}>
                <div className={classes.buttonContainer}>
                  <Button className={classes.button} onClick={onClick}>
                    <Grid container justify="space-around" alignItems="center">
                      <Grid item>
                        <Typography className={classes.coloredText}>
                          {provider.name}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <img
                          src={provider.icon}
                          className={classes.img}
                          alt=""
                        />
                      </Grid>
                    </Grid>
                  </Button>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </Modal>
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }

  const wallet = context.wallet;
  return {
    connected: context.connected,
    wallet: wallet,
    providerUrl: context.providerUrl,
    setProvider: context.setProviderUrl,
    providerName: context.providerName,
    select: context.select,
    connect() {
      wallet ? wallet.connect() : context.select();
    },
    disconnect() {
      wallet?.disconnect();
    },
  };
}
