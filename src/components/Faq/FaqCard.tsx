import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import QUESTIONS_ANSWERS, {
  QnA,
  TV_TUTORIAL,
  TV_TUTORIAL_ZH,
  Step,
  QUESTIONS_ANSWERS_ZH,
} from './QuestionsAndAnswers';
import { nanoid } from 'nanoid';
import ReactPlayer from 'react-player';
import HelpUrls from '../../utils/HelpUrls';
import { useTranslation } from 'react-i18next';
import Trans from '../Translation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontWeight: 600,
      marginBottom: 50,
    },
    question: {
      fontSize: 24,
      fontWeight: 600,
    },
    answer: {
      marginTop: 10,
      marginBottom: 10,
      fontSize: 20,
    },
    rowContainer: {
      margin: 20,
    },
    breakWord: {
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
    },
  }),
);

const FaqRow = ({ faqRow }: { faqRow: QnA }) => {
  const classes = useStyles();
  return (
    <div className={classes.rowContainer}>
      <Typography variant="body1" className={classes.question}>
        - {faqRow.question}
      </Typography>
      <Typography variant="body1" className={classes.answer}>
        {faqRow.answer}
      </Typography>
    </div>
  );
};

const TutorialRow = ({ tutorialRow }: { tutorialRow: Step }) => {
  const classes = useStyles();
  return (
    <div className={classes.rowContainer}>
      <Typography variant="body1" className={classes.question}>
        - {tutorialRow.title}
      </Typography>
      <Typography variant="body1" className={classes.answer}>
        {tutorialRow.text}
      </Typography>
    </div>
  );
};

const FaqCard = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  return (
    <>
      <Typography variant="h1" className={classes.title} align="center">
        F.A.Q
      </Typography>
      {(isZh ? QUESTIONS_ANSWERS_ZH : QUESTIONS_ANSWERS).map((row) => {
        return <FaqRow faqRow={row} key={nanoid()} />;
      })}
    </>
  );
};

export default FaqCard;

export const TradingViewCard = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  return (
    <>
      <div className={classes.breakWord}>
        <Typography variant="h1" className={classes.title} align="center">
          <Trans>Create a TradingView Pool</Trans>
        </Typography>
      </div>
      <Grid container justify="center">
        <ReactPlayer url={HelpUrls.youtubeTradingViewTutorial} />
      </Grid>
      {(isZh ? TV_TUTORIAL_ZH : TV_TUTORIAL).map((row) => {
        return <TutorialRow tutorialRow={row} key={nanoid()} />;
      })}
    </>
  );
};
