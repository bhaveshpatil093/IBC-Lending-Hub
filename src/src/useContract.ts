import { useEffect, useState } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import { ExecuteMsg, CounterResponse } from './contractTypes';

const CONTRACT_ADDRESS = 'neutron109xx6cmdh94y6ht6ruf9d0kju3w65y4727enlnnpqkzmfay270cs0uj3eg';

export function useContract() {
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    console.log('isClientReady changed:', isClientReady);
  }, [isClientReady]);

  const connectWallet = async () => {
    try {
      if (window.keplr) {
        console.log('Keplr wallet found');
        await window.keplr.enable('pion-1');
        const offlineSigner = window.keplr.getOfflineSigner('pion-1');
        const client = await SigningCosmWasmClient.connectWithSigner(
          'https://rpc-palvus.pion-1.ntrn.tech:443',
          offlineSigner,
          { gasPrice: GasPrice.fromString('0.025untrn') }
        );
        setClient(client);

        const accounts = await offlineSigner.getAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
          console.log('Wallet address set:', accounts[0].address);
        }
        setIsClientReady(true);
      } else {
        console.error('Keplr wallet not found');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const queryValue = async (): Promise<number> => {
    if (!client) throw new Error('Client not initialized');
    const result: CounterResponse = await client.queryContractSmart(CONTRACT_ADDRESS, { value: {} });
    return result.value;
  };

  const executeIncrement = async () => {
    if (!client || !walletAddress) throw new Error('Client or wallet not initialized');
    const msg: ExecuteMsg = { inc: {} };
    await client.execute(walletAddress, CONTRACT_ADDRESS, msg, 'auto');
  };

  const executeDecrement = async () => {
    if (!client || !walletAddress) throw new Error('Client or wallet not initialized');
    const msg: ExecuteMsg = { dec: {} };
    await client.execute(walletAddress, CONTRACT_ADDRESS, msg, 'auto');
  };

  const executeSet = async (value: number) => {
    if (!client || !walletAddress) throw new Error('Client or wallet not initialized');
    const msg: ExecuteMsg = { set: { value } };
    await client.execute(walletAddress, CONTRACT_ADDRESS, msg, 'auto');
  };

  const disconnectWallet = () => {
    setClient(null);
    setIsClientReady(false);
    setWalletAddress(null);
  };

  return { queryValue, executeIncrement, executeDecrement, executeSet, client, isClientReady, walletAddress, connectWallet, disconnectWallet };
}