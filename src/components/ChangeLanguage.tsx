import React from 'react';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const ChangeLanguage = () => {
  const { i18n } = useTranslation();
  return (
    <Button
      onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')}
    >
      {i18n.language}
    </Button>
  );
};

export default ChangeLanguage;
