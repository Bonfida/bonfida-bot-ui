import * as BufferLayout from 'buffer-layout';
import { notify } from './notifications';
import { getDecimalCount, sleep } from './utils';
import {
  Account,
  AccountInfo,
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
import BN from 'bn.js';
import {
  DexInstructions,
  Market,
  OpenOrders,
  TOKEN_MINTS,
  TokenInstructions,
} from '@project-serum/serum';
import Wallet from '@project-serum/sol-wallet-adapter';
import { SelectedTokenAccounts, TokenAccount } from './types';
import { Order } from '@project-serum/serum/lib/market';
import { Buffer } from 'buffer';
import assert from 'assert';
import { struct } from 'superstruct';
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

export async function settleFunds({
  market,
  openOrders,
  connection,
  wallet,
  baseCurrencyAccount,
  quoteCurrencyAccount,
}: {
  market: Market;
  openOrders: OpenOrders;
  connection: Connection;
  wallet: Wallet;
  baseCurrencyAccount: TokenAccount;
  quoteCurrencyAccount: TokenAccount;
}): Promise<string | undefined> {
  if (
    !market ||
    !wallet ||
    !connection ||
    !openOrders ||
    (!baseCurrencyAccount && !quoteCurrencyAccount)
  ) {
    notify({ message: 'Not connected' });
    return;
  }

  let createAccountTransaction: Transaction | undefined;
  let createAccountSigner: Account | undefined;
  let baseCurrencyAccountPubkey = baseCurrencyAccount?.pubkey;
  let quoteCurrencyAccountPubkey = quoteCurrencyAccount?.pubkey;
  // const refPubkeyUsdcString = JSON.parse(
  //   localStorage.getItem('refPubkeyUsdc') || '',
  // );
  // const refPubkeyUsdtString = JSON.parse(
  //   localStorage.getItem('refPubkeyUsdt') || '',
  // );

  if (!baseCurrencyAccountPubkey) {
    const result = await createTokenAccountTransaction({
      connection,
      wallet,
      mintPublicKey: market.baseMintAddress,
    });
    baseCurrencyAccountPubkey = result?.newAccountPubkey;
    createAccountTransaction = result?.transaction;
    createAccountSigner = result?.signer;
  }
  if (!quoteCurrencyAccountPubkey) {
    const result = await createTokenAccountTransaction({
      connection,
      wallet,
      mintPublicKey: market.quoteMintAddress,
    });
    quoteCurrencyAccountPubkey = result?.newAccountPubkey;
    createAccountTransaction = result?.transaction;
    createAccountSigner = result?.signer;
  }
  let referrerQuoteWallet: PublicKey | null = null;
  if (market.supportsReferralFees) {
    const usdt = TOKEN_MINTS.find(({ name }) => name === 'USDT');
    const usdc = TOKEN_MINTS.find(({ name }) => name === 'USDC');
    if (
      process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS &&
      usdt &&
      market.quoteMintAddress.equals(usdt.address)
    ) {
      referrerQuoteWallet = new PublicKey(
        // refPubkeyUsdtString
        //   ? refPubkeyUsdtString
        process.env.REACT_APP_USDT_REFERRAL_FEES_ADDRESS,
      );
    } else if (
      process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS &&
      usdc &&
      market.quoteMintAddress.equals(usdc.address)
    ) {
      referrerQuoteWallet = new PublicKey(
        // refPubkeyUsdcString
        //   ? refPubkeyUsdcString
        process.env.REACT_APP_USDC_REFERRAL_FEES_ADDRESS,
      );
    }
  }
  const {
    transaction: settleFundsTransaction,
    signers: settleFundsSigners,
  } = await market.makeSettleFundsTransaction(
    connection,
    openOrders,
    baseCurrencyAccountPubkey,
    quoteCurrencyAccountPubkey,
    referrerQuoteWallet,
  );

  let transaction = mergeTransactions([
    createAccountTransaction,
    settleFundsTransaction,
  ]);
  let signers = createAccountSigner
    ? [...settleFundsSigners, createAccountSigner]
    : settleFundsSigners;

  return await sendTransaction({
    transaction,
    signers,
    wallet,
    connection,
    sendingMessage: 'Settling funds...',
  });
}

export async function cancelOrder(params: {
  market: Market;
  connection: Connection;
  wallet: Wallet;
  order: Order;
}) {
  return cancelOrders({ ...params, orders: [params.order] });
}

export async function cancelOrders({
  market,
  wallet,
  connection,
  orders,
}: {
  market: Market;
  wallet: Wallet;
  connection: Connection;
  orders: Order[];
}) {
  const transaction = market.makeMatchOrdersTransaction(5);
  orders.forEach((order) => {
    transaction.add(
      market.makeCancelOrderInstruction(connection, wallet.publicKey, order),
    );
  });
  transaction.add(market.makeMatchOrdersTransaction(5));
  return await sendTransaction({
    transaction,
    wallet,
    connection,
    sendingMessage: 'Sending cancel...',
  });
}

export async function placeOrder({
  side,
  price,
  size,
  orderType,
  market,
  connection,
  wallet,
  baseCurrencyAccount,
  quoteCurrencyAccount,
  feeDiscountPubkey = undefined,
}: {
  side: 'buy' | 'sell';
  price: number;
  size: number;
  orderType: 'ioc' | 'postOnly' | 'limit';
  market: Market | undefined | null;
  connection: Connection;
  wallet: Wallet;
  baseCurrencyAccount: PublicKey | undefined;
  quoteCurrencyAccount: PublicKey | undefined;
  feeDiscountPubkey: PublicKey | undefined;
}) {
  let formattedMinOrderSize =
    market?.minOrderSize?.toFixed(getDecimalCount(market.minOrderSize)) ||
    market?.minOrderSize;
  let formattedTickSize =
    market?.tickSize?.toFixed(getDecimalCount(market.tickSize)) ||
    market?.tickSize;
  const isIncrement = (num, step) =>
    Math.abs((num / step) % 1) < 1e-5 ||
    Math.abs(((num / step) % 1) - 1) < 1e-5;
  if (isNaN(price)) {
    notify({ message: 'Invalid price', variant: 'error' });
    return;
  }
  if (isNaN(size)) {
    notify({ message: 'Invalid size', variant: 'error' });
    return;
  }
  if (!wallet || !wallet.publicKey) {
    notify({ message: 'Connect wallet', variant: 'error' });
    return;
  }
  if (!market) {
    notify({ message: 'Invalid  market', variant: 'error' });
    return;
  }
  if (!isIncrement(size, market.minOrderSize)) {
    notify({
      message: `Size must be an increment of ${formattedMinOrderSize}`,
      variant: 'error',
    });
    return;
  }
  if (size < market.minOrderSize) {
    notify({ message: 'Size too small', variant: 'error' });
    return;
  }
  if (!isIncrement(price, market.tickSize)) {
    notify({
      message: `Price must be an increment of ${formattedTickSize}`,
      variant: 'error',
    });
    return;
  }
  if (price < market.tickSize) {
    notify({ message: 'Price under tick size', variant: 'error' });
    return;
  }
  const owner = wallet.publicKey;
  const transaction = new Transaction();
  const signers: Account[] = [];

  if (!baseCurrencyAccount) {
    const {
      transaction: createAccountTransaction,
      signer: createAccountSigners,
      newAccountPubkey,
    } = await createTokenAccountTransaction({
      connection,
      wallet,
      mintPublicKey: market.baseMintAddress,
    });
    transaction.add(createAccountTransaction);
    signers.push(createAccountSigners);
    baseCurrencyAccount = newAccountPubkey;
  }
  if (!quoteCurrencyAccount) {
    const {
      transaction: createAccountTransaction,
      signer: createAccountSigners,
      newAccountPubkey,
    } = await createTokenAccountTransaction({
      connection,
      wallet,
      mintPublicKey: market.quoteMintAddress,
    });
    transaction.add(createAccountTransaction);
    signers.push(createAccountSigners);
    quoteCurrencyAccount = newAccountPubkey;
  }

  const payer = side === 'sell' ? baseCurrencyAccount : quoteCurrencyAccount;
  if (!payer) {
    notify({
      message: 'Need an SPL token account for cost currency',
      variant: 'error',
    });
    return;
  }
  const params = {
    owner,
    payer,
    side,
    price,
    size,
    orderType,
    feeDiscountPubkey: feeDiscountPubkey || null,
  };
  console.log(params);

  const matchOrderstransaction = market.makeMatchOrdersTransaction(5);
  transaction.add(matchOrderstransaction);
  const startTime = getUnixTs();
  let {
    transaction: placeOrderTx,
    signers: placeOrderSigners,
  } = await market.makePlaceOrderTransaction(
    connection,
    params,
    120_000,
    120_000,
  );
  const endTime = getUnixTs();
  console.log(`Creating order transaction took ${endTime - startTime}`);
  transaction.add(placeOrderTx);
  transaction.add(market.makeMatchOrdersTransaction(5));
  signers.push(...placeOrderSigners);

  return await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Sending order...',
  });
}

export async function listMarket({
  connection,
  wallet,
  baseMint,
  quoteMint,
  baseLotSize,
  quoteLotSize,
  dexProgramId,
}: {
  connection: Connection;
  wallet: Wallet;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  baseLotSize: number;
  quoteLotSize: number;
  dexProgramId: PublicKey;
}) {
  const market = new Account();
  const requestQueue = new Account();
  const eventQueue = new Account();
  const bids = new Account();
  const asks = new Account();
  const baseVault = new Account();
  const quoteVault = new Account();
  const feeRateBps = 0;
  const quoteDustThreshold = new BN(100);

  async function getVaultOwnerAndNonce() {
    const nonce = new BN(0);
    while (true) {
      try {
        const vaultOwner = await PublicKey.createProgramAddress(
          [market.publicKey.toBuffer(), nonce.toArrayLike(Buffer, 'le', 8)],
          dexProgramId,
        );
        return [vaultOwner, nonce];
      } catch (e) {
        nonce.iaddn(1);
      }
    }
  }
  const [vaultOwner, vaultSignerNonce] = await getVaultOwnerAndNonce();

  const tx1 = new Transaction();
  tx1.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: baseVault.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(165),
      space: 165,
      programId: TokenInstructions.TOKEN_PROGRAM_ID,
    }),
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: quoteVault.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(165),
      space: 165,
      programId: TokenInstructions.TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeAccount({
      account: baseVault.publicKey,
      mint: baseMint,
      owner: vaultOwner,
    }),
    TokenInstructions.initializeAccount({
      account: quoteVault.publicKey,
      mint: quoteMint,
      owner: vaultOwner,
    }),
  );

  const tx2 = new Transaction();
  tx2.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: market.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        Market.getLayout(dexProgramId).span,
      ),
      space: Market.getLayout(dexProgramId).span,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: requestQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(5120 + 12),
      space: 5120 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: eventQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(262144 + 12),
      space: 262144 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: bids.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: asks.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
    DexInstructions.initializeMarket({
      market: market.publicKey,
      requestQueue: requestQueue.publicKey,
      eventQueue: eventQueue.publicKey,
      bids: bids.publicKey,
      asks: asks.publicKey,
      baseVault: baseVault.publicKey,
      quoteVault: quoteVault.publicKey,
      baseMint,
      quoteMint,
      baseLotSize: new BN(baseLotSize),
      quoteLotSize: new BN(quoteLotSize),
      feeRateBps,
      vaultSignerNonce,
      quoteDustThreshold,
      programId: dexProgramId,
    }),
  );

  const signedTransactions = await signTransactions({
    transactionsAndSigners: [
      { transaction: tx1, signers: [baseVault, quoteVault] },
      {
        transaction: tx2,
        signers: [market, requestQueue, eventQueue, bids, asks],
      },
    ],
    wallet,
    connection,
  });
  for (let signedTransaction of signedTransactions) {
    await sendSignedTransaction({
      signedTransaction,
      connection,
    });
  }

  return market.publicKey;
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

function mergeTransactions(transactions: (Transaction | undefined)[]) {
  const transaction = new Transaction();
  transactions
    .filter((t): t is Transaction => t !== undefined)
    .forEach((t) => {
      transaction.add(t);
    });
  return transaction;
}

function jsonRpcResult(resultDescription: any) {
  const jsonRpcVersion = struct.literal('2.0');
  return struct.union([
    struct({
      jsonrpc: jsonRpcVersion,
      id: 'string',
      error: 'any',
    }),
    struct({
      jsonrpc: jsonRpcVersion,
      id: 'string',
      error: 'null?',
      result: resultDescription,
    }),
  ]);
}

function jsonRpcResultAndContext(resultDescription: any) {
  return jsonRpcResult({
    context: struct({
      slot: 'number',
    }),
    value: resultDescription,
  });
}

const AccountInfoResult = struct({
  executable: 'boolean',
  owner: 'string',
  lamports: 'number',
  data: 'any',
  rentEpoch: 'number?',
});

export const GetMultipleAccountsAndContextRpcResult = jsonRpcResultAndContext(
  struct.array([struct.union(['null', AccountInfoResult])]),
);

export async function getMultipleSolanaAccounts(
  connection: Connection,
  publicKeys: PublicKey[],
): Promise<
  RpcResponseAndContext<{ [key: string]: AccountInfo<Buffer> | null }>
> {
  const args = [publicKeys.map((k) => k.toBase58()), { commitment: 'recent' }];
  // @ts-ignore
  const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args);
  const res = GetMultipleAccountsAndContextRpcResult(unsafeRes);
  if (res.error) {
    throw new Error(
      'failed to get info about accounts ' +
        publicKeys.map((k) => k.toBase58()).join(', ') +
        ': ' +
        res.error.message,
    );
  }
  assert(typeof res.result !== 'undefined');
  const accounts: Array<{
    executable: any;
    owner: PublicKey;
    lamports: any;
    data: Buffer;
  } | null> = [];
  for (const account of res.result.value) {
    let value: {
      executable: any;
      owner: PublicKey;
      lamports: any;
      data: Buffer;
    } | null = null;
    if (res.result.value) {
      const { executable, owner, lamports, data } = account;
      assert(data[1] === 'base64');
      value = {
        executable,
        owner: new PublicKey(owner),
        lamports,
        data: Buffer.from(data[0], 'base64'),
      };
    }
    accounts.push(value);
  }
  return {
    context: {
      slot: res.result.context.slot,
    },
    value: Object.fromEntries(
      accounts.map((account, i) => [publicKeys[i].toBase58(), account]),
    ),
  };
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
