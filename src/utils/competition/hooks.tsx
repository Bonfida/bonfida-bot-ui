import React, { useEffect, useState } from 'react';
import { useConnection } from '../connection';
import { COMPETITION_BOTS } from './bots';
import { PublicKey } from '@solana/web3.js';
import { fetchPoolBalances } from '@bonfida/bot';
import bs58 from 'bs58';
import { getTokenPrice } from '../markets';
import { useAsyncData } from '../fetch-loop';
import tuple from 'immutable-tuple';
import { Pool } from '../pools';

export interface BotWithPerf {
  name: string;
  poolSeed: PublicKey;
  description: string | JSX.Element;
  mintAddress: PublicKey;
  initialPoolTokenUsdValue: number | undefined;
  performance: number;
  tokenValue: number;
}

export const useBotCompetitionPerformance = () => {
  const connection = useConnection();
  const _get = async (bot: Pool) => {
    console.log(bot.name);
    let usdValue = 0;
    const poolBalances = await fetchPoolBalances(
      connection,
      bs58.decode(bot.poolSeed.toBase58()),
    );
    if (!poolBalances[0]?.uiAmount || !bot.initialPoolTokenUsdValue) {
      return;
    }
    for (let balance of poolBalances[1]) {
      if (!balance.tokenAmount.uiAmount) {
        continue;
      }
      const price = await getTokenPrice(balance.mint);
      usdValue += price * balance.tokenAmount.uiAmount;
    }
    const tokenValue = usdValue / poolBalances[0]?.uiAmount;
    const performance = 100 * (tokenValue / bot.initialPoolTokenUsdValue - 1);
    const botWithPerf: BotWithPerf = {
      name: bot.name,
      poolSeed: bot.poolSeed,
      description: bot.description,
      mintAddress: bot.mintAddress,
      initialPoolTokenUsdValue: bot.initialPoolTokenUsdValue,
      performance: performance,
      tokenValue: tokenValue,
    };
    return botWithPerf;
  };
  const get = async () => {
    return Promise.all(COMPETITION_BOTS.map((bot) => _get(bot)));
  };
  return useAsyncData(get, tuple('useBotCompetitionPerformance', connection));
};
