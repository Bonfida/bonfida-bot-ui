import React from 'react';
import { notify } from '../utils/notifications';
import Button from '@material-ui/core/Button';
import copy from '../assets/components/SendReceiveDialog/copy.svg';

const CopyableDisplay = ({ text }: { text: string }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    notify({ message: 'Copied!' });
  };

  return (
    <>
      <Button onClick={copyToClipboard}>
        <img src={copy} height="20px" alt="" />
      </Button>
    </>
  );
};

export default CopyableDisplay;
