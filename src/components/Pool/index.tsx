import React, { useState, useEffect } from 'react';
import { USE_POOLS } from '../../utils/pools';
import FloatingCard from '../FloatingCard';
import DepositInput from '../DepositInput';
import robot from '../../assets/icons/illustrations/robot-top-bar.svg';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../TabPanel';
import {
  tokenNameFromMint,
  useTokenAccounts,
  useBalanceForMint,
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
  findUserAccountsForMint,
} from '../../utils/tokens';
import Divider from '../Divider';
import { useEffectAfterTimeout, useLocalStorageState } from '../../utils/utils';
import { PublicKey } from '@solana/web3.js';
import {
  usePoolBalance,
  usePoolInfo,
  usePoolUsdBalance,
} from '../../utils/pools';
import bs58 from 'bs58';
import { useConnection } from '../../utils/connection';
import {
  fetchPoolBalances,
  BONFIDABOT_PROGRAM_ID,
  fetchPoolInfo,
  deposit,
  Numberu64,
  redeem,
} from 'bonfida-bot';
import CustomButton from '../CustomButton';
import InformationRow from '../InformationRow';
import { roundToDecimal, abbreviateAddress } from '../../utils/utils';
import Emoji from '../Emoji';
import { ExplorerLink } from '../Link';
import { notify } from '../../utils/notifications';
import Spin from '../Spin';
import { marketNameFromAddress } from '../../utils/markets';
import { useWallet } from '../../utils/wallet';
import { Transaction, Account, TransactionInstruction } from '@solana/web3.js';
import { sendTransaction } from '../../utils/send';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    poolTitle: {
      fontSize: 30,
    },
  }),
);

const VerifiedPool = ({ isVerified }: { isVerified: boolean }) => {
  if (isVerified) {
    return (
      <Chip
        label="Verified Pool"
        color="primary"
        deleteIcon={<DoneIcon />}
        style={{ backgroundColor: '#51d07b' }}
      />
    );
  }
  return (
    <Chip
      label="Unverified Pool"
      color="primary"
      deleteIcon={<WarningIcon />}
      style={{ backgroundColor: '#BA0202' }}
    />
  );
};

const PoolTitle = ({ poolName }: { poolName: string }) => {
  const classes = useStyles(0);
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <img src={robot} style={{ height: 70 }} />
      </Grid>
      <Grid item>
        <Typography variant="h1" className={classes.poolTitle}>
          {poolName}
        </Typography>
      </Grid>
    </Grid>
  );
};

const PoolInformation = ({
  poolSeed,
  tokenAccounts,
}: {
  poolSeed: PublicKey;
  tokenAccounts: any;
}) => {
  // Tabs avec contenu de la pool + Description + Owner +  historical returns?
  const [poolBalance] = usePoolBalance(poolSeed);
  const [poolInfo] = usePoolInfo(poolSeed);
  const pool = USE_POOLS.find(
    (p) => p.poolSeed.toBase58() === poolSeed.toBase58(),
  );

  const userPoolTokenBalance = useBalanceForMint(
    tokenAccounts,
    poolInfo?.mintKey.toBase58(),
  );

  const poolMarkets = poolInfo?.authorizedMarkets;

  let usdValue = usePoolUsdBalance(poolBalance ? poolBalance[1] : null);

  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  return (
    <>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange}
        centered
      >
        <Tab label="Pool Content" />
        <Tab label="Pool Information" />
      </Tabs>
      {/* Content of the pool */}
      <TabPanel value={tab} index={0}>
        <InformationRow
          label="Pool Token Supply"
          value={poolBalance ? poolBalance[0]?.uiAmount : 0}
        />
        <InformationRow
          label="USD Value of the Pool"
          value={`$${roundToDecimal(usdValue, 2)}`}
        />
        <Typography variant="body1">Tokens in the pool:</Typography>
        {poolBalance &&
          poolBalance[1]?.map((asset) => {
            return (
              <div style={{ marginLeft: 10 }}>
                <InformationRow
                  // Abbrev raw mint
                  label={'- ' + tokenNameFromMint(asset.mint) || asset.mint}
                  value={asset.tokenAmount.uiAmount}
                />
              </div>
            );
          })}
        <InformationRow
          label="Your Share of the Pool"
          value={userPoolTokenBalance?.toLocaleString() || 0}
        />
      </TabPanel>
      {/* Pool Description if whitelisted */}
      <TabPanel value={tab} index={1}>
        {pool ? (
          <>
            <Typography variant="body1">{pool.description}</Typography>
          </>
        ) : (
          <>
            <Typography variant="body1">
              <Emoji emoji="⚠️" />
              This pool is unverified, use at your own risk
            </Typography>
          </>
        )}
        <Typography variant="body1" style={{ marginTop: 10 }}>
          Pool Keys:
        </Typography>
        <InformationRow
          label=" - Signal Provider:"
          value={
            <ExplorerLink address={poolInfo?.signalProvider.toBase58()}>
              {abbreviateAddress(poolInfo?.signalProvider, 7)}
            </ExplorerLink>
          }
        />
        <InformationRow
          label=" - Pool Address"
          value={
            <ExplorerLink address={poolInfo?.address.toBase58()}>
              {abbreviateAddress(poolInfo?.address, 7)}
            </ExplorerLink>
          }
        />
        <InformationRow
          label=" - Pool Token Mint"
          value={
            <ExplorerLink address={poolInfo?.mintKey.toBase58()}>
              {abbreviateAddress(poolInfo?.mintKey, 7)}
            </ExplorerLink>
          }
        />
        <Typography variant="body1" style={{ marginBottom: 10, marginTop: 10 }}>
          The pool can only trade on the following markets:
        </Typography>
        <div style={{ margin: 10 }}>
          {poolMarkets?.map((m) => {
            return (
              <InformationRow
                label={marketNameFromAddress(m)}
                value={
                  <ExplorerLink address={m.toBase58()}>
                    {abbreviateAddress(m, 7)}
                  </ExplorerLink>
                }
              />
            );
          })}
        </div>
      </TabPanel>
    </>
  );
};

export const PoolPanel = ({ poolSeed }: { poolSeed: string }) => {
  // TODO Different cases whether the pool is known or unknown
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const www = USE_POOLS.find((p) => p.poolSeed.toBase58() === poolSeed);
  const [poolInfo] = usePoolInfo(new PublicKey(poolSeed));
  const [poolBalance] = usePoolBalance(new PublicKey(poolSeed));

  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  const [mint, setMint] = useState<undefined | string>('');
  const [amount, setAmount] = useState('0');
  const [tokenAccounts] = useTokenAccounts();
  const balance = useBalanceForMint(tokenAccounts, mint);

  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);

  console.log('poolInfo', poolInfo);

  console.log(poolInfo?.mintKey.toBase58(), poolInfo?.assetMintkeys);

  useEffect(() => {
    if (poolInfo) {
      setMint(poolInfo.mintKey.toBase58());
    }
  }, [poolInfo]);

  useEffect(() => {
    // Recompute Deposit quote
    const parsedAmount = parseFloat(amount);
    if (!poolBalance || isNaN(parsedAmount) || parsedAmount <= 0) {
      setQuote(null);
      return;
    }
    let newQuote = '';
    newQuote += `${amount} Pool Token  = `;
    const poolTokenSupply = poolBalance[0].uiAmount;
    for (let i = 0; i < poolBalance[1].length; i++) {
      let b = poolBalance[1][i];
      newQuote += `${roundToDecimal(
        (b.tokenAmount.uiAmount / poolTokenSupply) * parseFloat(amount),
        3,
      )} ${tokenNameFromMint(b.mint)}`;
      if (i != poolBalance.length - 1) {
        newQuote += ' + ';
      }
    }
    setQuote(newQuote);
  }, [amount, poolBalance]);

  const onSubmit = async () => {
    if (!connected) {
      notify({
        message: 'Please connect your wallet',
        variant: 'info',
      });
    }
    // Checks enough in wallet, !isNaN amount
    if (!poolInfo || !tokenAccounts || !poolBalance) {
      notify({
        message: 'Try again',
        variant: 'error',
      });
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      notify({
        message: 'Invalid amount',
        variant: 'error',
      });
      return;
    }
    try {
      setLoading(true);
      notify({
        message: 'Initiating the deposit',
        variant: 'info',
      });

      let sourceAssetKeys: PublicKey[] = [];
      const poolAssetsMints = poolInfo.assetMintkeys.map((a) => a.toBase58());

      for (let mint of poolAssetsMints) {
        const account = tokenAccounts.find(
          (acc) => acc.account.data.parsed.info.mint === mint,
        );
        if (!account) {
          // Create associated token accounts
          const createdAccount = await createAssociatedTokenAccount(
            connection,
            wallet,
            new PublicKey(mint),
          );
          const associatedTokenAccount = await findAssociatedTokenAddress(
            wallet.publicKey,
            new PublicKey(mint),
          );
          sourceAssetKeys.push(associatedTokenAccount);
        } else {
          sourceAssetKeys.push(new PublicKey(account.pubkey));
        }
      }
      let instructions: TransactionInstruction[] = [];
      if (tab === 0) {
        // Tab === 0 => Deposit
        instructions = await deposit(
          connection,
          BONFIDABOT_PROGRAM_ID,
          wallet.publicKey,
          sourceAssetKeys,
          new Numberu64(parsedAmount * Math.pow(10, poolBalance[0].decimals)),
          [new PublicKey(poolSeed).toBuffer()],
          wallet.publicKey,
        );
      } else if (tab === 1) {
        // Tab === 1 => Withdraw
        const userPoolTokenAddress = findUserAccountsForMint(
          tokenAccounts,
          poolInfo.mintKey.toBase58(),
        );
        if (!userPoolTokenAddress) {
          notify({
            message: 'Error - token account does not exist',
            variant: 'error',
          });
        }

        const sourcePoolTokenKey = await findAssociatedTokenAddress(
          wallet?.publicKey,
          poolInfo.mintKey,
        );

        instructions = await redeem(
          connection,
          BONFIDABOT_PROGRAM_ID,
          wallet?.publicKey,
          sourcePoolTokenKey,
          sourceAssetKeys,
          [new PublicKey(poolSeed).toBuffer()],
          new Numberu64(parsedAmount * Math.pow(10, poolBalance[0].decimals)),
        );
      } else {
        notify({
          message: 'Error',
          variant: 'error',
        });
      }

      const tx = new Transaction();
      const signers: Account[] = [];

      tx.add(...instructions);

      const result = await sendTransaction({
        transaction: tx,
        wallet,
        connection,
        signers,
        sendingMessage: `${tab === 0 ? 'Depositing' : 'Withdrawing'}...`,
      });

      // Else invalid operation
    } catch (err) {
      console.warn(`Error ${tab === 0 ? 'Depositing' : 'Withdrawing'} ${err}`);
      notify({
        message: `Error ${tab === 0 ? 'Depositing' : 'Withdrawing'} ${err}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: 700, padding: 20, margin: 20 }}>
      <FloatingCard>
        {/* Header */}
        <VerifiedPool isVerified />
        {/* Deposit/Withdraw tokens */}
        <PoolTitle poolName={www?.name || ''} />
        <Divider
          width="80%"
          height="1px"
          background="#B80812"
          marginLeft="auto"
          marginRight="auto"
          opacity={0.5}
          marginBottom="10px"
          marginTop="10px"
        />
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          centered
        >
          <Tab label="Deposit" />
          <Tab label="withdraw" />
        </Tabs>
        <DepositInput
          amountLabel="Pool Token"
          mint={mint}
          amount={amount}
          setAmount={setAmount}
          balance={balance}
        />
        {/* Show something like 1 Pool Token = x FIDA + y USDC + ... */}
        {poolBalance && quote && (
          <>
            <Typography variant="body1" align="center">
              {quote}
            </Typography>
          </>
        )}
        {/* Pool info */}
        <Divider
          width="80%"
          height="1px"
          background="#B80812"
          marginLeft="auto"
          marginRight="auto"
          opacity={0.5}
          marginBottom="10px"
          marginTop="10px"
        />

        <PoolInformation
          poolSeed={new PublicKey(poolSeed)}
          tokenAccounts={tokenAccounts}
        />
        {/* Add www markets */}
        {/* Submit button */}
        <Divider
          width="80%"
          height="1px"
          background="#B80812"
          marginLeft="auto"
          marginRight="auto"
          opacity={0.5}
          marginBottom="10px"
          marginTop="10px"
        />
        <Grid container justify="center">
          <CustomButton onClick={onSubmit}>
            {loading ? <Spin size={20} /> : tab === 0 ? 'Deposit' : 'Withdraw'}
          </CustomButton>
        </Grid>
      </FloatingCard>
    </div>
  );
};
