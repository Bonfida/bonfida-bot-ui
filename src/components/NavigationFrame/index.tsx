import React from 'react';
import TopBar from './TopBar';
import Footer from './Footer';
import { useLocalStorageState } from '../../utils/utils';
import { Typography, Grid } from '@material-ui/core';
import CustomButton from '../CustomButton';
import FloatingCard from '../FloatingCard';
import Trans from '../Translation';

const styles = {
  terms: {
    fontWeight: 600,
  },
  agreeButton: {
    marginTop: 30,
  },
};

const Disclaimer = ({ setTerms }: { setTerms: (args: any) => void }) => {
  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      direction="column"
      style={{ marginTop: '20vh' }}
    >
      <div style={{ width: '60%' }}>
        <FloatingCard>
          <Grid
            container
            justify="center"
            alignItems="center"
            direction="column"
          >
            <Grid item>
              <Typography variant="body1" align="center" style={styles.terms}>
                <Trans>
                  No statement or warranty is provided in relation to the
                  utility of this program, the safety of its code or its
                  suitability for your use, and by using it, you agree to bear
                  any risk associated with such potential vulnerabilities,
                  including, but not limited to the potential loss of tokens.
                </Trans>
              </Typography>
            </Grid>
            <Grid item style={styles.agreeButton}>
              <CustomButton onClick={() => setTerms(true)}>
                <Trans>I Agree</Trans>
              </CustomButton>
            </Grid>
          </Grid>
        </FloatingCard>
      </div>
    </Grid>
  );
};

const NavigationFrame = ({ children }: { children: React.ReactNode }) => {
  const [terms, setTerms] = useLocalStorageState('terms', false);
  if (!terms) {
    return <Disclaimer setTerms={setTerms} />;
  }
  return (
    <>
      <TopBar />
      <div
        style={{
          flexGrow: 1,
          overflowX: 'hidden',
          overflowY: 'hidden',
          width: '100%',
        }}
      >
        {children}
      </div>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default NavigationFrame;
