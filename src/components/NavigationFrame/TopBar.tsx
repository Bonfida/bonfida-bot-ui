import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import useTheme from "@material-ui/core/styles/useTheme";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import UnlockButton from "../UnlockButton";
import Grid from "@material-ui/core/Grid";
import Emoji from "../Emoji";

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
  const classes = useStyles();
  let theme = useTheme();
  let smallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedIndex, setSelectedIndex] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (window.location.href.includes("explore")) {
      setSelectedIndex("explore");
    } else if (window.location.href.includes("account")) {
      setSelectedIndex("account");
    } else if (window.location.href.includes("trade")) {
      setSelectedIndex("trade");
    } else if (window.location.href.includes("about")) {
      setSelectedIndex("about");
    } else {
      setSelectedIndex("home");
    }
  }, []);

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
                  href={e.href}
                  style={{
                    color: selectedIndex === e.name ? "#BA0202" : "undefined",
                  }}
                >
                  {e.name}
                </Button>
              );
            })}
          </Grid>
          <Grid item className={classes.buttonContainer}>
            <UnlockButton />
          </Grid>
        </Grid>
      </AppBar>
    </div>
  );
};

export default TopBar;
