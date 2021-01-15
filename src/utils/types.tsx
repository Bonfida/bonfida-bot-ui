import { Connection } from '@solana/web3.js';
import Wallet from '@project-serum/sol-wallet-adapter';

export interface ConnectionContextValues {
  endpoint: string;
  setEndpoint: (newEndpoint: string) => void;
  connection: Connection;
  sendConnection: Connection;
  availableEndpoints: EndpointInfo[];
  setCustomEndpoints: (newCustomEndpoints: EndpointInfo[]) => void;
}

export interface WalletContextValues {
  wallet: Wallet;
  connected: boolean;
  providerUrl: string;
  setProviderUrl: (newProviderUrl: string) => void;
  providerName: string;
}

export interface EndpointInfo {
  name: string;
  endpoint: string;
  custom: boolean;
}
