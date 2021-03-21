import Wallet from '@project-serum/sol-wallet-adapter';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';

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

export interface SelectedTokenAccounts {
  [tokenMint: string]: string;
}

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer> | null;
  effectiveMint: PublicKey;
}

export interface ExternalSignalProvider {
  name: string;
  displayName: string;
  pubKey: PublicKey;
  description: JSX.Element;
}

export interface Template {
  name: string;
  key: string;
}
