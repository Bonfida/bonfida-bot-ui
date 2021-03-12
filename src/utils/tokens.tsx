import {
  PublicKey,
  Transaction,
  Account,
  Connection,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from '@solana/web3.js';
import { useConnection } from './connection';
import { useAsyncData, _FAST_REFRESH_INTERVAL } from './fetch-loop';
import { useWallet } from './wallet';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import tuple from 'immutable-tuple';
import { sendTransaction, createTokenAccountTransaction } from './send';
import { rpcRequest } from './utils';
import { TOKEN_MINTS } from '@project-serum/serum';
import { AWESOME_TOKENS } from '@dr497/awesome-serum-markets';

export let USE_TOKENS = TOKEN_MINTS;

USE_TOKENS.push(...AWESOME_TOKENS);

export const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const FIDA_MINT = 'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp';

export const tokenNameFromMint = (mint: string | undefined | null) => {
  if (!mint) {
    return null;
  }
  return USE_TOKENS.find((t) => t.address.toBase58() === mint)?.name;
};

export const tokenMintFromName = (name: string) => {
  return USE_TOKENS.find((t) => t.name === name)?.address.toBase58();
};

export const tokenInfoFromName = (name: string) => {
  return USE_TOKENS.filter((t) => t.name === name);
};

export const tokenInfoFromMint = (mint: string) => {
  return USE_TOKENS.filter((t) => t.address.toBase58() === mint);
};

export const getProgramAccounts = async (pubkey: PublicKey) => {
  const params = [
    TOKEN_PROGRAM_ID.toBase58(),
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

export const useSolBalance = () => {
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const getSolBalance = async () => {
    if (!connected) {
      return null;
    }
    const balance = await connection.getBalance(wallet?.publicKey);
    return balance;
  };

  return useAsyncData(
    getSolBalance,
    tuple('getSolBalance', wallet, connected),
    { refreshInterval: _FAST_REFRESH_INTERVAL },
  );
};

export const useTokenAccounts = () => {
  const { wallet, connected } = useWallet();
  const getTokenAccounts = async () => {
    if (!connected) {
      return null;
    }
    let accounts = await getProgramAccounts(wallet?.publicKey);
    accounts = accounts?.sort((a, b) => {
      return (
        b.account.data.parsed.info.tokenAmount.uiAmount -
        a.account.data.parsed.info.tokenAmount.uiAmount
      );
    });
    return accounts;
  };

  return useAsyncData(
    getTokenAccounts,
    tuple('getTokenAccounts', wallet, connected),
  );
};

export const findUserAccountsForMint = (tokenAccounts: any, mint: string) => {
  return tokenAccounts
    ?.filter((acc) => acc.account.data.parsed.info.mint === mint)
    ?.map((acc) => acc.pubkey);
};

export const createTokenAccount = async (
  connection: Connection,
  wallet: any,
  mint: PublicKey,
) => {
  const tx = new Transaction();
  const signers: Account[] = [];
  const {
    transaction: createAccountTransaction,
    signer: createAccountSigners,
    newAccountPubkey,
  } = await createTokenAccountTransaction({
    connection: connection,
    wallet: wallet,
    mintPublicKey: mint,
  });
  tx.add(createAccountTransaction);
  signers.push(createAccountSigners);
  await sendTransaction({
    transaction: tx,
    wallet,
    connection,
    signers,
    sendingMessage: 'Creating account...',
  });
  return newAccountPubkey;
};

export const tokenAccountFromMintForOwner = async (
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
) => {
  const account = await connection.getParsedTokenAccountsByOwner(owner, {
    mint: mint,
  });
  return account?.value;
};

export const useTokenSupply = (mint: PublicKey | undefined) => {
  const connection = useConnection();
  const getSupply = async () => {
    if (!mint) {
      return null;
    }
    const result = await connection.getTokenSupply(mint);
    return result.value.uiAmount;
  };
  return useAsyncData(
    getSupply,
    tuple('getSupply', connection, mint?.toBase58()),
  );
};

export const isValidMint = (mint: string) => {
  return !!USE_TOKENS.filter((t) => t.address.toBase58() === mint);
};

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )
  )[0];
}

export const createAssociatedTokenAccount = async (
  connection,
  wallet,
  splTokenMintAddress: PublicKey,
): Promise<string> => {
  const associatedTokenAddress = await findAssociatedTokenAddress(
    wallet.publicKey,
    splTokenMintAddress,
  );
  const keys = [
    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splTokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];

  const tx = new Transaction();
  const signers: Account[] = [];

  tx.add(
    new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    }),
  );

  const newAccountPubkey = await sendTransaction({
    transaction: tx,
    wallet,
    connection,
    signers,
    sendingMessage: 'Creating account...',
  });
  return newAccountPubkey;
};

export const useBalanceForAddress = (
  tokenAccounts: any,
  address: string | null | undefined,
) => {
  if (!address) {
    return null;
  }
  const balance = tokenAccounts?.find((acc) => acc.pubkey === address)?.account
    .data.parsed.info.tokenAmount.uiAmount;
  return balance;
};

export const useBalanceForMint = (
  tokenAccounts: any,
  mint: string | null | undefined,
) => {
  if (!mint) {
    return null;
  }
  const balance = tokenAccounts?.find(
    (acc) => acc.account.data.parsed.info.mint === mint,
  )?.account.data.parsed.info.tokenAmount.uiAmount;
  return balance;
};

export const decimalsFromMint = async (
  connection: Connection,
  mint: PublicKey,
) => {
  const result = await connection.getParsedAccountInfo(mint);
  // @ts-ignore
  const decimals = result?.value?.data?.parsed?.info?.decimals;
  if (!decimals) {
    throw new Error('Invalid mint');
  }
  return decimals;
};
