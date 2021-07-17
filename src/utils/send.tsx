import * as BufferLayout from 'buffer-layout';
import { notify } from './notifications';
import { sleep } from './utils';
import {
  Account,
  Commitment,
  Connection,
  RpcResponseAndContext,
  SimulatedTransactionResponse,
  SystemProgram,
  Transaction,
  TransactionSignature,
  TransactionInstruction,
  PublicKey,
} from '@solana/web3.js';
import { TokenInstructions } from '@project-serum/serum';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Buffer } from 'buffer';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export async function createTokenAccountTransaction({
  connection,
  wallet,
  mintPublicKey,
}: {
  connection: Connection;
  wallet: Wallet;
  mintPublicKey: PublicKey;
}): Promise<{
  transaction: Transaction;
  signer: Account;
  newAccountPubkey: PublicKey;
}> {
  const newAccount = new Account();
  const transaction = new Transaction();
  const instruction = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(165),
    space: 165,
    programId: TokenInstructions.TOKEN_PROGRAM_ID,
  });
  transaction.add(instruction);
  transaction.add(
    TokenInstructions.initializeAccount({
      account: newAccount.publicKey,
      mint: mintPublicKey,
      owner: wallet.publicKey,
    }),
  );
  return {
    transaction,
    signer: newAccount,
    newAccountPubkey: newAccount.publicKey,
  };
}

export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

const DEFAULT_TIMEOUT = 15000 * 3;

export async function sendTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
  sendingMessage = 'Sending transaction...',
  sentMessage = 'Transaction sent',
  successMessage = 'Transaction confirmed',
  timeout = DEFAULT_TIMEOUT,
}: {
  transaction: Transaction;
  wallet: Wallet;
  signers?: Array<Account>;
  connection: Connection;
  sendingMessage?: string;
  sentMessage?: string;
  successMessage?: string;
  timeout?: number;
}) {
  if (wallet.isProgramWallet) {
    const signedTransaction = await covertToProgramWalletTransaction({
      transaction,
      wallet,
      signers,
      connection
    });
    return await sendSignedTransaction({
      signedTransaction,
      connection,
      sendingMessage,
      sentMessage,
      successMessage,
      timeout,
    });
  } else {
    const signedTransaction = await signTransaction({
      transaction,
      wallet,
      signers,
      connection,
    });
    return await sendSignedTransaction({
      signedTransaction,
      connection,
      sendingMessage,
      sentMessage,
      successMessage,
      timeout,
    });
  }
}

export async function signTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
}: {
  transaction: Transaction;
  wallet: Wallet;
  signers?: Array<Account>;
  connection: Connection;
}) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey));
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  return await wallet.signTransaction(transaction);
}

async function covertToProgramWalletTransaction({
  transaction,
  wallet,
  signers = [],
  connection,

}: {
  transaction: Transaction,
  wallet: any,
  signers: Array<Account>;
  connection: Connection,
}) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash("max")
  ).blockhash;
  transaction.feePayer = wallet.publicKey;
  if (signers.length > 0) {
    transaction = await wallet.convertToProgramWalletTransaction(transaction);
    transaction.partialSign(...signers);
  }
  return transaction;
}

export async function signTransactions({
  transactionsAndSigners,
  wallet,
  connection,
}: {
  transactionsAndSigners: {
    transaction: Transaction;
    signers?: Array<Account>;
  }[];
  wallet: Wallet;
  connection: Connection;
}) {
  const blockhash = (await connection.getRecentBlockhash('max')).blockhash;
  transactionsAndSigners.forEach(({ transaction, signers = [] }) => {
    transaction.recentBlockhash = blockhash;
    transaction.setSigners(
      wallet.publicKey,
      ...signers.map((s) => s.publicKey),
    );
    if (signers?.length > 0) {
      transaction.partialSign(...signers);
    }
  });
  return await wallet.signAllTransactions(
    transactionsAndSigners.map(({ transaction }) => transaction),
  );
}

export async function sendSignedTransaction({
  signedTransaction,
  connection,
  sendingMessage = 'Sending transaction...',
  sentMessage = 'Transaction sent',
  successMessage = 'Transaction confirmed',
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: Transaction;
  connection: Connection;
  sendingMessage?: string;
  sentMessage?: string;
  successMessage?: string;
  timeout?: number;
}): Promise<string> {
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();
  notify({ message: sendingMessage });
  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    },
  );
  notify({ message: sentMessage, variant: 'success', txid });

  console.log('Started awaiting confirmation for', txid);

  let done = false;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(300);
    }
  })();
  try {
    await awaitTransactionSignatureConfirmation(txid, timeout, connection);
  } catch (err) {
    if (err.timeout) {
      throw new Error('Timed out awaiting confirmation on transaction');
    }
    let simulateResult: SimulatedTransactionResponse | null = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, 'single')
      ).value;
    } catch (e) {}
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];
          if (line.startsWith('Program log: ')) {
            throw new Error(
              'Transaction failed: ' + line.slice('Program log: '.length),
            );
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.err));
    }
    throw new Error('Transaction failed');
  } finally {
    done = true;
  }
  notify({ message: successMessage, variant: 'success', txid });

  console.log('Latency', txid, getUnixTs() - startTime);
  return txid;
}

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
) {
  let done = false;
  const result = await new Promise((resolve, reject) => {
    (async () => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        console.log('Timed out for txid', txid);
        reject({ timeout: true });
      }, timeout);
      try {
        connection.onSignature(
          txid,
          (result) => {
            console.log('WS confirmed', txid, result);
            done = true;
            if (result.err) {
              reject(result.err);
            } else {
              resolve(result);
            }
          },
          'recent',
        );
        console.log('Set up WS connection', txid);
      } catch (e) {
        done = true;
        console.log('WS error in setup', txid, e);
      }
      while (!done) {
        // eslint-disable-next-line no-loop-func
        (async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ]);
            const result = signatureStatuses && signatureStatuses.value[0];
            if (!done) {
              if (!result) {
                console.log('REST null result for', txid, result);
              } else if (result.err) {
                console.log('REST error for', txid, result);
                done = true;
                reject(result.err);
              } else if (!result.confirmations) {
                console.log('REST no confirmations for', txid, result);
              } else {
                console.log('REST confirmation for', txid, result);
                done = true;
                resolve(result);
              }
            }
          } catch (e) {
            if (!done) {
              console.log('REST connection error: txid', txid, e);
            }
          }
        })();
        await sleep(300);
      }
    })();
  });
  done = true;
  return result;
}

/** Copy of Connection.simulateTransaction that takes a commitment parameter. */
async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment,
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching,
  );

  const signData = transaction.serializeMessage();
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString('base64');
  const config: any = { encoding: 'base64', commitment };
  const args = [encodedTransaction, config];

  // @ts-ignore
  const res = await connection._rpcRequest('simulateTransaction', args);
  if (res.error) {
    throw new Error('failed to simulate transaction: ' + res.error.message);
  }
  return res.result;
}

export const sendSplToken = async ({
  connection,
  owner,
  sourceSpl,
  destination,
  amount,
  wallet,
  isSol,
}: {
  connection: Connection;
  owner: PublicKey;
  sourceSpl: PublicKey;
  destination: PublicKey;
  amount: number;
  wallet: Wallet;
  isSol: boolean;
}) => {
  const signers: Array<Account> = [];
  const tx = new Transaction();
  if (isSol) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: sourceSpl,
        toPubkey: destination,
        lamports: amount,
      }),
    );
  } else {
    tx.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        sourceSpl,
        destination,
        owner,
        signers,
        amount,
      ),
    );
  }

  return await sendTransaction({
    transaction: tx,
    signers: signers,
    wallet: wallet,
    connection: connection,
    sendingMessage: 'Sending transaction...',
  });
};

const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');

const instructionMaxSpan = Math.max(
  // @ts-ignore
  ...Object.values(LAYOUT.registry).map((r) => r.span),
);

function encodeTokenInstructionData(instruction) {
  let b = Buffer.alloc(instructionMaxSpan);
  let span = LAYOUT.encode(instruction, b);
  return b.slice(0, span);
}

export async function closeAccount({
  source,
  destination,
  owner,
  wallet,
  connection,
}: {
  source: PublicKey;
  destination: PublicKey;
  owner: PublicKey;
  wallet: Wallet;
  connection: Connection;
}) {
  // destination pubkey = owner pubkey
  const tx = new Transaction();
  const signers: Array<Account> = [];
  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false },
  ];
  tx.add(
    new TransactionInstruction({
      keys,
      data: encodeTokenInstructionData({
        closeAccount: {},
      }),
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  return await sendTransaction({
    transaction: tx,
    signers: signers,
    wallet: wallet,
    connection: connection,
    sendingMessage: 'Sending transaction...',
  });
}
