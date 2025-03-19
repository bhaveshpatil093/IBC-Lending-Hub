import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface HomeProps {
  queryValue: () => Promise<number>;
  executeIncrement: () => Promise<void>;
  executeDecrement: () => Promise<void>;
  executeSet: (value: number) => Promise<void>;
  isClientReady: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  walletAddress: string | null;
}

const Home: React.FC<HomeProps> = ({ queryValue, executeIncrement, executeDecrement, executeSet, isClientReady }) => {
  const [count, setCount] = useState<number | null>(null);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isClientReady) {
      const fetchCount = async () => {
        try {
          const value = await queryValue();
          setCount(value);
        } catch (error) {
          console.error('Error querying value:', error);
        }
      };
      fetchCount();
    }
  }, [isClientReady, queryValue]);

  const handleIncrement = async () => {
    setLoading(true);
    try {
      await executeIncrement();
      const newValue = await queryValue();
      setCount(newValue);
    } catch (error) {
      console.error('Error incrementing count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async () => {
    setLoading(true);
    try {
      await executeDecrement();
      const newValue = await queryValue();
      setCount(newValue);
    } catch (error) {
      console.error('Error decrementing count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSet = async () => {
    setLoading(true);
    try {
      const value = parseInt(newValue);
      if (!isNaN(value)) {
        await executeSet(value);
        const newCount = await queryValue();
        setCount(newCount);
        setNewValue('');
      }
    } catch (error) {
      console.error('Error setting value:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="loader"></div>
        </div>
      )}
      <div>

        {isClientReady ? (
          <div className='py-8'>
            <h2 className="text-3xl font-bold mb-8">Counter Value: {count !== null ? count : 'Loading...'}</h2>
            <div className="space-y-4 mb-8">
              <div className="space-x-4">
                <button
                  onClick={handleIncrement}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Increment
                </button>
                <button
                  onClick={handleDecrement}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Decrement
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="New value"
                  className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                />
                <button
                  onClick={handleSet}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Set Value
                </button>
              </div>
            </div>
            {count && count === 100 && (
              <Image
                src="/adrien.png"
                alt="adrien"
                width={150}
                height={150}
                className="rounded-full"
              />
            )}
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8 py-4">Please connect your wallet</h2>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;