import React, { useContext, useEffect, useMemo, useState } from 'react';
import Wallet from '@project-serum/sol-wallet-adapter';
import { notify } from './notifications';
import { useConnectionConfig } from './connection';
import { rpcRequest, useLocalStorageState } from './utils';
import { WalletContextValues } from './types';
import { SolongAdapter } from './solong_adapter';
import { PublicKey, Connection } from '@solana/web3.js';
import { useAsyncData } from './fetch-loop';
import { useConnection } from './connection';
import { MAINNET_ENDPOINT } from './connection';

interface WallerProviderI {
  name: string;
  url: string;
}

export const WALLET_PROVIDERS: WallerProviderI[] = [
  { name: 'Sollet.io', url: 'https://www.sollet.io' },
  { name: 'Solong', url: 'https://solongwallet.com/' },
  { name: 'Bonfida', url: 'https://bonfida.com/wallet' },
];

const WalletContext = React.createContext<null | WalletContextValues>(null);

export function WalletProvider({ children }) {
  const { endpoint } = useConnectionConfig();

  const [savedProviderUrl, setProviderUrl] = useLocalStorageState(
    'walletProvider',
    'https://www.sollet.io',
  );
  let providerUrl: string;
  if (!savedProviderUrl) {
    providerUrl = 'https://www.sollet.io';
  } else {
    providerUrl = savedProviderUrl;
  }

  const wallet: any = useMemo(() => {
    if (providerUrl === 'https://solongwallet.com/') {
      return new SolongAdapter(providerUrl, endpoint);
    } else {
      return new Wallet(providerUrl, endpoint);
    }
  }, [providerUrl, endpoint]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('trying to connect');
    wallet.on('connect', () => {
      console.log('connected');
      localStorage.removeItem('feeDiscountKey');
      setConnected(true);
      let walletPublicKey = wallet.publicKey.toBase58();
      notify({
        message: 'Wallet connected',
        variant: 'success',
      });
    });
    wallet.on('disconnect', () => {
      setConnected(false);
      notify({
        message: 'Wallet disconnected',
        variant: 'success',
      });
      localStorage.removeItem('feeDiscountKey');
    });
    return () => {
      wallet.disconnect();
      setConnected(false);
    };
  }, [wallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        providerUrl,
        setProviderUrl,
        providerName:
          WALLET_PROVIDERS.find(({ url }) => url === providerUrl)?.name ??
          providerUrl,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }
  return {
    connected: context.connected,
    wallet: context.wallet,
    providerUrl: context.providerUrl,
    setProvider: context.setProviderUrl,
    providerName: context.providerName,
  };
}

export const getProgramAccounts = async (pubkey: PublicKey) => {
  const params = [
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    {
      encoding: 'jsonParsed',
      filters: [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 32,
            bytes: pubkey?.toBase58(),
          },
        },
      ],
    },
  ];
  const result = await rpcRequest('getProgramAccounts', params);
  return result;
};
