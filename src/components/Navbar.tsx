import React, { useState } from 'react';
import Image from 'next/image';
import Oracle from '../components/Oracle';

interface NavbarProps {
  isClientReady: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  walletAddress: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ isClientReady, connectWallet, disconnectWallet, walletAddress }) => {
  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setShowDisconnect(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
      <Image
          src="/ibclendinghublogo.jpeg"
          alt="IBC LendingHub Logo"
          width={70}
          height={20}
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold">IBC Lending Hub</h1>
        <Oracle/>
        <div>
          {isClientReady ? (
            <div className="relative">
              <button
                onClick={() => setShowDisconnect(!showDisconnect)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Wallet Connected'}
              </button>
              {showDisconnect && (
                <button
                  onClick={handleDisconnect}
                  className="absolute right-0 top-full mt-2 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Disconnect
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;