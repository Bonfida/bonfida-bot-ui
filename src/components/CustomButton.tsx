import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  button: {
    color: "white",
    background: "#BA0202",
    width: "auto",
    borderRadius: "8px",
    height: "50px",
    "&:hover": {
      background: "white",
      color: "#BA0202",
    },
  },
  text: {
    textTransform: "capitalize",
    fontWeight: "bold",
    padding: "8px",
  },
});

const onClick = () => {
  console.log("Clicked");
};

const CustomButton = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) => {
  const classes = useStyles();
  return (
    <Button variant="contained" className={classes.button} onClick={onClick}>
      <Typography className={classes.text}>{title}</Typography>
    </Button>
  );
};

export default CustomButton;
