export interface QnA {
  question: JSX.Element;
  answer: JSX.Element;
}

const QUESTIONS_ANSWERS: QnA[] = [
  {
    question: <>What are pools?</>,
    answer: (
      <>
        Pools are a basket of tokens controlled by a smart contract which
        follows a strategy provided by a SOL address
      </>
    ),
  },
];

export default QUESTIONS_ANSWERS;
