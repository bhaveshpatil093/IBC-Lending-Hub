import React, { useState, useEffect } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import useLending from '../src/useLending';
//import { DepositorInfo } from '../src/lendingTypes';
import { toast } from 'react-toastify';

interface LendingComponentProps {
    client: SigningCosmWasmClient;
    contractAddress: string;
    userAddress: string;
}

const LendingComponent: React.FC<LendingComponentProps> = ({ client, contractAddress, userAddress }) => {
    const { error, deposit, withdraw, takeLoan, 
        //getBalance, 
        getAllBalances, 
        //getAllDepositors 
    } = useLending(client, contractAddress);
    const [days, setDays] = useState('');
    const [interest, setInterest] = useState('');
    const [amount, setAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawDenom, setWithdrawDenom] = useState('');
    const [collateral, setCollateral] = useState('');
    const [denom, setDenom] = useState('');
    const [balances, setBalances] = useState<{ denom: string; amount: string }[]>([]);
    const [loading, setLoading] = useState(false);
    //const [depositors, setDepositors] = useState<DepositorInfo[]>([]);

    /*
    useEffect(() => {
        const fetchDepositors = async () => {
            try {
                const response = await getAllDepositors();
                setDepositors(response.depositors);
            } catch (err) {
                console.error(err);
            }
        };

        fetchDepositors();
    }, [getAllDepositors]);
    */

    useEffect(() => {
      const fetchBalances = async () => {
        try {
          const result = await getAllBalances(userAddress);
          if (result && Array.isArray(result.balances)) {
            setBalances(result.balances);
          } else {
            console.error('Unexpected balances format:', result);
          }
        } catch (err) {
          console.error('Failed to fetch balances:', err);
        }
      };
    
      fetchBalances();
    }, [userAddress, loading, getAllBalances]);

    const handleDeposit = async () => {
        setLoading(true);
        try {
            const denom = "ibc/D1283F23CC25C39F16BCFB2DFFA9997AE7A101B92810D0F9F0AA092F6FE332D0";
            const amountCorrected = (Number(amount) * 1000000).toString();
            await deposit(userAddress, amountCorrected, denom, days, interest);
            toast.success("Deposit successful");
        } catch (err) {
            toast.error(`Deposit failed: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        setLoading(true);
        try {
            const amountCorrected = (Number(withdrawAmount) * 1000000).toString();
            await withdraw(userAddress, amountCorrected, withdrawDenom);
            toast.success("Withdraw successful");
        } catch (err) {
            toast.error(`Withdraw failed: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeLoan = async () => {
        setLoading(true);
        try {
            await takeLoan(userAddress, userAddress, denom, collateral);
            toast.success("Take deposit successful");
        } catch (err) {
            toast.error(`Take deposit failed: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="loader"></div>
                </div>
            )}
            <h1>Lending Component</h1>
            {error && <p>Error: {error}</p>}

            <div>
                <h2>Balances</h2>
                {balances.length > 0 ? (
                    <ul>
                        {balances.map((balance, index) => (
                            <li key={index}>
                                {balance.denom === 'ibc/D1283F23CC25C39F16BCFB2DFFA9997AE7A101B92810D0F9F0AA092F6FE332D0' ? 'ATOM' : balance.denom === 'untrn' ? 'NTRN' : balance.denom}: {Number(balance.amount)/1000000}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No balances found</p>
                )}
            </div>

            {/*
            <div>
                <h2>All Depositors</h2>
                <ul>
                    {depositors.map((depositor, index) => (
                        <li key={index}>
                            Address: {depositor.address}, Denom: {depositor.denom}, Days: {depositor.days}, Interest Rate: {depositor.interest_rate}, Amount: {depositor.amount}
                        </li>
                    ))}
                </ul>
            </div>
            */}

            <div className="flex items-center space-x-2">
                <h2>Deposit</h2>
                <input
                    type="text"
                    placeholder="Amount"
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Days"
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Interest"
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                />
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleDeposit}>Deposit</button>
            </div>

            <div className="flex items-center space-x-2">
                <h2>Withdraw</h2>
                <input
                    type="text"
                    placeholder="Amount"
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <select
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                    value={withdrawDenom}
                    onChange={(e) => setWithdrawDenom(e.target.value)}
                >
                    <option value="" disabled>Select Denom</option>
                    {balances.map((balance, index) => (
                        <option key={index} value={balance.denom}>
                            {balance.denom === 'ibc/D1283F23CC25C39F16BCFB2DFFA9997AE7A101B92810D0F9F0AA092F6FE332D0' ? 'ATOM' : balance.denom === 'untrn' ? 'NTRN' : balance.denom}
                        </option>
                    ))}
                </select>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleWithdraw}>Withdraw</button>
            </div>

            <div className="flex items-center space-x-2">
                <h2>Take Deposit</h2>
                <input
                    type="text"
                    placeholder="Denom"
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                    value={denom}
                    onChange={(e) => setDenom(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Collateral"
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                />
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleTakeLoan}>Take Loan</button>
            </div>
        </div>
    );
};

export default LendingComponent;