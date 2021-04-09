import React from 'react';
import { Trans as TransI18next, useTranslation } from 'react-i18next';

const Trans = ({
  children,
  i18nKey,
}: {
  children: React.ReactNode;
  i18nKey?: string;
}) => {
  const { t } = useTranslation();
  if (i18nKey) {
    return <TransI18next i18nKey={i18nKey}>{children}</TransI18next>;
  }
  return <TransI18next t={t}>{children}</TransI18next>;
};

export default Trans;
