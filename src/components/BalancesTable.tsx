import React, { useState } from 'react';
import { useWallet } from '../utils/wallet';
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
import {
  tokenNameFromMint,
  useTokenAccounts,
  USE_TOKENS,
} from '../utils/tokens';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import FloatingCard from './FloatingCard';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles({
  table: {
    width: '900px',
    marginTop: 30,
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

const BalanceRow = ({ row }) => {
  const classes = useStyles();
  const length = row.mint.length;
  return (
    <TableRow>
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
            : row.mint.slice(0, 5) + '...' + row.mint.slice(length - 5, length)}
        </ExplorerLink>
      </TableCell>
      <TableCell scope="row" className={classes.tableText}>
        {row.balance}
      </TableCell>
      <TableCell scope="row" className={classes.tableText}>
        <SendReceiveDialogButton pubkey={row.pubkey} mint={row.mint} />
      </TableCell>
    </TableRow>
  );
};

const ShowZeroBalance = ({
  setZeroBalances,
  hideZeroBalances,
}: {
  setZeroBalances: (arg: any) => void;
  hideZeroBalances: boolean;
}) => {
  return (
    <Grid container alignItems="center" justify="flex-start" direction="row">
      <Grid item>
        <Checkbox
          checked={hideZeroBalances}
          onChange={() => setZeroBalances((prev) => !prev)}
        />
      </Grid>
      <Grid item>
        <Typography>Hide zero balances</Typography>
      </Grid>
    </Grid>
  );
};

const SearchBar = ({
  search,
  setSearch,
}: {
  search: string | null;
  setSearch: (arg: any) => void;
}) => {
  return (
    <Grid container alignItems="center" justify="flex-end" direction="row">
      <Grid item>
        <TextField
          id="outlined-basic"
          label="Search"
          variant="outlined"
          onChange={(e) => setSearch(e.target.value)}
          style={{ height: 30, padding: 0, width: 300 }}
        />
      </Grid>
    </Grid>
  );
};

const BalancesTable = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  const [tokenAccounts] = useTokenAccounts();
  const [hideZeroBalances, setZeroBalances] = useState(true);
  const [search, setSearch] = useState<string | null>(null);

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
    .filter((row) => (hideZeroBalances ? row.balance > 0 : true))
    .filter((row) =>
      search
        ? tokenNameFromMint(row.mint)
            ?.toLowerCase()
            ?.includes(search?.toLowerCase() || '')
        : true,
    )
    .sort((a, b) => b.balance - a.balance)
    .filter((e) => e);

  const knownTokens = rows
    .map((t) => {
      if (USE_TOKENS.find((e) => e.address.toBase58() === t.mint)) {
        return t;
      }
    })
    .filter((e) => e)
    .sort((a, b) => a.name.localeCompare(b.name));

  const unknownTokens = rows.filter((e) => !knownTokens.includes(e));

  knownTokens.push(...unknownTokens);

  if (!connected) {
    return (
      <Grid container alignItems="center" justify="center" direction="row">
        <WalletConnect />
      </Grid>
    );
  }

  return (
    <div>
      <FloatingCard>
        <Grid
          container
          alignItems="center"
          justify="space-around"
          direction="row"
        >
          <Grid item>
            <ShowZeroBalance
              hideZeroBalances={hideZeroBalances}
              setZeroBalances={setZeroBalances}
            />
          </Grid>
          <Grid item>
            <SearchBar search={search} setSearch={setSearch} />
          </Grid>
        </Grid>
        <Table className={classes.table} aria-label="balance table">
          <TableBody>
            {knownTokens.map((row, i) => {
              return <BalanceRow row={row} key={`balance-row-${i}`} />;
            })}
          </TableBody>
        </Table>
      </FloatingCard>
    </div>
  );
};

export default BalancesTable;
