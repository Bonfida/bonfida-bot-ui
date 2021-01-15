import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '../Link';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60px',
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
    padding: '20px',
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
  { name: 'Contact', link: 'mailto:contact@bonfida.com' },
  { name: 'Discord', link: 'https://discord.com' },
  { name: 'Github', link: 'https://github.com' },
  { name: 'Twitter', link: 'https://twitter.com' },
  { name: 'Medium', link: 'https://medium.com' },
];

const Footer = () => {
  const classes = useStyles();
  return (
    <>
      <footer className={classes.root}>
        <ul className={classes.list}>
          {listElement.map((e) => {
            return (
              <Link external to={e.link} style={{ textDecoration: 'none' }}>
                <li className={classes.listItem}>{e.name}</li>
              </Link>
            );
          })}
        </ul>
      </footer>
    </>
  );
};

export default Footer;
