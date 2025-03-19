import React, { useState } from 'react';
import { SigningStargateClient } from '@cosmjs/stargate';
import { toast } from 'react-toastify';

const IBCTransfer = () => {
  const [amount, setAmount] = useState('');
  const [status, 
    //setStatus
  ] = useState('');

  const initializeKeplr = async () => {
    if (!window.keplr) {
      alert("Please install Keplr extension");
      return;
    }

    if (window.keplr.experimentalSuggestChain) {
      await window.keplr.experimentalSuggestChain({
        chainId: "neutron-1",
        chainName: "Neutron Testnet",
        rpc: "https://rpc-testnet.neutron.org",
        rest: "https://rest-testnet.neutron.org",
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "neutron",
          bech32PrefixAccPub: "neutronpub",
          bech32PrefixValAddr: "neutronvaloper",
          bech32PrefixValPub: "neutronvaloperpub",
          bech32PrefixConsAddr: "neutronvalcons",
          bech32PrefixConsPub: "neutronvalconspub",
        },
        currencies: [{
          coinDenom: "NTRN",
          coinMinimalDenom: "untrn",
          coinDecimals: 6
        }],
        feeCurrencies: [{
          coinDenom: "NTRN",
          coinMinimalDenom: "untrn",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        }],
        stakeCurrency: {
          coinDenom: "NTRN",
          coinMinimalDenom: "untrn",
          coinDecimals: 6
        },
      });
    } else {
      alert("Keplr extension does not support experimentalSuggestChain");
    }
  };

  const handleTransfer = async () => {
    console.log("Transfer started");
    try {
      await initializeKeplr();

      if (!window.keplr) {
        alert("Please install Keplr extension");
        return;
      }

      await window.keplr.enable("provider");
      const offlineSigner = window.keplr.getOfflineSigner("provider");
      const accounts = await offlineSigner.getAccounts();
      const client = await SigningStargateClient.connectWithSigner(
        "https://rpc.provider-sentry-02.ics-testnet.polypore.xyz",
        offlineSigner
      );

      // Fetch the current block height
      const latestBlock = await client.getBlock();
      const currentHeight = latestBlock.header.height;


      // Prepare IBC transfer
      const msg = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: {
          sourcePort: "transfer",
          sourceChannel: "channel-32",
          token: {
            denom: "uatom",
            amount: amount,
          },
          sender: accounts[0].address,
          receiver: "neutron1k4yz49x60n72ppmf35uf54rddn0qv7t46pw6fj",
          timeoutHeight: {
            revisionNumber: 1,
            revisionHeight: currentHeight + 100000000,
          },
        },
      };

      // Send IBC transfer
      const fee = {
        amount: [{ denom: "uatom", amount: "5000" }],
        gas: "200000",
      };
      await client.signAndBroadcast(accounts[0].address, [msg], fee);
      //setStatus(result.transactionHash);
      toast.success("Transfer successful");
    } catch (error) {
      if (error instanceof Error) {
        //console.error("Transfer failed:", error.message);
        //setStatus(`Transfer failed: ${error.message}`);
        toast.error(`Transfer failed: ${error.message}`);
      } else {
        //console.error("Transfer failed:", error);
        //setStatus("Transfer failed: An unknown error occurred");
        toast.error("Transfer failed: An unknown error occurred");
      }
    }
  };

  return (
    <div>
      <h2>IBC Transfer: ATOM from Cosmos Hub to Neutron Testnet</h2>
      <input
        type="text"
        value={amount}
        className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in uatom"
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleTransfer}>Transfer</button>
      <p>{status}</p>
    </div>
  );
};

export default IBCTransfer;