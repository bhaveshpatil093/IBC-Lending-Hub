import { useState } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { ExecuteMsg, QueryMsg, BalanceResponse, AllBalancesResponse, AllDepositorsResponse } from './lendingTypes';

const useLending = (client: SigningCosmWasmClient, contractAddress: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = async (msg: ExecuteMsg, senderAddress: string, funds: { denom: string; amount: string }[] = []) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.execute(senderAddress, contractAddress, msg, "auto", undefined, funds);
            setLoading(false);
            return result;
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
            setLoading(false);
            throw err;
        }
    };

    const query = async (msg: QueryMsg) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.queryContractSmart(contractAddress, msg);
            setLoading(false);
            return result;
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
            setLoading(false);
            throw err;
        }
    };

    const deposit = async (senderAddress: string, amount: string, denom: string, days: string, interest: string) => {
        const msg: ExecuteMsg = { deposit: { days, interest } };
        const funds = [{ denom, amount }];
        return execute(msg, senderAddress, funds);
    };

    const withdraw = async (senderAddress: string, amount: string, denom: string) => {
        const msg: ExecuteMsg = { withdraw: { amount, denom } };
        return execute(msg, senderAddress);
    };

    const takeLoan = async (senderAddress: string, depositor: string, denom: string, collateral: string) => {
        const msg: ExecuteMsg = { take_loan: { depositor, denom, collateral } };
        return execute(msg, senderAddress);
    };

    const getBalance = async (address: string, denom: string): Promise<BalanceResponse> => {
        const msg: QueryMsg = { balance: { address, denom } };
        return query(msg);
    };

    const getAllBalances = async (address: string): Promise<AllBalancesResponse> => {
        const msg: QueryMsg = { all_balances: { address } };
        return query(msg);
    };

    const getAllDepositors = async (): Promise<AllDepositorsResponse> => {
        const msg: QueryMsg = { all_depositors: {} };
        return query(msg);
    };

    return {
        loading,
        error,
        deposit,
        withdraw,
        takeLoan,
        getBalance,
        getAllBalances,
        getAllDepositors,
    };
};

export default useLending;