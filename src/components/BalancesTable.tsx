import React, { useState, useEffect } from 'react';
import { useWallet, getProgramAccounts } from '../utils/wallet';
import WalletConnect from './WalletConnect';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { findNameFromMint, roundToDecimal } from '../utils/utils';
import getCoinIcon from '../utils/icons';
import { ExplorerLink } from './Link';
import SendReceiveDialogButton from './SendReceiveDialog';
import { useSolBalance, useTokenAccounts, USE_TOKENS } from '../utils/tokens';

const useStyles = makeStyles({
  centeredContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '10%',
    marginLeft: '10%',
    marginTop: '5%',
    marginBottom: '5%',
  },
  table: {
    width: '900px',
  },
  tableText: {
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 24,
    color: 'rgb(0,0,0,0.5)',
  },
  tableTitle: {
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 24,
    color: 'black',
  },
});

const BalancesTable = () => {
  const classes = useStyles();
  const { wallet, connected } = useWallet();
  const [solBalance] = useSolBalance();
  const [tokenAccounts] = useTokenAccounts();

  let rows = (tokenAccounts || [])
    .map((token) => {
      return {
        name: findNameFromMint(token.account.data.parsed.info.mint),
        mint: token.account.data.parsed.info.mint,
        balance: roundToDecimal(
          token.account.data.parsed.info.tokenAmount.uiAmount,
          2,
        ),
        pubkey: token.pubkey,
      };
    })
    .filter((row) => row.balance > Math.pow(10, -3)) // Remove dust
    .sort((a, b) => b.balance - a.balance);

  const knownTokens = rows
    .map((t) => {
      if (USE_TOKENS.find((e) => e.address.toBase58() === t.mint)) {
        return t;
      }
    })
    .filter((e) => !!e)
    .sort((a, b) => a.name.localeCompare(b.name));

  const unknownTokens = rows.filter((e) => !knownTokens.includes(e));

  knownTokens.push(...unknownTokens);

  console.log(knownTokens);

  if (!connected) {
    return (
      <div className={classes.centeredContainer}>
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className={classes.centeredContainer}>
      <Table className={classes.table} aria-label="balance table">
        <TableBody>
          {knownTokens.map((row, index) => {
            const length = row.mint.length;
            return (
              <TableRow key={`${index}-${row.mint}`}>
                <TableCell scope="row">
                  <img src={getCoinIcon(row.name)} height="30px" alt="" />
                </TableCell>

                <TableCell scope="row">
                  <ExplorerLink
                    address={row.mint}
                    // @ts-ignore
                    className={classes.tableText}
                  >
                    {row.name
                      ? row.name
                      : row.mint.slice(0, 5) +
                        '...' +
                        row.mint.slice(length - 5, length)}
                  </ExplorerLink>
                </TableCell>
                <TableCell scope="row" className={classes.tableText}>
                  {row.balance}
                </TableCell>
                <TableCell scope="row" className={classes.tableText}>
                  <SendReceiveDialogButton
                    pubkey={row.pubkey}
                    mint={row.mint}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default BalancesTable;
