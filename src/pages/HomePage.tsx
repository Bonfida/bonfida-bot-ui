import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CustomButton from "../components/CustomButton";
import Grid from "@material-ui/core/Grid";
import Emoji from "../components/Emoji";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "50px",
  },
  title: {
    color: "#838383",
  },
  exploreContainer: {
    paddingTop: "50px",
  },
});

const Banner = () => {
  const classes = useStyles();
  return (
    <div className={classes.bannerContainer}>
      <Emoji style={{ fontSize: 200 }} emoji="🤖" />
      <div>
        <Typography className={classes.title} align="center">
          Create and automate your very own trading strategies on chain
        </Typography>
      </div>
    </div>
  );
};

const HomePage = () => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.root}>
        <Banner />
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={5}
        >
          <Grid item>Strategy 1</Grid>
          <Grid item>Strategy 2</Grid>
        </Grid>
        <div className={classes.exploreContainer}>
          <CustomButton title="Explore the strategies" />
        </div>
      </div>
    </>
  );
};

export default HomePage;
