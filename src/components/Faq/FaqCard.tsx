import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import QUESTIONS_ANSWERS, { QnA } from './QuestionsAndAnswers';
import { nanoid } from 'nanoid';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    question: {
      fontSize: 24,
      fontWeight: 600,
    },
    answer: {
      fontSize: 20,
    },
  }),
);

const FaqRow = ({ faqRow }: { faqRow: QnA }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="body1" className={classes.question}>
        {faqRow.question}
      </Typography>
      <Typography variant="body1" className={classes.answer}>
        {faqRow.answer}
      </Typography>
    </>
  );
};

const FaqCard = () => {
  return (
    <>
      {QUESTIONS_ANSWERS.map((row) => {
        return <FaqRow faqRow={row} key={nanoid()} />;
      })}
    </>
  );
};

export default FaqCard;
