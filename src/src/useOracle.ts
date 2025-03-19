// useOracle.ts

import { useState, useEffect } from 'react';
import { PriceResponse, CurrencyPairsResponse, QueryMsg } from './oracleTypes';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

const CONTRACT_ADDRESS = 'neutron1mwvu2rejxmfz34fe36y8x27hl04n5vc6ylx9g63wa547payva8mqva567k';
//const CHAIN_ID = 'pion-1';

export const useOracle = () => {
  const [client, setClient] = useState<CosmWasmClient | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const client = await CosmWasmClient.connect('https://rpc-palvus.pion-1.ntrn.tech:443');
      setClient(client);
    };

    initClient();
  }, []);

  const queryPrice = async (base: string, quote: string): Promise<PriceResponse | null> => {
    if (!client) return null;

    const queryMsg: QueryMsg = { price: { base, quote } };
    const response = await client.queryContractSmart(CONTRACT_ADDRESS, queryMsg);
    return response as PriceResponse;
  };

  const queryCurrencyPairs = async (): Promise<CurrencyPairsResponse | null> => {
    if (!client) return null;

    console.log('Querying currency pairs');
    const queryMsg: QueryMsg = { currency_pairs: {} };
    const response = await client.queryContractSmart(CONTRACT_ADDRESS, queryMsg);
    return response as CurrencyPairsResponse;
  };

  return {
    queryPrice,
    queryCurrencyPairs,
  };
};