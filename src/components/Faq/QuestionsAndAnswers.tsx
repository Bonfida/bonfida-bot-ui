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
            "poolSeed": "poolSeed", <br />
            "size": "size of your order", <br />
            "side": "side", <br />
            "auth": "tradingViewAuthToken", <br />
            "marketName": "marketName" <br />
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
              "poolSeed": "DhCEYSbw2uHdDBt2D7Xaxdy2LUUSKk11Kvpd1WJFEwGy", <br />
              "size": "10", <br />
              "side": "buy", <br />
              "auth":
              "3d7NfKp7ddFWXcuPd1BrJFkb2VEmo4EnNa9Yocus3Pf4vRy4ufvtKvuA2bmT595cgiaizMyZA1Ma1zAdQwH68oiT",{' '}
              <br />
              "marketName": "FIDA/USDC" <br />
              {'}'}
            </div>
          </li>
          <li style={styles.margin}>
            <Emoji emoji="💡" />{' '}
            <a href="/#/tradingview-generator">
              You can use our TradingView Message Generator
            </a>
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

export const TV_TUTORIAL_ZH: Step[] = [
  {
    title: <>创建自定义资金池</>,
    text: (
      <>
        第一步：创建一个自定义的资金池，前往
        <Link to="/create">创建页面</Link>.
        <ul style={styles.margin}>
          <li style={styles.margin}>
            勾选“使用外部信号提供者”，然后选择TradingView警报
          </li>
          <li style={styles.margin}>
            选择您要交易的市场，例如FIDA /
            USDC。请注意，您可以为一个资金池选择多个交易市场。
            <Emoji emoji="⚠️" />
            请注意您无法在创建后向资金池中添加新的交易对。
          </li>
          <li style={styles.margin}>
            选择开始时要在池中存入的通证类别和数量。您可以随时存入更多通证，但是，初始存入的通证种类和数量将确定1枚池通证的初始组成。例如，如果您决定先存入100
            USDC + 10 FIDA，则1枚池通证= 100 USDC + 10 FIDA。
          </li>
          <li style={styles.margin}>点击“创建”并且在钱包弹出窗口确认交易。</li>
          <li style={styles.margin}>
            旦交易被确认，用户会收到池种子以及Trading View Auth Token,
            请将Trading View Auth Token保存于安全的地方。
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
    title: <>设置TradingView警报</>,
    text: (
      <>
        现在，前往
        <Link external to="https://tradingview.com">
          TradingView
        </Link>{' '}
        图表页面选择你喜欢的交易指标。比如，我们选择MACD作为例子。
        <ul style={styles.margin}>
          <li style={styles.margin}>点击“警报”</li>
          <li style={styles.margin}>
            在“条件”选项栏选择交易指标。以MACD为例，交易策略是当直方图从负变为正的时候，做多标的资产
          </li>
          <li style={styles.margin}>选择”无限制“如果您希望策略永远生效</li>
          <li style={styles.margin}>
            在”警报操作“这里选择Webhook URL,
            并且输入https://tradingview-cranker.bonfida.com/alerts
          </li>
          <li style={styles.margin}>给警报取个名字，比如说Bonfida Bot</li>
          <li style={styles.margin}>
            在”消息“这里，您需要输入有关的参数：marketName, auth, poolSeed,
            side, size，并且完全遵照下面的格式
            {'{'}
            <br />
            "poolSeed": "poolSeed", <br />
            "size": "size of your order", <br />
            "side": "side", <br />
            "auth": "tradingViewAuthToken", <br />
            "marketName": "marketName" <br />
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
              "poolSeed": "DhCEYSbw2uHdDBt2D7Xaxdy2LUUSKk11Kvpd1WJFEwGy", <br />
              "size": 10, <br />
              "side": "buy", <br />
              "auth":
              "3d7NfKp7ddFWXcuPd1BrJFkb2VEmo4EnNa9Yocus3Pf4vRy4ufvtKvuA2bmT595cgiaizMyZA1Ma1zAdQwH68oiT",{' '}
              <br />
              "marketName": "FIDA/USDC" <br />
              {'}'}
            </div>
          </li>
          <li style={styles.margin}>
            <Emoji emoji="💡" />{' '}
            <a href="/#/tradingview-generator">
              您可以使用TradingView信息生成器 （建议使用）
            </a>
          </li>
          <li style={styles.margin}>
            <Emoji emoji="⚠️" />{' '}
            side方向可以是“buy”买入或者”sell“卖出。请注意这一栏需要区分大小写，大写的BUY或者Buy都不可生效。
          </li>
          <li style={styles.margin}>
            <Emoji emoji="⚠️" />
            marketName需要是您的自定义资金池可以交易的正确且存在的Serum市场。这一栏也需要区分大小写，并遵循一定格式。请参考如下正确和不正确的格式：
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
            <Emoji emoji="⚠️" />{' '}
            Size订单规模需要基于0到100之间的数字，代表着用于执行订单的池内资金百分比。比如一个标记10的
            ”买入“订单信号发送到一个拥有1000 USDC的资金池，该池会使用1000
            USDC的10% —100 USDC来执行订单。
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
    question: <>What are Bonfida Bots?</>,
    answer: (
      <>
        A Bonfida Bot is a basket of tokens controlled by a smart contract that
        follows a strategy provided by a Signal Provider.
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

export const QUESTIONS_ANSWERS_ZH: QnA[] = [
  {
    question: <>什么是Bonfida程式交易机器人？</>,
    answer: (
      <>
        Bonfida程式交易机器人是通过智能合约控制的一篮子通证，这个智能合约会跟随信号提供者的交易策略对标的资产进行对应的操作，从而达到自动化交易的目的。
      </>
    ),
  },
  {
    question: <>如何在池子里存入通证</>,
    answer: (
      <>
        用户可以使用UI或
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>
        将通证存入池中。通证的存放比例必须与现有池中通证的比例相匹配。入金用户会收到代表入金证明的池子通证。例如1枚池子的通证为
        10 USDC + 1 FIDA， 入金用户需要存入10 USDC +1
        FIDA来获取对应的1枚池子通证。
      </>
    ),
  },
  {
    question: <>如何从池中提取？</>,
    answer: (
      <>
        池子通证的所有者可以随时从池中提取对应的标的通证。提取时，用户将收到与他们拥有的池通证相对应的标的通证。请注意，提取时一枚池通证的各组成可能与入金时的不同。
      </>
    ),
  },
  {
    question: <>交易手续费包括了什么？</>,
    answer: (
      <>
        资金池的费用由信号提供者在创建池子时设置。因此，所有的资金池有不同的费用结构。在入金某一个资金池时，请务必了解清楚对应的费用。
      </>
    ),
  },
  {
    question: <>如何设置信号</>,
    answer: (
      <>
        交易信号是由信号提供者通过UI手动，或者通过使用
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>
        的命令发送的链上交易。
      </>
    ),
  },
  {
    question: <>如何收集手续费</>,
    answer: (
      <>
        当创建资金池时，信号提供者定义费用期限和费用比率。收费期是每次收费之间的时间间隔，收费比率是每个期间将要收取的资金池总量的比率。（如0.1%/每月，意味着每个月固定一天收取当日资金池内总金额的0.1%
        ） 要收取费用时，信号提供者可以使用UI或调用
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>
        的费用收取方法。
      </>
    ),
  },
  {
    question: <>如何建立资金池</>,
    answer: (
      <>
        创建加密货币资金池是没有权限要求的，可以通过UI或使用
        <Link external to={HelpUrls.bonfidaBotDocs}>
          Javascript SDK
        </Link>
        调用CreatePool方法来完成此操作。
      </>
    ),
  },
  {
    question: <>交易策略一定需要上链吗？</>,
    answer: (
      <>
        您的策略可以在链上或者链下运行，唯一必须在链上的是信号，即策略的输出。这意味着您不必公开Alpha。
      </>
    ),
  },
  {
    question: <>其他用户会抢先交易我的策略吗？</>,
    answer: (
      <>
        如果您决定在链上公开您的策略，的确存在抢先交易的风险。但是，如果您决定将交易策略保持在链下，则没有该风险。
      </>
    ),
  },
  {
    question: <>哪里找到开发相关的资源？</>,
    answer: (
      <>
        开发资源：
        <Link external to={HelpUrls.bonfidaBotDocs}>
          这里
        </Link>
      </>
    ),
  },
  {
    question: <>不是技术人员的话，仍旧可以设置交易信号吗？</>,
    answer: <>是的，非技术开发人员可以使用UI设置交易信号。</>,
  },
];

export default QUESTIONS_ANSWERS;
