import React from 'react';
import Link from '../Link';
import HelpUrls from '../../utils/HelpUrls';
export interface QnA {
  question: JSX.Element;
  answer: JSX.Element;
}

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
