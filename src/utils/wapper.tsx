import { Transaction } from '@solana/web3.js';
import {
  Token,
  TOKEN_PROGRAM_ID,
  AccountLayout,
  NATIVE_MINT,
} from '@solana/spl-token';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { Connection, Account, SystemProgram, PublicKey } from '@solana/web3.js';

export const makeCloseAccountTransaction = (
  accountToClose: PublicKey,
  wallet: Wallet,
) => {
  const tx = new Transaction();
  tx.add(
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      accountToClose,
      wallet.publicKey,
      wallet.publicKey,
      [],
    ),
  );
  return tx;
};

export const makeCreateWrappedNativeAccountTransaction = async (
  connection: Connection,
  amount: number,
  wallet: Wallet,
) => {
  // Allocate memory for the account
  const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
    connection,
  );

  // Create a new account
  const newAccount = new Account();
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: balanceNeeded,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  // Send lamports to it (these will be wrapped into native tokens by the token program)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: newAccount.publicKey,
      lamports: amount,
    }),
  );

  // Assign the new account to the native token mint.
  // the account will be initialized with a balance equal to the native token balance.
  // (i.e. amount)
  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      newAccount.publicKey,
      wallet.publicKey,
    ),
  );

  return { tx: transaction, newAccount: newAccount };
};
