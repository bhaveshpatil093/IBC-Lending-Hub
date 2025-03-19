import React from 'react';
import { useContract } from '../src/useContract';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Lending from '../components/Lending';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IBCTransfer from '@/components/IBCTransfer';

const App: React.FC = () => {
  const { 
    //queryValue, executeIncrement, executeDecrement, executeSet, 
    client, isClientReady, connectWallet, disconnectWallet, walletAddress } = useContract();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isClientReady={isClientReady}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        walletAddress={walletAddress}
      />
      {walletAddress && client ? (
        <>
          <IBCTransfer />
          <Lending
            client={client}
            contractAddress={"neutron1mxgzhkggn8sx3d572wn27d99rwzf89x2kdc2g90yst8pzpk5mndsp32he7"}
            userAddress={walletAddress}
          />
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-8 py-4">Please connect your wallet</h2>
        </>
      )}
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default App;