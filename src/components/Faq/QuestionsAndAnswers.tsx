import React from 'react';
import Link from '../Link';
import HelpUrls from '../../utils/HelpUrls';
import Emoji from '../Emoji';
import Grid from '@material-ui/core/Grid';
import tv1 from '../../assets/tv-tutorial/tv-tutorial-1.png';
import tv2 from '../../assets/tv-tutorial/tv-tutorial-2.png';
import tv3 from '../../assets/tv-tutorial/tv-tutorial-3.png';

export interface QnA {
  question: JSX.Element;
  answer: JSX.Element;
}

export interface Step {
  title: JSX.Element;
  text: JSX.Element;
}

const styles = {
  img: {
    width: '80%',
    margin: 20,
  },
  margin: {
    marginTop: 30,
    marginBottom: 30,
  },
  breakWord: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
  },
};

export const TV_TUTORIAL: Step[] = [
  {
    title: <>Create your custom pool</>,
    text: (
      <>
        First step is to create your own custom pool, for this go to{' '}
        <Link to="/create">the create pool page</Link>.
        <ul style={styles.margin}>
          <li style={styles.margin}>
            Tick the <b>Use an external signal provider</b> and select{' '}
            <b>TradingView Alerts</b>
          </li>
          <li style={styles.margin}>
            Select the markets on which you want to trade, e.g <b>FIDA/USDC</b>.
            Note that you can select several markets for a signle pool.{' '}
            <Emoji emoji="⚠️" />
            You cannot add a market to the pool after its creation.
          </li>
          <li style={styles.margin}>
            Select how many assets you want to deposit in the pool at the
            beginning. You can deposit more at anytime. However, the initial
            amount deposited will determine the initial value of a pool token.
            For instance, if you decide to deposit first 100 USDC + 10 FIDA, 1
            Pool Token = 100 USDC + 10 FIDA.
          </li>
          <li style={styles.margin}>
            Click on <b>Create</b> and approve the transactions in the wallet
            pop up.
          </li>
          <li style={styles.margin}>
            Once the transactions have been confirmed you will received a{' '}
            <b>Pool Seed</b> and a <b>TradingView Auth Token</b> save the{' '}
            <b>TradingView Auth Token</b> in a safe place.
          </li>
          <Grid
            container
            justify="center"
            spacing={5}
            direction="column"
            alignItems="center"
          >
            <Grid item>
              <img src={tv1} style={styles.img} alt="" />
            </Grid>
            <Grid item>
              <img src={tv2} style={styles.img} alt="" />
            </Grid>
          </Grid>
        </ul>
      </>
    ),
  },
  {
    title: <>Set up TradingView Alert</>,
    text: (
      <>
        Now, go to{' '}
        <Link external to="https://tradingview.com">
          TradingView
        </Link>{' '}
        on the chart page with your favourite indicator on. For this example, we
        will use MACD.
        <ul style={styles.margin}>
          <li style={styles.margin}>
            Click on <b>Alert</b>
          </li>
          <li style={styles.margin}>
            Select your indicator in the condition row of the form. In our case,
            it's MACD, so the strategy is to go long when the histogram is
            crossing up above 0
          </li>
          <li style={styles.margin}>
            Select <b>Open-ended</b> if you want the strategy to run with no
            limit in time.
          </li>
          <li style={styles.margin}>
            In the <b>Alert Actions</b> tick the box <b>Webhook URL</b> and
            enter <b>https://tradingview-cranker.bonfida.com/alerts</b>
          </li>
          <li style={styles.margin}>
            Give a name to the alert, e.g <b>Bonfida Bot</b>
          </li>
          <li style={styles.margin}>
            In the message you will to enter the following parameters:{' '}
            <b>marketName</b>, <b>auth</b>, <b>poolSeed</b>, <b>side</b>,{' '}
            <b>size</b>.
            <br />
            <div style={{ marginTop: 20 }} />
            It needs to be done with the following format: <br />
            <div style={{ marginTop: 20 }} />
            {'{'}
            <br />
            poolSeed: "poolSeed", <br />
            size: "size of your order", <br />
            side: "side", <br />
            auth: "tradingViewAuthToken", <br />
            marketName: "marketName" <br />
            {'}'}
            <br />
            <div style={{ marginTop: 20 }} />
            For instance a valid message is: <br />
            <div
              style={{
                marginTop: 20,
                overflowWrap: 'break-word',
                wordWrap: 'break-word',
              }}
            >
              {'{'}
              <br />
              poolSeed: "DhCEYSbw2uHdDBt2D7Xaxdy2LUUSKk11Kvpd1WJFEwGy", <br />
              size: 10, <br />
              side: "buy", <br />
              auth:
              "3d7NfKp7ddFWXcuPd1BrJFkb2VEmo4EnNa9Yocus3Pf4vRy4ufvtKvuA2bmT595cgiaizMyZA1Ma1zAdQwH68oiT",{' '}
              <br />
              marketName: "FIDA/USDC" <br />
              {'}'}
            </div>
          </li>
          <li style={styles.margin}>
            <Emoji emoji="⚠️" /> <b>side</b> needs to be either <b>buy</b> or{' '}
            <b>sell</b>. This field is case sensitive, it means that <b>buy</b>{' '}
            is valid but <b>BUY</b> or <b>Buy</b> are not.
          </li>
          <li style={styles.margin}>
            <Emoji emoji="⚠️" /> <b>marketName</b> needs to be a valid Serum
            market on which your custom pool can trade. This field is case
            sensitive. Below are some example of valid and invalid market name{' '}
            <Emoji emoji="👇" />
            <br />
            <ul style={styles.margin}>
              <li style={styles.margin}>
                <b>Valid:</b> "BTC/USDC", "BTC/USDT", "ETH/USDC"
              </li>
              <li style={styles.margin}>
                <b>Not valid:</b> "BTC/USD", "btc/usdc", "BTCUSDC", "BTC-USDC"
              </li>
            </ul>
          </li>
          <li style={styles.margin}>
            <Emoji emoji="⚠️" /> <b>size</b> needs to be a number between 0 and
            100. It's the percentage of the pool's funds that will be used to
            execute the order. If a buy order is sent to a pool containing 1,000
            USDC with a size of 10 it will use 10% of 1,000 i.e 100 USDC
          </li>
        </ul>
        <Grid container justify="center">
          <img src={tv3} style={styles.img} alt="" />
        </Grid>
      </>
    ),
  },
];

const QUESTIONS_ANSWERS: QnA[] = [
  {
    question: <>What are pools?</>,
    answer: (
      <>
        Pools are a basket of tokens controlled by a smart contract that follows
        a strategy provided by a SOL address.
      </>
    ),
  },
  {
    question: <>How do I deposit tokens in a pool?</>,
    answer: (
      <>
        Users can deposit tokens into a pool by using the UI or using the{' '}
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>
        . Tokens need to be deposited in proportions that match the proportion
        of tokens in the pool. In return of depositing tokens users receive pool
        tokens that represent the proof of the deposit.
      </>
    ),
  },
  {
    question: <>How do I withdraw from a pool?</>,
    answer: (
      <>
        At any time, owners of pool tokens can withdraw from a pool. When
        withdrawing, people will receive the tokens contained in the pool in
        proportion to the pool tokens they owned.
      </>
    ),
  },
  {
    question: <>What are fees?</>,
    answer: (
      <>
        Fees are set by the signal provider at the time of the pool creation.
        Therefore, all pools have different fee structures. Make sure to check
        the fees before entering a pool!
      </>
    ),
  },
  {
    question: <>How do I send signals?</>,
    answer: (
      <>
        Signals are on chain transactions sent by the signal provider either
        manually using a UI or via command lines using the{' '}
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>
        .
      </>
    ),
  },
  {
    question: <>How do I collect fees?</>,
    answer: (
      <>
        When creating a pool, signal providers define a fee period and a fee
        ratio. The fee period is the time interval between each fee collection
        and fee ratio is the ratio of the pool that will be collected each
        period. To collect fees signal providers can either use the UI or invoke
        the collectFees method of the{' '}
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>
        .
      </>
    ),
  },
  {
    question: <>How do I create a pool?</>,
    answer: (
      <>
        Creating a pool is permissionless , this can be done from the UI or
        using the{' '}
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>{' '}
        by invoking the createPool method
      </>
    ),
  },
  {
    question: <>Does my strategy have to be on chain?</>,
    answer: (
      <>
        Your strategy can be running on chain or off chain, the only thing that
        is necessarily on chain is the signal i.e the output from your strategy.
        This means you do not have to expose your alpha.
      </>
    ),
  },
  {
    question: <>Can people front run my strategy?</>,
    answer: (
      <>
        If you decide to expose your strategy on chain yes there is a risk of
        front running, however, if you decide to keep your strategy off chain
        there is no risk of front running.
      </>
    ),
  },
  {
    question: <>Where do I find developer resources?</>,
    answer: (
      <>
        Developer resources can be found{' '}
        <Link external to={HelpUrls.bonfidaBotDocs}>
          here
        </Link>
      </>
    ),
  },
  {
    question: <>I am not a technical person, can I still send signals?</>,
    answer: <>Yes, it’s possible! Signals can be sent using a UI</>,
  },
];

export default QUESTIONS_ANSWERS;
