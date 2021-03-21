import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '../Link';
import HelpUrls from '../../utils/HelpUrls';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90px',
    background: '#FFE7B4',
  },
  list: {
    margin: 0,
    paddingLeft: 0,
    listStyle: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  listItem: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    fontSize: '14px',
    fontWeight: 900,
    textTransform: 'capitalize',
    color: 'rgb(131,131,131)',
  },
});

interface footerElementI {
  name: string;
  link: string;
}

const listElement: footerElementI[] = [
  { name: 'Discord', link: HelpUrls.discord },
  { name: 'Github', link: HelpUrls.github },
  { name: 'Twitter', link: HelpUrls.twitter },
  { name: 'Medium', link: HelpUrls.medium },
];

const Footer = () => {
  const classes = useStyles();
  return (
    <>
      <footer className={classes.root}>
        <ul className={classes.list}>
          {listElement.map((e, i) => {
            return (
              <Link
                key={`footer-${i}`}
                external
                to={e.link}
                style={{ textDecoration: 'none' }}
              >
                <li className={classes.listItem}>{e.name}</li>
              </Link>
            );
          })}
        </ul>
        <Typography variant="body1">
          FIDA is not offered within the United States or prohibited
          jurisdiction.
        </Typography>
      </footer>
    </>
  );
};

export default Footer;
