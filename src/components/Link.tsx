import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Link = ({ external = false, ...props }) => {
  let { to, children, ...rest } = props;
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <RouterLink to={to} {...rest}>
      {children}
    </RouterLink>
  );
};

export default Link;

export const ExplorerLink = ({
  address,
  tx,
  children,
}: {
  address?: string;
  tx?: string;
  children: React.ReactNode;
}) => {
  if (address) {
    return (
      <Link
        external
        to={`https://explorer.solana.com/address/${address}`}
        style={{ color: 'black' }}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link external to={`https://explorer.solana.com/tx/${tx}`}>
      {children}
    </Link>
  );
};
