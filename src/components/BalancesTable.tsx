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

const useStyles = makeStyles({
  centeredContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // border: '1px solid',
    // borderRadius: 30,
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
  const [tokenAccounts, setTokenAccounts] = useState<null | any>(null);

  useEffect(() => {
    const get = async () => {
      const result = await getProgramAccounts(wallet?.publicKey);
      setTokenAccounts(result);
    };
    get();
  }, [connected]);

  const rows = (tokenAccounts || [])
    .map((token) => {
      return {
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
          {rows.map((row, index) => {
            const tokenName = findNameFromMint(row.mint);
            const length = row.mint.length;
            return (
              <TableRow key={`${index}-${row.mint}`}>
                <TableCell scope="row">
                  <img src={getCoinIcon(tokenName)} height="30px" alt="" />
                </TableCell>

                <TableCell scope="row">
                  <ExplorerLink
                    address={row.mint}
                    // @ts-ignore
                    className={classes.tableText}
                  >
                    {tokenName
                      ? tokenName
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
