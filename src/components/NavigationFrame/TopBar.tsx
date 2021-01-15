import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import useTheme from "@material-ui/core/styles/useTheme";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import { useHistory, useLocation } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Emoji from "../Emoji";
import WalletConnect from "../WalletConnect";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  AppBar: {
    marginTop: "40px",
    background: "transparent",
  },
  logo: {
    paddingLeft: "100px",
    cursor: "pointer",
  },
  buttonContainer: {
    paddingRight: "100px",
  },
  text: { fontSize: "14px", fontWeight: 900, textTransform: "capitalize" },
  button: {
    color: "#838383",
    paddingLeft: "25px",
    paddingRight: "25px",
    paddingTop: "10px",
    paddingButton: "10px",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "unset",
      color: "#BA0202",
    },
  },
});

const topBarElement = [
  {
    name: "home",
    href: "/",
  },
  {
    name: "explore",
    href: "/explore",
  },
  {
    name: "account",
    href: "/account",
  },
  {
    name: "trade",
    href: "/trade",
  },
  {
    name: "about",
    href: "/about",
  },
];

const TopBar = () => {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  let theme = useTheme();
  let smallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedIndex, setSelectedIndex] = React.useState<string | null>(null);

  useEffect(() => {
    if (location.pathname.includes("explore")) {
      setSelectedIndex("explore");
    } else if (location.pathname.includes("account")) {
      setSelectedIndex("account");
    } else if (location.pathname.includes("trade")) {
      setSelectedIndex("trade");
    } else if (location.pathname.includes("about")) {
      setSelectedIndex("about");
    } else {
      setSelectedIndex("home");
    }
  }, [location]);

  return (
    <div className={classes.root}>
      <AppBar className={classes.AppBar} position="static" elevation={0}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          {!smallScreen && (
            <Grid item>
              Bonfida Bot
              <Emoji style={{ fontSize: 40 }} emoji="🤖" />
            </Grid>
          )}
          <Grid item>
            {topBarElement.map((e) => {
              return (
                <Button
                  className={classes.button}
                  onClick={() => history.push(e.href)}
                  style={{
                    color:
                      selectedIndex === e.name ? "#BA0202" : "rgb(132,132,132)",
                  }}
                >
                  {e.name}
                </Button>
              );
            })}
          </Grid>
          <Grid item className={classes.buttonContainer}>
            <WalletConnect />
          </Grid>
        </Grid>
      </AppBar>
    </div>
  );
};

export default TopBar;
